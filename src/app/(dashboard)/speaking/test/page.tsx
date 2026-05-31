"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getQuestions, createSpeakingExam, submitSpeakingEvaluation } from "@/lib/api";
import type { Question, Exam } from "@/lib/types";

type Phase = "load" | "mic-test" | "ready" | "intro" | "part1-speak" | "part2-prep" | "part2-speak" | "part3-speak" | "preview" | "submitting";

const PART_TIMERS: Record<string, number> = {
  "part1": 120,
  "part2-prep": 60,
  "part2-speak": 120,
  "part3": 180,
  "single": 120,
};

function groupByPart(questions: Question[]) {
  const groups: Record<string, Question[]> = {};
  for (const q of questions) {
    const part = q.module || "part2";
    if (!groups[part]) groups[part] = [];
    groups[part].push(q);
  }
  return groups;
}

function speakText(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.9;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}

export default function SpeakingTestPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const questionId = searchParams.get("id");

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [targetQuestion, setTargetQuestion] = useState<Question | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [phase, setPhase] = useState<Phase>("load");
  const [error, setError] = useState("");

  const [micOk, setMicOk] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  const [currentPart, setCurrentPart] = useState("");
  const [questionIdx, setQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const [recordingBlobs, setRecordingBlobs] = useState<Blob[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animRef = useRef<number>(0);

  const isSingleMode = !!questionId;
  const grouped = groupByPart(allQuestions);
  const partOrder = isSingleMode ? [] : ["part1", "part2", "part3"].filter((p) => grouped[p]?.length);
  const currentQuestions = grouped[currentPart] || [];
  const currentQuestion = isSingleMode ? targetQuestion : currentQuestions[questionIdx];

  useEffect(() => {
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
      .then(setExam)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [questionId]);

  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      animRef.current && cancelAnimationFrame(animRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

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
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
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
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
    timerRef.current && clearInterval(timerRef.current);
  };

  // ---- Single-mode handlers ----
  const startSingleTest = () => {
    setPhase("ready");
  };

  const beginSingleRecording = () => {
    if (targetQuestion) speakText(targetQuestion.prompt_text);
    startTimer(PART_TIMERS["single"], () => stopSingleRecording());
    startRecording();
  };

  const stopSingleRecording = () => {
    recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSingleSubmit = useCallback(async () => {
    if (!exam || !audioBlob) return;
    setPhase("submitting");
    setError("");
    try {
      await submitSpeakingEvaluation(exam.id, audioBlob);
      router.push(`/speaking/results?examId=${exam.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit";
      setError(msg.includes("503") || msg.includes("UNAVAILABLE") ? "AI is busy. Please try again." : msg);
      setPhase("preview");
    }
  }, [exam, audioBlob, router]);

  // ---- Multi-part handlers ----
  const nextQuestion = () => {
    const nextIdx = questionIdx + 1;
    if (nextIdx < currentQuestions.length) {
      setQuestionIdx(nextIdx);
      const q = currentQuestions[nextIdx];
      if (q) speakText(q.prompt_text);
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
    if (q) speakText(q.prompt_text);
    startTimer(PART_TIMERS[part], () => finishCurrentPart());
    startRecording();
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
      router.push(`/speaking/results?examId=${exam.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit";
      setError(msg.includes("503") || msg.includes("UNAVAILABLE") ? "AI is busy. Please try again." : msg);
      setPhase("preview");
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
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6">
        <span className="material-symbols-outlined text-[48px] text-primary mb-4 animate-spin">progress_activity</span>
        <h2 className="text-headline-md font-bold text-on-surface mb-2">Evaluating Your Speaking</h2>
        <p className="text-body-md text-on-surface-variant max-w-md">AI is analyzing your recording. This takes ~30 seconds.</p>
        {error && (
          <div className="mt-6 bg-error-container/30 border border-error/20 rounded-xl p-4 max-w-md">
            <p className="text-body-md text-error mb-3">{error}</p>
            <button onClick={handleSubmit} className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-sm font-semibold">Retry</button>
          </div>
        )}
      </div>
    );
  }

  // ===== SINGLE QUESTION MODE =====
  if (isSingleMode && targetQuestion) {
    return (
      <div className="max-w-3xl mx-auto">
        {phase === "mic-test" && (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-[56px] text-primary mb-4">mic</span>
            <h3 className="text-headline-md font-bold text-on-surface mb-2">Microphone Check</h3>
            <p className="text-body-md text-on-surface-variant mb-8 max-w-sm">Make sure your mic works before you start.</p>
            {error && <p className="text-label-sm text-error bg-error-container/30 rounded-lg px-4 py-2 mb-4 w-full">{error}</p>}
            {micOk ? (
              <>
                <div className="w-full max-w-xs h-2 bg-surface-container-high rounded-full overflow-hidden mb-4">
                  <div className={`h-full rounded-full transition-all ${micLevel > 70 ? "bg-error" : micLevel > 30 ? "bg-primary" : "bg-primary-fixed"}`} style={{ width: `${micLevel}%` }} />
                </div>
                <p className="text-label-sm text-on-surface-variant mb-6">{micLevel > 10 ? "We can hear you!" : "Speak a bit louder"}</p>
                <div className="flex gap-3">
                  <button onClick={() => { streamRef.current?.getTracks().forEach((t) => t.stop()); setMicOk(false); setMicLevel(0); }} className="px-5 py-2.5 rounded-full border border-outline-variant text-on-surface-variant text-label-sm hover:bg-surface-container transition-colors">Test Again</button>
                  <button onClick={startSingleTest} className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-opacity">Continue</button>
                </div>
              </>
            ) : (
              <button onClick={testMic} className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-md">
                <span className="material-symbols-outlined text-[32px]">mic</span>
              </button>
            )}
          </div>
        )}

        {phase === "ready" && (
          <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-label-sm uppercase">{targetQuestion.module || "part2"}</span>
              </div>
              <h2 className="text-headline-md font-bold text-on-surface mb-3">{targetQuestion.title || "Speaking Topic"}</h2>
              <p className="text-body-lg text-on-surface-variant leading-relaxed">{targetQuestion.prompt_text}</p>
            </div>
            <div className="flex justify-center gap-3">
              <button onClick={() => setPhase("mic-test")} className="px-5 py-2.5 rounded-full border border-outline-variant text-on-surface-variant text-label-sm hover:bg-surface-container transition-colors">Back</button>
              <button onClick={beginSingleRecording} className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">fiber_manual_record</span> Start Recording
              </button>
            </div>
          </div>
        )}

        {phase !== "mic-test" && phase !== "ready" && phase !== "preview" && (
          <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-label-sm uppercase">{targetQuestion.module || "part2"}</span>
              </div>
              <h2 className="text-headline-md font-bold text-on-surface mb-3">{targetQuestion.title || "Speaking Topic"}</h2>
              <p className="text-body-md text-on-surface-variant leading-relaxed line-clamp-4">{targetQuestion.prompt_text}</p>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-error-container flex items-center justify-center animate-pulse mb-4">
                <span className="material-symbols-outlined text-[40px] text-error">mic</span>
              </div>
              <p className="text-body-md text-on-surface mb-2">Recording...</p>
              <span className={`font-mono text-display-md font-extrabold ${timeLeft < 15 ? "text-error" : "text-on-surface"}`}>{fmt(timeLeft)}</span>
              <div className="w-full max-w-xs h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-3 mb-5">
                <div className="h-full bg-error rounded-full" style={{ width: `${((PART_TIMERS["single"] - timeLeft) / PART_TIMERS["single"]) * 100}%` }} />
              </div>
              <button onClick={stopSingleRecording} className="px-5 py-2.5 rounded-full bg-surface-container-high text-on-surface text-label-sm font-semibold hover:bg-error-container hover:text-error transition-colors">Stop Recording</button>
            </div>
          </div>
        )}

        {phase === "preview" && previewUrl && (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 flex flex-col gap-4">
            <h3 className="text-headline-md font-bold text-on-surface">Review Your Recording</h3>
            <audio controls src={previewUrl} className="w-full" />
            <button onClick={() => { setAudioBlob(null); setPreviewUrl(null); setPhase("ready"); }} className="flex items-center gap-1 text-on-surface-variant hover:text-error text-label-sm transition-colors">
              <span className="material-symbols-outlined text-[18px]">replay</span> Re-record
            </button>
            {error && <p className="text-label-sm text-error bg-error-container/30 rounded-lg px-4 py-2">{error}</p>}
            <button onClick={handleSingleSubmit} className="w-full bg-primary text-on-primary text-label-sm font-semibold py-3 rounded-full hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">send</span> Submit for Evaluation
            </button>
          </div>
        )}
      </div>
    );
  }

  // ===== FULL IELTS TEST MODE =====
  return (
    <div className="max-w-3xl mx-auto">
      {/* Mic Test */}
      {phase === "mic-test" && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-[56px] text-primary mb-4">mic</span>
          <h3 className="text-headline-md font-bold text-on-surface mb-2">Microphone Check</h3>
          <p className="text-body-md text-on-surface-variant mb-8 max-w-sm">Make sure your mic works before starting the IELTS Speaking test.</p>
          {error && <p className="text-label-sm text-error bg-error-container/30 rounded-lg px-4 py-2 mb-4 w-full">{error}</p>}
          {micOk ? (
            <>
              <div className="w-full max-w-xs h-2 bg-surface-container-high rounded-full overflow-hidden mb-4">
                <div className={`h-full rounded-full transition-all ${micLevel > 70 ? "bg-error" : micLevel > 30 ? "bg-primary" : "bg-primary-fixed"}`} style={{ width: `${micLevel}%` }} />
              </div>
              <p className="text-label-sm text-on-surface-variant mb-6">{micLevel > 10 ? "We can hear you!" : "Speak a bit louder"}</p>
              <div className="flex gap-3">
                <button onClick={() => { streamRef.current?.getTracks().forEach((t) => t.stop()); setMicOk(false); setMicLevel(0); }} className="px-5 py-2.5 rounded-full border border-outline-variant text-on-surface-variant text-label-sm hover:bg-surface-container transition-colors">Test Again</button>
                <button onClick={() => setPhase("intro")} className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-opacity">Continue</button>
              </div>
            </>
          ) : (
            <button onClick={testMic} className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-md">
              <span className="material-symbols-outlined text-[32px]">mic</span>
            </button>
          )}
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
            <span className={`font-mono text-data-md font-bold ${timeLeft < 15 ? "text-error" : "text-on-surface"}`}>{fmt(timeLeft)}</span>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6">
            <p className="text-body-lg text-on-surface leading-relaxed">{currentQuestion.prompt_text}</p>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => speakText(currentQuestion.prompt_text)} className="flex items-center gap-1.5 text-primary text-label-sm hover:underline">
              <span className="material-symbols-outlined text-[18px]">volume_up</span> Read aloud
            </button>
            <button onClick={nextQuestion} className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-opacity">
              {questionIdx + 1 < currentQuestions.length ? "Next Question" : "Finish Part"}
            </button>
          </div>
          <div className="flex items-center gap-2 text-error text-label-sm justify-center">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse" /> Recording...
          </div>
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
            <p className="text-body-lg text-on-surface leading-relaxed whitespace-pre-wrap">{currentQuestion.prompt_text}</p>
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
            <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap line-clamp-4">{currentQuestion.prompt_text}</p>
          </div>
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-[32px] text-error">mic</span>
            </div>
          </div>
          <p className="text-label-sm text-on-surface-variant text-center">Speaking... Click when done or wait for timer.</p>
          <button onClick={finishPart2} className="w-full px-5 py-3 rounded-full bg-surface-container-high text-on-surface text-label-sm font-semibold hover:bg-error-container hover:text-error transition-colors">
            Stop Recording · Continue
          </button>
        </div>
      )}

      {/* Preview / Submit */}
      {phase === "preview" && (
        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 text-center">
            <span className="material-symbols-outlined text-[48px] text-primary mb-3">check_circle</span>
            <h2 className="text-headline-md font-bold text-on-surface mb-2">Test Complete</h2>
            <p className="text-body-md text-on-surface-variant mb-6">Review or submit your recording.</p>
            {previewUrl && <audio controls src={previewUrl} className="w-full max-w-md mb-4" />}
            {error && <p className="text-label-sm text-error bg-error-container/30 rounded-lg px-4 py-2 mb-4">{error}</p>}
            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push("/speaking")} className="px-5 py-2.5 rounded-full border border-outline-variant text-on-surface-variant text-label-sm hover:bg-surface-container transition-colors">Discard</button>
              <button onClick={handleSubmit} className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-opacity">Submit for Evaluation</button>
            </div>
          </div>
        </div>
      )}

      {/* Fallback start */}
      {!["load", "submitting", "mic-test", "intro", "part1-speak", "part2-prep", "part2-speak", "part3-speak", "preview", "ready"].includes(phase) && allQuestions.length > 0 && (
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
