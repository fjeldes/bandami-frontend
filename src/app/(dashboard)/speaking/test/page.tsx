"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getQuestions, createSpeakingExam, submitSpeakingEvaluation } from "@/lib/api";
import RichTextRenderer from "@/components/ui/RichTextRenderer";
import type { Question, Exam } from "@/lib/types";

type Phase = "load" | "mic-test" | "ready" | "single-prep" | "intro" | "part1-speak" | "part2-prep" | "part2-speak" | "part3-speak" | "preview" | "submitting";

const PART_TIMERS: Record<string, number> = {
  "part1": 120,
  "single-prep": 60,
  "part2-prep": 60,
  "part2-speak": 120,
  "part3": 180,
  "single": 120,
};

const SPEAKING_TIPS = [
  "Using a variety of complex sentence structures can help you reach <span class=\"font-bold\">Band 7.0+</span> in Grammatical Range. Try incorporating relative clauses or conditional sentences (if/then) to showcase your depth.",
  "Avoid long pauses by using natural fillers like <span class=\"italic\">\"well...\"</span>, <span class=\"italic\">\"let me think...\"</span>, or <span class=\"italic\">\"that's an interesting question...\"</span>. These sound more natural than silence and buy you thinking time.",
  "Paraphrasing the examiner's question in your answer demonstrates <span class=\"font-bold\">Lexical Resource</span> at Band 7+. Instead of repeating keywords, use synonyms and rephrase the prompt.",
  "To score <span class=\"font-bold\">Band 7+</span> in Pronunciation, focus on sentence stress — emphasize the <span class=\"underline\">key words</span> that carry meaning rather than speaking in a flat monotone.",
  "Idiomatic language like <span class=\"italic\">\"over the moon\"</span> or <span class=\"italic\">\"a piece of cake\"</span> can boost your <span class=\"font-bold\">Lexical Resource</span> score, but only use expressions you're confident with. Misused idioms hurt more than they help.",
  "In Part 2, structure your long turn with a clear <span class=\"font-bold\">beginning → middle → end</span>. Start by introducing the topic, then give 2-3 supporting details, and finish with a concluding thought.",
  "Grammatical range isn't just about complex sentences — it's about <span class=\"font-bold\">variety</span>. Mix simple, compound, and complex structures naturally. A speech with only complex sentences sounds forced.",
  "When you make a grammar mistake, self-correcting shows the examiner you're aware of the error. This is actually <span class=\"font-bold\">positive</span> for your Fluency score — it shows monitoring ability.",
  "For <span class=\"font-bold\">Band 8+</span> in Fluency, your speech should flow with only rare pauses. Practice speaking on unfamiliar topics for 1-2 minutes daily without stopping to build this skill.",
  "Discourse markers like <span class=\"italic\">\"firstly\"</span>, <span class=\"italic\">\"on the other hand\"</span>, <span class=\"italic\">\"as a result\"</span>, and <span class=\"italic\">\"in contrast\"</span> are essential for <span class=\"font-bold\">Coherence</span>. They guide the listener through your ideas.",
  "In Part 3, always expand your answers. Give an <span class=\"font-bold\">opinion → reason → example</span>. One-sentence answers will cap your Fluency score at Band 5.",
  "Pronunciation clarity matters more than accent. Focus on <span class=\"font-bold\">word endings</span> (-ed, -s, -tion) and <span class=\"font-bold\">consonant clusters</span>. Dropping final sounds is a common reason for lower scores.",
  "Vague language (<span class=\"italic\">\"stuff like that\"</span>, <span class=\"italic\">\"things\"</span>) hurts Lexical Resource. Be specific: instead of <span class=\"italic\">\"I like doing things outside\"</span>, say <span class=\"italic\">\"I enjoy hiking in national parks and kayaking on weekends\"</span>.",
  "To improve Grammatical Range, master the <span class=\"font-bold\">3rd conditional</span> (<span class=\"italic\">\"If I had known, I would have...\"</span>) and <span class=\"font-bold\">passive voice</span> (<span class=\"italic\">\"It was decided that...\"</span>). These structures signal Band 7+ level.",
  "In Part 1, don't give memorized answers. Examiners are trained to detect scripted responses. Answer naturally with <span class=\"font-bold\">2-3 sentences</span> per question — enough to show language, not so much you dominate the clock.",
];

function groupByPart(questions: Question[]) {
  const groups: Record<string, Question[]> = {};
  for (const q of questions) {
    const part = q.module || "part2";
    if (!groups[part]) groups[part] = [];
    groups[part].push(q);
  }
  return groups;
}

function stripHtml(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function speakText(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const plainText = stripHtml(text);
  const u = new SpeechSynthesisUtterance(plainText);
  u.lang = "en-US";
  u.rate = 0.85;
  u.pitch = 1;
  u.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const best = voices.find((v) => v.name.includes("Samantha") && v.lang.startsWith("en"))
    || voices.find((v) => v.name.includes("Google") && v.lang.startsWith("en") && !v.name.includes("Male"))
    || voices.find((v) => v.lang.startsWith("en-US"))
    || voices.find((v) => v.lang.startsWith("en-GB"));
  if (best) u.voice = best;
  window.speechSynthesis.speak(u);
}

// Preload voices on first interaction
if (typeof window !== "undefined") {
  window.speechSynthesis?.getVoices();
  window.speechSynthesis?.addEventListener("voiceschanged", () => window.speechSynthesis?.getVoices());
}

export default function SpeakingTestPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const questionId = searchParams.get("id");
  const retryExamId = searchParams.get("examId");

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [targetQuestion, setTargetQuestion] = useState<Question | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [phase, setPhase] = useState<Phase>("load");
  const [error, setError] = useState("");
  const [showInterruptedBanner, setShowInterruptedBanner] = useState(false);

  const [micOk, setMicOk] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [micBars, setMicBars] = useState<number[]>(Array(40).fill(4));

  const [currentPart, setCurrentPart] = useState("");
  const [questionIdx, setQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const [recordingBlobs, setRecordingBlobs] = useState<Blob[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingActive, setRecordingActive] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animRef = useRef<number>(0);
  const currentTipRef = useRef(SPEAKING_TIPS[Math.floor(Math.random() * SPEAKING_TIPS.length)]);

  const isSingleMode = !!questionId;
  const grouped = groupByPart(allQuestions);
  const partOrder = isSingleMode ? [] : ["part1", "part2", "part3"].filter((p) => grouped[p]?.length);
  const currentQuestions = grouped[currentPart] || [];
  const currentQuestion = isSingleMode ? targetQuestion : currentQuestions[questionIdx];

  useEffect(() => {
    if (exam) return;
    if (typeof window !== "undefined" && localStorage.getItem("speaking_test_in_progress")) {
      setShowInterruptedBanner(true);
    }

    if (retryExamId) {
      setExam({ id: retryExamId } as Exam);
      getQuestions({ exam_type: "speaking" })
        .then((qs) => {
          if (!qs.length) throw new Error("No speaking questions available");
          setAllQuestions(qs);
          if (questionId) {
            const found = qs.find((q) => q.id === questionId);
            if (!found) throw new Error("Question not found");
            setTargetQuestion(found);
          }
        })
        .then(() => setPhase("mic-test"))
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
      return;
    }

    getQuestions({ exam_type: "speaking" })
      .then((qs) => {
        if (!qs.length) throw new Error("No speaking questions available");
        setAllQuestions(qs);
        if (questionId) {
          const found = qs.find((q) => q.id === questionId);
          if (!found) throw new Error("Question not found");
          setTargetQuestion(found);
        }
        return createSpeakingExam({ exam_type: "speaking", question_id: questionId || undefined });
      })
      .then((newExam) => {
        setExam(newExam);
        if (typeof window !== "undefined") {
          localStorage.setItem("speaking_test_in_progress", JSON.stringify({ examId: newExam.id, startedAt: Date.now() }));
        }
      })
      .then(() => setPhase("mic-test"))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [questionId, retryExamId]);

  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      animRef.current && cancelAnimationFrame(animRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, [phase]);

  const testMic = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicOk(true);
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteFrequencyData(dataArray);
        const step = Math.max(1, Math.floor(dataArray.length / 40));
        const bars: number[] = [];
        for (let i = 0; i < 40; i++) {
          const slice = dataArray.slice(i * step, (i + 1) * step);
          const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
          bars.push(Math.max(4, Math.round((avg / 128) * 80)));
        }
        setMicBars(bars);
        const totalAvg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setMicLevel(Math.min(100, Math.round((totalAvg / 128) * 100)));
        animRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch {
      setError("Microphone access denied. Please allow microphone permissions.");
    }
  };

  const startTimer = (seconds: number, onExpire?: () => void) => {
    setTimeLeft(seconds);
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => onExpire?.(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    const recorder = new MediaRecorder(streamRef.current, { mimeType: "audio/webm" });
    recorderRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      if (isSingleMode) {
        setAudioBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        setPhase("preview");
      } else {
        setRecordingBlobs((prev) => [...prev, blob]);
      }
    };
    recorder.start();
    setRecordingActive(true);
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
    timerRef.current && clearInterval(timerRef.current);
    setRecordingActive(false);
  };

  // ---- Single-mode handlers ----
  const beginSingleRecordingAfterPrep = () => {
    timerRef.current && clearInterval(timerRef.current);
    setTimeLeft(0);
    speakText("Start speaking now.");
    startTimer(PART_TIMERS["single"], () => stopSingleRecording());
    startRecording();
  };

  const startSingleTest = () => {
    if (targetQuestion?.module === "part2") {
      setPhase("single-prep");
      setTimeout(() => { if (targetQuestion) speakText(targetQuestion.prompt_text); }, 400);
      startTimer(PART_TIMERS["single-prep"], beginSingleRecordingAfterPrep);
    } else {
      setPhase("ready");
      setTimeout(() => { if (targetQuestion) speakText(targetQuestion.prompt_text); }, 400);
    }
  };

  const beginSingleRecording = () => {
    startTimer(PART_TIMERS["single"], () => stopSingleRecording());
    startRecording();
  };

  const stopSingleRecording = () => {
    recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecordingActive(false);
  };

  const handleSingleSubmit = useCallback(async () => {
    if (!exam || !audioBlob) return;
    setPhase("submitting");
    setError("");
    try {
      await submitSpeakingEvaluation(exam.id, audioBlob);
      if (typeof window !== "undefined") localStorage.removeItem("speaking_test_in_progress");
      router.push(`/speaking/results?examId=${exam.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit";
      if (msg.includes("503") || msg.includes("UNAVAILABLE")) {
        router.push("/history");
      } else {
        setError(msg);
        setPhase("preview");
      }
    }
  }, [exam, audioBlob, router]);

  // ---- Multi-part handlers ----
  const nextQuestion = () => {
    stopRecording();
    const nextIdx = questionIdx + 1;
    if (nextIdx < currentQuestions.length) {
      setQuestionIdx(nextIdx);
      const q = currentQuestions[nextIdx];
      if (q) {
        setPhase(currentPart === "part1" ? "part1-speak" : "part3-speak");
        setTimeout(() => speakText(q.prompt_text), 400);
      }
    } else {
      finishCurrentPart();
    }
  };

  const finishCurrentPart = () => {
    stopRecording();
    timerRef.current && clearInterval(timerRef.current);
    if (currentPart === "part1") {
      beginPart2Prep();
    } else if (currentPart === "part2-speak") {
      const part3Qs = grouped["part3"];
      if (part3Qs?.length) beginPart(3, 0);
      else finishExam();
    } else if (currentPart === "part3") {
      finishExam();
    }
  };

  const beginPart = (partNum: number, idx: number) => {
    const part = `part${partNum}`;
    setCurrentPart(part);
    setQuestionIdx(idx);
    const phaseMap: Record<number, Phase> = { 1: "part1-speak", 3: "part3-speak" };
    setPhase(phaseMap[partNum]);
    const q = grouped[part]?.[idx];
    if (q) setTimeout(() => speakText(q.prompt_text), 500);
  };

  const beginPart2Prep = () => {
    setCurrentPart("part2");
    setQuestionIdx(0);
    setPhase("part2-prep");
    const q = grouped["part2"]?.[0];
    if (q) speakText("You will have one minute to prepare. Your topic is: " + q.prompt_text);
    startTimer(PART_TIMERS["part2-prep"], beginPart2Speak);
  };

  const beginPart2Speak = () => {
    setPhase("part2-speak");
    setTimeLeft(0);
    timerRef.current && clearInterval(timerRef.current);
    speakText("Start speaking now.");
    startTimer(PART_TIMERS["part2-speak"], finishCurrentPart);
    startRecording();
  };

  const finishPart2 = () => {
    stopRecording();
    timerRef.current && clearInterval(timerRef.current);
    const part3Qs = grouped["part3"];
    if (part3Qs?.length) beginPart(3, 0);
    else finishExam();
  };

  const beginExam = () => {
    if (!partOrder.length) return;
    const first = partOrder[0];
    if (first === "part1") beginPart(1, 0);
    else if (first === "part2") beginPart2Prep();
    else if (first === "part3") beginPart(3, 0);
  };

  const finishExam = () => {
    stopRecording();
    if (recordingBlobs.length > 0) {
      const combined = new Blob(recordingBlobs, { type: "audio/webm" });
      setPreviewUrl(URL.createObjectURL(combined));
      setAudioBlob(combined);
    }
    setPhase("preview");
  };

  const handleSubmit = useCallback(async () => {
    if (!exam || !audioBlob) return;
    setPhase("submitting");
    setError("");
    try {
      await submitSpeakingEvaluation(exam.id, audioBlob);
      if (typeof window !== "undefined") localStorage.removeItem("speaking_test_in_progress");
      router.push(`/speaking/results?examId=${exam.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit";
      if (msg.includes("503") || msg.includes("UNAVAILABLE")) {
        router.push("/history");
      } else {
        setError(msg);
        setPhase("preview");
      }
    }
  }, [exam, audioBlob, router]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (phase === "load") {
    return (
      <div className="flex justify-center py-20">
        <span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  if (error && !allQuestions.length && !targetQuestion) {
    return (
      <div className="text-center py-16">
        <p className="text-body-md text-error mb-4">{error}</p>
        <button onClick={() => router.push("/speaking")} className="text-primary font-semibold">Back to Speaking</button>
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 max-w-[720px] mx-auto pt-10 md:pt-16">
        <div className="ds-card p-10 md:p-14 flex flex-col items-center w-full">
          {/* Pulse Animation */}
          <div className="relative w-[120px] h-[120px] mb-10">
            <div className="absolute inset-0 rounded-full bg-primary-container animate-pulse-ring" style={{ animationDelay: "0s" }} />
            <div className="absolute inset-0 rounded-full bg-primary-container animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
            <div className="absolute inset-[25%] rounded-full bg-primary flex items-center justify-center shadow-lg animate-pulse-dot z-10" style={{ boxShadow: "0 0 25px rgba(0, 105, 72, 0.3)" }}>
              <span className="material-symbols-outlined text-on-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
          </div>

          <h1 className="text-headline-lg font-bold text-primary mb-4">Analyzing your response...</h1>
          <p className="text-body-md text-on-surface-variant max-w-md mb-10">
            Our AI is evaluating your fluency, pronunciation, and vocabulary. This usually takes 30-60 seconds.
          </p>

          {/* Waveform bars */}
          <div className="flex items-end justify-center gap-1.5 h-10 mb-10">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="w-1 bg-primary-container rounded-full" style={{
                animation: `waveformBar 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
              }} />
            ))}
          </div>

           {/* Preparation Tip */}
          <div className="w-full pt-8 border-t border-outline-variant/30 text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-tertiary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              <h3 className="text-label-sm text-tertiary uppercase tracking-wider font-bold">Pro Tip</h3>
            </div>
            <div className="p-5 bg-tertiary-fixed/10 rounded-lg border-l-4 border-tertiary">
              <p className="text-body-md text-on-tertiary-fixed-variant leading-relaxed" dangerouslySetInnerHTML={{ __html: currentTipRef.current }} />
            </div>
          </div>
        </div>

        {error === "provider_overloaded" ? (
          <div className="mt-6 bg-error-container/30 border border-error/20 rounded-xl p-5 w-full max-w-md">
            <p className="text-body-md text-error mb-3">The AI evaluation service is temporarily unavailable. This happens when many users are practicing at the same time. Your work is safe — please try again in a moment.</p>
            <button onClick={handleSubmit} className="bg-primary text-on-primary px-5 py-2.5 rounded-lg text-label-sm font-semibold">Retry</button>
          </div>
        ) : error ? (
          <div className="mt-6 bg-error-container/30 border border-error/20 rounded-xl p-5 w-full max-w-md">
            <p className="text-body-md text-error mb-3">{error}</p>
            <button onClick={handleSubmit} className="bg-primary text-on-primary px-5 py-2.5 rounded-lg text-label-sm font-semibold">Retry</button>
          </div>
        ) : null}
      </div>
    );
  }

  // ===== SINGLE QUESTION MODE =====
  if (isSingleMode && targetQuestion) {
    return (
      <div className="max-w-3xl mx-auto">
        {showInterruptedBanner && (
          <div className="mb-4 bg-warning-container/30 border border-warning/30 rounded-xl p-4 flex items-start gap-3 animate-fade-in-up">
            <span className="material-symbols-outlined text-warning shrink-0 mt-0.5">warning</span>
            <div className="flex-1">
              <p className="text-body-md text-on-surface font-semibold">Previous session interrupted</p>
              <p className="text-label-sm text-on-surface-variant">Your last speaking test didn&apos;t finish. A new session has been created.</p>
            </div>
            <button onClick={() => { setShowInterruptedBanner(false); if (typeof window !== "undefined") localStorage.removeItem("speaking_test_in_progress"); }}
              className="p-1 hover:bg-surface-container rounded-lg transition-colors shrink-0">
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
          </div>
        )}
        {phase === "mic-test" && (
        <div className="max-w-2xl mx-auto mt-8 md:mt-12">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700/50 shadow-[0_10px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.2)] p-8 md:p-10 relative overflow-hidden">
              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-[32px] text-blue-600 dark:text-blue-400">mic</span>
                </div>
                <h1 className="text-headline-md font-bold text-slate-800 dark:text-white mb-2">Microphone Check</h1>
                <p className="text-body-md text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Let&apos;s make sure your voice is captured clearly before you start.
                </p>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                {[
                  { icon: "check", label: "Permission", active: micOk, done: micOk },
                  { icon: "mic", label: "Speak Now", active: micOk, done: false },
                  { icon: "check_circle", label: "Confirm", active: false, done: false },
                ].map((s, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700/50 p-4 flex flex-col items-center text-center transition-all duration-500">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${
                      s.done
                        ? "bg-emerald-100 dark:bg-emerald-500/20"
                        : s.active
                        ? "bg-blue-100 dark:bg-blue-500/20 animate-pulse"
                        : "bg-gray-100 dark:bg-slate-700"
                    }`}>
                      <span className={`material-symbols-outlined text-[20px] transition-all duration-500 ${
                        s.done
                          ? "text-emerald-600 dark:text-emerald-400"
                          : s.active
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-400 dark:text-slate-500"
                      }`} style={s.active || s.done ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                        {s.icon}
                      </span>
                    </div>
                    <span className="text-label-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{s.label}</span>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-500 ${
                      s.done
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                        : s.active
                        ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
                    }`}>
                      {s.done ? "Done" : s.active ? "Active" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 mb-6 text-label-sm text-red-700 dark:text-red-400 text-center">{error}</div>
              )}

              {micOk ? (
                <>
                  <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-800/50 rounded-2xl border border-blue-100 dark:border-blue-500/20 p-6 mb-6 text-center">
                    <p className="italic text-blue-700 dark:text-blue-300 font-medium text-body-lg mb-2">&ldquo;I am ready to start my IELTS practice&rdquo;</p>
                    <p className="text-[10px] text-blue-500/60 dark:text-blue-400/60 uppercase tracking-widest font-bold">Read the phrase aloud</p>
                  </div>

                  <div className="h-20 flex items-center justify-center gap-1 px-2 mb-6 overflow-hidden">
                    {micBars.map((h, i) => (
                      <div key={i} className="w-1.5 rounded-full transition-all duration-100" style={{
                        height: `${h}px`,
                        backgroundColor: `hsl(${160 + (h / 80) * 40}, ${60 + (h / 80) * 20}%, ${30 + (h / 80) * 25}%)`,
                        opacity: 0.3 + (h / 80) * 0.7,
                      }} />
                    ))}
                  </div>

                  <p className="text-label-sm text-slate-500 dark:text-slate-400 text-center mb-8">
                    {micLevel > 10
                      ? <span className="flex items-center justify-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> We can hear you clearly!</span>
                      : <span className="flex items-center justify-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Speak a bit louder — we need to calibrate</span>
                    }
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={() => { streamRef.current?.getTracks().forEach((t) => t.stop()); setMicOk(false); setMicLevel(0); setMicBars(Array(40).fill(4)); }}
                      className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-label-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      Test Again
                    </button>
                    <button onClick={isSingleMode ? startSingleTest : () => setPhase("intro")}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 dark:from-blue-600 dark:to-blue-500 text-white text-label-sm font-semibold hover:from-blue-800 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-400 active:scale-[0.97] transition-all shadow-md hover:shadow-lg hover:shadow-blue-500/25">
                      Continue
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <p className="text-body-md text-slate-500 dark:text-slate-400 mb-8">Click the button below to allow microphone access</p>
                    <div className="relative inline-flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse-ring" style={{ animationDelay: "0s" }} />
                      <div className="absolute inset-0 rounded-full bg-blue-500/15 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
                      <button onClick={testMic}
                        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-700 to-blue-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/25 z-10">
                        <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {phase === "ready" && !recordingActive && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700/50 shadow-sm p-8">
              <div className="flex items-center gap-2 mb-5">
                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider">{targetQuestion.module || "part2"}</span>
              </div>
              <h2 className="text-headline-lg font-extrabold text-slate-800 dark:text-white mb-4">{targetQuestion.title || "Speaking Topic"}</h2>
              <RichTextRenderer content={targetQuestion.prompt_text} className="text-body-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8" />
              <div className="flex justify-center gap-4">
                <button onClick={() => setPhase("mic-test")} className="px-6 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-label-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Back</button>
                <button onClick={beginSingleRecording} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 dark:from-blue-600 dark:to-blue-500 text-white text-label-sm font-semibold hover:from-blue-800 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-400 active:scale-[0.97] transition-all shadow-md hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">fiber_manual_record</span> Start Recording
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === "single-prep" && !recordingActive && targetQuestion && (
          <div className="space-y-6 text-center">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-primary-container/30 text-primary text-label-sm font-semibold">Part 2 · Long Turn</span>
              <span className={`font-mono font-bold transition-all duration-300 ${
                timeLeft <= 10
                  ? "text-display-lg text-error animate-pulse"
                  : "text-display-md text-on-surface"
              }`}>
                {fmt(timeLeft)}
              </span>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl border-2 border-primary/20 p-6 text-left shadow-md">
              <h3 className="text-label-sm font-semibold text-primary mb-3 uppercase tracking-widest">Topic Card</h3>
              <RichTextRenderer content={targetQuestion.prompt_text} className="text-body-lg text-on-surface leading-relaxed" />
            </div>
            <div className="w-full max-w-md mx-auto space-y-3">
              <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    timeLeft <= 10 ? "bg-error" : "bg-primary"
                  }`}
                  style={{ width: `${((PART_TIMERS["single-prep"] - timeLeft) / PART_TIMERS["single-prep"]) * 100}%` }}
                />
              </div>
              <p className={`text-body-md flex items-center justify-center gap-2 ${
                timeLeft <= 10 ? "text-error font-semibold animate-pulse" : "text-on-surface-variant"
              }`}>
                <span className="material-symbols-outlined text-[18px]">
                  {timeLeft <= 10 ? "alarm" : "hourglass_bottom"}
                </span>
                {timeLeft <= 10 ? "Start speaking shortly!" : "Prepare your response. Do not speak yet."}
              </p>
            </div>
            <button
              onClick={beginSingleRecordingAfterPrep}
              className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Skip Timer · Start Speaking
            </button>
          </div>
        )}

        {isSingleMode && recordingActive && (
          <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-label-sm uppercase">{targetQuestion?.module || "part2"}</span>
              </div>
              <RichTextRenderer content={targetQuestion?.prompt_text || ""} className="text-body-md text-on-surface-variant leading-relaxed line-clamp-3" />
            </div>
            <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-10 flex flex-col items-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary rounded-full blur-3xl -ml-32 -mb-32" />
              </div>
              <div className="flex items-end justify-center gap-1.5 h-16 mb-10 w-full max-w-md relative z-10 overflow-hidden">
                {micBars.map((h, i) => (
                  <div key={i} className="w-1.5 rounded-full transition-all duration-100" style={{
                    height: `${Math.max(3, h)}px`,
                    opacity: 0.25 + (h / 90) * 0.75,
                    backgroundColor: `hsl(${155 + (h / 90) * 40}, ${55 + (h / 90) * 35}%, ${25 + (h / 90) * 35}%)`,
                  }} />
                ))}
              </div>
              <div className="relative z-10">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 scale-150 animate-pulse" style={{ animationDuration: "2s" }} />
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-lg relative z-10">
                  <span className="material-symbols-outlined text-[36px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                </div>
              </div>
              <p className="mt-8 text-label-sm text-primary font-bold tracking-widest uppercase relative z-10">Recording Active</p>
              <p className="mt-1 text-body-md text-on-surface-variant relative z-10">
                <span className={`font-mono text-data-md font-bold ${timeLeft < 15 ? "text-error" : "text-on-surface"}`}>{fmt(timeLeft)}</span>
              </p>
              <div className="w-full max-w-xs h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-4 mb-6 relative z-10">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((PART_TIMERS["single"] - timeLeft) / PART_TIMERS["single"]) * 100}%` }} />
              </div>
              <button onClick={stopSingleRecording} className="px-6 py-3 rounded-full bg-secondary text-on-secondary text-label-sm font-bold hover:opacity-90 transition-all active:scale-95 relative z-10 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">stop_circle</span>
                Stop &amp; Review
              </button>
            </div>
          </div>
        )}

        {phase === "preview" && previewUrl && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <h1 className="text-headline-md font-bold text-on-surface">Great effort!</h1>
              <p className="text-body-md text-on-surface-variant mt-1">Listen to your recording before submitting.</p>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-8">
              <div className="mb-6 p-4 rounded-lg bg-surface-container-low border-l-4 border-primary">
                <p className="text-label-sm text-primary mb-1 uppercase tracking-widest">Topic</p>
                <RichTextRenderer content={targetQuestion?.prompt_text || ""} className="text-headline-md italic text-on-surface line-clamp-2" />
              </div>

              <div className="h-16 flex items-end justify-center gap-1 px-2 mb-6 overflow-hidden">
                {Array.from({ length: 48 }, (_, i) => (
                  <div key={i} className="w-1.5 rounded-full transition-all" style={{
                    height: `${Math.max(6, Math.abs(Math.sin(i * 0.5) * 50 + Math.random() * 30))}px`,
                    backgroundColor: i < 24 ? "var(--c-primary)" : "var(--c-outline-variant)",
                    opacity: i < 24 ? 1 : 0.4,
                  }} />
                ))}
              </div>

              <div className="flex items-center justify-center gap-6 mb-6">
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[28px]">replay_10</span>
                </button>
                <button className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                  onClick={() => { const a = document.getElementById("previewAudio") as HTMLAudioElement; if (a) a.paused ? a.play() : a.pause(); }}>
                  <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                </button>
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[28px]">forward_10</span>
                </button>
              </div>

              <audio id="previewAudio" controls src={previewUrl} className="w-full mb-4" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => { setAudioBlob(null); setPreviewUrl(null); setRecordingActive(false); setPhase("ready"); }}
                className="flex-1 py-3 rounded-xl border-2 border-outline-variant text-on-surface text-label-sm font-semibold hover:bg-surface-variant/20 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">refresh</span> Re-record
              </button>
              <button onClick={handleSingleSubmit}
                className="flex-[1.5] py-3 rounded-xl bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                Submit for AI Analysis
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
            <p className="text-center text-label-sm text-on-surface-variant/60 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Analysis takes ~30 seconds after submission.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ===== FULL IELTS TEST MODE (temporarily hidden) =====
  if (!isSingleMode) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center">
        <span className="material-symbols-outlined text-[56px] text-outline mb-4">construction</span>
        <h2 className="text-headline-md font-bold text-on-surface mb-2">Full IELTS Test</h2>
        <p className="text-body-md text-on-surface-variant mb-6">Coming soon. Practice individual questions below.</p>
        <button onClick={() => router.push("/speaking")}
          className="bg-primary text-on-primary px-6 py-3 rounded-full text-label-sm font-semibold hover:opacity-90 transition-opacity">
          Back to Speaking
        </button>
      </div>
    );
  }

  // ===== FULL IELTS TEST MODE (code preserved for future) =====
  /* eslint-disable no-unreachable */
  return (
    <div className="max-w-3xl mx-auto">
      {showInterruptedBanner && (
        <div className="mb-4 bg-warning-container/30 border border-warning/30 rounded-xl p-4 flex items-start gap-3 animate-fade-in-up">
          <span className="material-symbols-outlined text-warning shrink-0 mt-0.5">warning</span>
          <div className="flex-1">
            <p className="text-body-md text-on-surface font-semibold">Previous session interrupted</p>
            <p className="text-label-sm text-on-surface-variant">Your last speaking test didn&apos;t finish. A new session has been created.</p>
          </div>
          <button onClick={() => { setShowInterruptedBanner(false); if (typeof window !== "undefined") localStorage.removeItem("speaking_test_in_progress"); }}
            className="p-1 hover:bg-surface-container rounded-lg transition-colors shrink-0">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>
      )}
      {/* Mic Test */}
      {phase === "mic-test" && (
        <div className="max-w-2xl mx-auto mt-8 md:mt-12">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700/50 shadow-[0_10px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.2)] p-8 md:p-10 relative overflow-hidden">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-[32px] text-blue-600 dark:text-blue-400">mic</span>
              </div>
              <h1 className="text-headline-md font-bold text-slate-800 dark:text-white mb-2">Microphone Check</h1>
              <p className="text-body-md text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Let&apos;s make sure your voice is captured clearly before starting the IELTS Speaking test.
              </p>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { icon: "check", label: "Permission", active: micOk, done: micOk },
                { icon: "mic", label: "Speak Now", active: micOk, done: false },
                { icon: "check_circle", label: "Confirm", active: false, done: false },
              ].map((s, i) => (
                <div key={i} className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700/50 p-4 flex flex-col items-center text-center transition-all duration-500">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${
                    s.done
                      ? "bg-emerald-100 dark:bg-emerald-500/20"
                      : s.active
                      ? "bg-blue-100 dark:bg-blue-500/20 animate-pulse"
                      : "bg-gray-100 dark:bg-slate-700"
                  }`}>
                    <span className={`material-symbols-outlined text-[20px] transition-all duration-500 ${
                      s.done
                        ? "text-emerald-600 dark:text-emerald-400"
                        : s.active
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 dark:text-slate-500"
                    }`} style={s.active || s.done ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                      {s.icon}
                    </span>
                  </div>
                  <span className="text-label-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{s.label}</span>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-500 ${
                    s.done
                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                      : s.active
                      ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
                  }`}>
                    {s.done ? "Done" : s.active ? "Active" : "Pending"}
                  </span>
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 mb-6 text-label-sm text-red-700 dark:text-red-400 text-center">{error}</div>
            )}

            {micOk ? (
              <>
                <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-800/50 rounded-2xl border border-blue-100 dark:border-blue-500/20 p-6 mb-6 text-center">
                  <p className="italic text-blue-700 dark:text-blue-300 font-medium text-body-lg mb-2">&ldquo;I am ready to start my IELTS practice&rdquo;</p>
                  <p className="text-[10px] text-blue-500/60 dark:text-blue-400/60 uppercase tracking-widest font-bold">Read the phrase aloud</p>
                </div>

                <div className="h-20 flex items-center justify-center gap-1 px-2 mb-6 overflow-hidden">
                  {micBars.map((h, i) => (
                    <div key={i} className="w-1.5 rounded-full transition-all duration-100" style={{
                      height: `${h}px`,
                      backgroundColor: `hsl(${160 + (h / 80) * 40}, ${60 + (h / 80) * 20}%, ${30 + (h / 80) * 25}%)`,
                      opacity: 0.3 + (h / 80) * 0.7,
                    }} />
                  ))}
                </div>

                <p className="text-label-sm text-slate-500 dark:text-slate-400 text-center mb-8">
                  {micLevel > 10
                    ? <span className="flex items-center justify-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> We can hear you clearly!</span>
                    : <span className="flex items-center justify-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Speak a bit louder — we need to calibrate</span>
                  }
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={() => { streamRef.current?.getTracks().forEach((t) => t.stop()); setMicOk(false); setMicLevel(0); setMicBars(Array(40).fill(4)); }}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-label-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    Test Again
                  </button>
                  <button onClick={() => setPhase("intro")}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 dark:from-blue-600 dark:to-blue-500 text-white text-label-sm font-semibold hover:from-blue-800 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-400 active:scale-[0.97] transition-all shadow-md hover:shadow-lg hover:shadow-blue-500/25">
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <p className="text-body-md text-slate-500 dark:text-slate-400 mb-8">Click the button below to allow microphone access</p>
                  <div className="relative inline-flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse-ring" style={{ animationDelay: "0s" }} />
                    <div className="absolute inset-0 rounded-full bg-blue-500/15 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
                    <button onClick={testMic}
                      className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-700 to-blue-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/25 z-10">
                      <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Intro */}
      {phase === "intro" && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 text-center">
          <span className="material-symbols-outlined text-[56px] text-primary mb-4">record_voice_over</span>
          <h2 className="text-headline-md font-bold text-on-surface mb-4">IELTS Speaking Test</h2>
          <div className="space-y-3 text-left max-w-md mx-auto mb-8">
            {partOrder.includes("part1") && (
              <div className="flex gap-3">
                <span className="bg-primary-container text-on-primary-container rounded-full w-7 h-7 flex items-center justify-center text-label-sm font-bold shrink-0">1</span>
                <div><p className="text-body-md font-semibold text-on-surface">Interview</p><p className="text-label-sm text-on-surface-variant">{grouped.part1.length} questions · 2 min continuous recording</p></div>
              </div>
            )}
            {partOrder.includes("part2") && (
              <div className="flex gap-3">
                <span className="bg-primary-container text-on-primary-container rounded-full w-7 h-7 flex items-center justify-center text-label-sm font-bold shrink-0">2</span>
                <div><p className="text-body-md font-semibold text-on-surface">Long Turn</p><p className="text-label-sm text-on-surface-variant">1 min prep · 2 min speaking</p></div>
              </div>
            )}
            {partOrder.includes("part3") && (
              <div className="flex gap-3">
                <span className="bg-primary-container text-on-primary-container rounded-full w-7 h-7 flex items-center justify-center text-label-sm font-bold shrink-0">3</span>
                <div><p className="text-body-md font-semibold text-on-surface">Discussion</p><p className="text-label-sm text-on-surface-variant">{grouped.part3.length} questions · 3 min continuous recording</p></div>
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setPhase("mic-test")} className="px-5 py-2.5 rounded-full border border-outline-variant text-on-surface-variant text-label-sm hover:bg-surface-container transition-colors">Back</button>
            <button onClick={beginExam} className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-opacity">Start Test</button>
          </div>
        </div>
      )}

      {/* Part 1/3 Speaking */}
      {(phase === "part1-speak" || phase === "part3-speak") && currentQuestion && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-primary-container/30 text-primary text-label-sm font-semibold">
              {currentPart === "part1" ? "Part 1" : "Part 3"} · {questionIdx + 1}/{currentQuestions.length}
            </span>
            {recordingActive && (
              <span className={`font-mono text-data-md font-bold ${timeLeft < 15 ? "text-error" : "text-on-surface"}`}>{fmt(timeLeft)}</span>
            )}
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6">
            <RichTextRenderer content={currentQuestion.prompt_text} className="text-body-lg text-on-surface leading-relaxed" />
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => speakText(currentQuestion.prompt_text)} className="flex items-center gap-1.5 text-primary text-label-sm hover:underline">
              <span className="material-symbols-outlined text-[18px]">volume_up</span> Read aloud
            </button>
            {recordingActive ? (
              <button onClick={nextQuestion} className="px-5 py-2.5 rounded-full bg-surface-container-high text-on-surface text-label-sm font-semibold hover:bg-error-container hover:text-error transition-colors">
                {questionIdx + 1 < currentQuestions.length ? "Stop & Next" : "Stop & Finish"}
              </button>
            ) : (
              <button onClick={() => { startTimer(PART_TIMERS[currentPart], nextQuestion); startRecording(); }} className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-opacity">
                Start Answer
              </button>
            )}
          </div>
          {recordingActive && (
            <div className="flex items-center gap-2 text-error text-label-sm justify-center">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse" /> Recording...
            </div>
          )}
        </div>
      )}

      {/* Part 2 Prep */}
      {phase === "part2-prep" && currentQuestion && (
        <div className="space-y-6 text-center">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-primary-container/30 text-primary text-label-sm font-semibold">Part 2 · Preparation</span>
            <span className={`font-mono text-data-md font-bold ${timeLeft < 10 ? "text-error" : "text-on-surface"}`}>{fmt(timeLeft)}</span>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 text-left">
            <h3 className="text-body-md font-semibold text-on-surface mb-3">Topic Card</h3>
            <RichTextRenderer content={currentQuestion.prompt_text} className="text-body-lg text-on-surface leading-relaxed" />
          </div>
          <p className="text-body-md text-on-surface-variant">Prepare your response. Do not speak yet.</p>
          <button onClick={beginPart2Speak} className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-opacity">Skip Timer · Start Speaking</button>
        </div>
      )}

      {/* Part 2 Speak */}
      {phase === "part2-speak" && currentQuestion && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-primary-container/30 text-primary text-label-sm font-semibold">Part 2 · Speaking</span>
            <span className={`font-mono text-display-md font-extrabold ${timeLeft < 15 ? "text-error animate-pulse" : "text-on-surface"}`}>{fmt(timeLeft)}</span>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6">
            <RichTextRenderer content={currentQuestion.prompt_text} className="text-body-md text-on-surface-variant leading-relaxed line-clamp-4" />
          </div>
          <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-8 flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-3xl -mr-32 -mt-32" />
            </div>
            <div className="flex items-end justify-center gap-1 h-16 mb-8 w-full max-w-md relative z-10 overflow-hidden">
              {micBars.map((h, i) => (
                <div key={i} className="w-1.5 rounded-full transition-all duration-100" style={{
                  height: `${Math.max(3, h)}px`,
                  opacity: 0.25 + (h / 90) * 0.75,
                  backgroundColor: `hsl(${155 + (h / 90) * 40}, ${55 + (h / 90) * 35}%, ${25 + (h / 90) * 35}%)`,
                }} />
              ))}
            </div>
            <div className="relative z-10">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 scale-150 animate-pulse" style={{ animationDuration: "2s" }} />
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg relative z-10">
                <span className="material-symbols-outlined text-[32px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
              </div>
            </div>
            <p className="mt-6 text-label-sm text-primary font-bold tracking-widest uppercase relative z-10">Recording</p>
          </div>
          <p className="text-label-sm text-on-surface-variant text-center">Speaking... Click when done or wait for timer.</p>
          <button onClick={finishPart2} className="w-full px-5 py-3 rounded-full bg-secondary text-on-secondary text-label-sm font-bold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">stop_circle</span>
            Stop Recording · Continue
          </button>
        </div>
      )}

      {/* Preview / Submit */}
      {phase === "preview" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <span className="material-symbols-outlined text-[48px] text-primary mb-3">check_circle</span>
            <h2 className="text-headline-md font-bold text-on-surface mb-1">Test Complete</h2>
            <p className="text-body-md text-on-surface-variant">Listen to your recording before submitting.</p>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-8">
            <div className="h-16 flex items-end justify-center gap-1 px-2 mb-6 overflow-hidden">
              {Array.from({ length: 48 }, (_, i) => (
                <div key={i} className="w-1.5 rounded-full" style={{
                  height: `${Math.max(6, Math.abs(Math.sin(i * 0.5) * 50 + Math.random() * 30))}px`,
                  backgroundColor: i < 24 ? "var(--c-primary)" : "var(--c-outline-variant)",
                  opacity: i < 24 ? 1 : 0.4,
                }} />
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mb-4">
              <button className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                onClick={() => { const a = document.getElementById("previewAudioFull") as HTMLAudioElement; if (a) a.paused ? a.play() : a.pause(); }}>
                <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              </button>
            </div>
            {previewUrl && <audio id="previewAudioFull" controls src={previewUrl} className="w-full" />}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => router.push("/speaking")} className="flex-1 py-3 rounded-xl border-2 border-outline-variant text-on-surface text-label-sm font-semibold hover:bg-surface-variant/20 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">delete</span> Discard
            </button>
            <button onClick={handleSubmit} className="flex-[1.5] py-3 rounded-xl bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
              Submit for AI Analysis
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Fallback start */}
      {!["load", "submitting", "mic-test", "intro", "part1-speak", "part2-prep", "part2-speak", "part3-speak", "preview", "ready", "single-prep"].includes(phase) && allQuestions.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 text-center">
          <span className="material-symbols-outlined text-[56px] text-primary mb-4">record_voice_over</span>
          <h2 className="text-headline-md font-bold text-on-surface mb-2">Speaking Test</h2>
          <p className="text-body-md text-on-surface-variant mb-8 max-w-md mx-auto">{allQuestions.length} questions across {partOrder.length} parts.</p>
          <button onClick={() => setPhase("mic-test")} className="px-6 py-3 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto">
            <span className="material-symbols-outlined text-[20px]">mic</span> Start Speaking Test
          </button>
        </div>
      )}
    </div>
  );
}
