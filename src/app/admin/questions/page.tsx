"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import RichTextEditor from "@/components/ui/RichTextEditor";
import RichTextRenderer from "@/components/ui/RichTextRenderer";
import {
  Plus,
  EyeOff,
  Pencil,
  Trash2,
  FileText,
  Mic,
  CheckCircle,
  XCircle,
  Upload,
  ChevronLeft,
  ChevronRight,
  Search,
  FileQuestion,
} from "lucide-react";

interface Question {
  id: string;
  exam_type: string;
  task_type?: string;
  difficulty: number;
  prompt_text: string;
  title?: string;
  module?: string;
  is_active: boolean;
  img_url?: string | null;
  img_info?: string | null;
}

interface QuestionsResponse {
  questions: Question[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  counts: { writing: number; speaking: number };
}

function ExamTypeBadge({ type, taskType }: { type: string; taskType?: string }) {
  if (type === "writing") {
    const isTask2 = taskType === "task2";
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${isTask2 ? "dark:bg-violet-900/30 dark:text-violet-400 bg-violet-50 text-violet-700" : "dark:bg-blue-900/30 dark:text-blue-400 bg-blue-50 text-blue-700"}`}>
        <FileText className="w-3.5 h-3.5" />
        Writing — {isTask2 ? "Task 2" : "Task 1"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold dark:bg-emerald-900/30 dark:text-emerald-400 bg-emerald-50 text-emerald-700">
      <Mic className="w-3.5 h-3.5" />
      Speaking
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400 bg-emerald-100 text-emerald-700 text-xs font-semibold">
        <CheckCircle className="w-3 h-3" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full dark:bg-slate-800 dark:text-slate-400 bg-slate-100 text-slate-500 text-xs font-medium">
      <XCircle className="w-3 h-3" />
      Inactive
    </span>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: number }) {
  const colors = {
    1: "dark:bg-slate-800 dark:text-slate-400 bg-slate-100 text-slate-600",
    2: "dark:bg-amber-900/30 dark:text-amber-400 bg-amber-50 text-amber-700",
    3: "dark:bg-red-900/30 dark:text-red-400 bg-red-50 text-red-600",
  };
  const labels = { 1: "Easy", 2: "Medium", 3: "Hard" };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[difficulty as keyof typeof colors]}`}>
      {labels[difficulty as keyof typeof labels]}
    </span>
  );
}

function QuestionCard({ question, onEdit, onDelete, onToggle }: { question: Question; onEdit: () => void; onDelete: () => void; onToggle: () => void }) {
  const isInactive = !question.is_active;

  return (
    <div className={`dark:bg-slate-900 bg-white rounded-xl border ${isInactive ? "dark:border-slate-700 border-slate-200 opacity-60" : "dark:border-slate-800 border-slate-100"} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden mb-4`}>
      <div className="dark:bg-slate-800/50 bg-slate-50/60 px-5 py-3 border-b dark:border-slate-800 border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2 flex-wrap">
          <ExamTypeBadge type={question.exam_type} taskType={question.task_type} />
          <DifficultyBadge difficulty={question.difficulty} />
          <StatusBadge isActive={question.is_active} />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg dark:text-slate-500 text-slate-400 hover:dark:text-slate-300 hover:text-slate-600 dark:hover:bg-slate-700 hover:bg-slate-100 transition-colors"
            title={question.is_active ? "Disable" : "Enable"}
          >
            <EyeOff className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg dark:text-slate-500 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 hover:bg-blue-50 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg dark:text-slate-500 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 dark:hover:bg-rose-900/20 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-5">
        {question.title && (
          <h4 className="text-sm font-semibold dark:text-slate-200 text-slate-800 mb-2">{question.title}</h4>
        )}
        <RichTextRenderer content={question.prompt_text} className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed" />
        {question.img_url && (
          <div className="mt-3 p-3 dark:bg-slate-800/50 bg-slate-50 rounded-lg">
            <img src={question.img_url} alt="Question image" className="max-h-32 rounded border dark:border-slate-700 border-slate-200" />
            {question.img_info && (
              <p className="text-xs dark:text-slate-500 text-slate-500 mt-2 italic">Image context: {question.img_info}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({ writing: 0, speaking: 0 });

  const [form, setForm] = useState({ exam_type: "speaking", task_type: null as string | null, difficulty: 1, prompt_text: "", title: "", module: "general", img_url: null as string | null, img_info: null as string | null });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  const fetchQuestions = (pageNum: number = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(pageNum), per_page: "10" });
    if (filterType !== "all") params.set("exam_type", filterType);
    apiFetch<QuestionsResponse>(`/admin/questions?${params}`)
      .then((data) => {
        setQuestions(data.questions);
        setTotalPages(data.total_pages);
        setCounts(data.counts);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchQuestions(page); }, [filterType]);

  useEffect(() => {
    if (form.exam_type === "writing" && !form.task_type) {
      setForm((prev) => ({ ...prev, task_type: "task1" }));
    }
  }, [form.exam_type]);

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    setPage(1);
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) { alert("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image must be smaller than 5MB"); return; }
    setPendingImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => { setForm((prev) => ({ ...prev, img_url: e.target?.result as string })); };
    reader.readAsDataURL(file);
  };

  const handleImageUploadForQuestion = async (file: File, questionId: string) => {
    if (!file.type.startsWith("image/")) { alert("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image must be smaller than 5MB"); return; }
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`/api/v1/admin/questions/${questionId}/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, img_url: data.img_url } : q)));
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image. Please try again.");
    } finally { setUploadingImage(false); }
  };

  const handleCreate = async () => {
    if (isCreating) return;
    setIsCreating(true);
    setCreateSuccess(false);
    try {
      const payload = { ...form, task_type: form.exam_type === "writing" ? form.task_type : undefined };
      const created = await apiFetch<Question>("/admin/questions", { method: "POST", body: JSON.stringify(payload) });
      if (created && pendingImageFile) {
        setUploadingImage(true);
        try {
          const formData = new FormData();
          formData.append("file", pendingImageFile);
          const response = await fetch(`/api/v1/admin/questions/${created.id}/image`, {
            method: "POST",
            headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
            body: formData,
          });
          if (response.ok) {
            const data = await response.json();
            await apiFetch(`/admin/questions/${created.id}`, { method: "PATCH", body: JSON.stringify({ img_url: data.img_url }) });
          }
        } catch (err) { console.error("Image upload after create failed:", err); }
        finally { setUploadingImage(false); }
      }
      setPendingImageFile(null);
      setCreateSuccess(true);
      setTimeout(() => {
        setShowNew(false);
        setForm({ exam_type: "speaking", task_type: null, difficulty: 1, prompt_text: "", title: "", module: "general", img_url: null, img_info: null });
        setCreateSuccess(false);
        fetchQuestions(1);
      }, 1500);
    } catch (err) {
      console.error("Failed to create question:", err);
      alert("Failed to create question. Please try again.");
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    const q = questions.find((q) => q.id === id);
    if (!q) return;
    await apiFetch(`/admin/questions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ prompt_text: q.prompt_text, title: q.title, module: q.module, difficulty: q.difficulty, task_type: q.task_type, is_active: q.is_active, img_info: q.img_info }),
    });
    setEditing(null);
    fetchQuestions(page);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    await apiFetch(`/admin/questions/${id}`, { method: "DELETE" });
    fetchQuestions(page);
  };

  const toggleActive = async (q: Question) => {
    await apiFetch(`/admin/questions/${q.id}`, { method: "PATCH", body: JSON.stringify({ is_active: !q.is_active }) });
    fetchQuestions(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-slate-950 bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 dark:border-slate-700 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const filterTabs = [
    { key: "all", label: "All", count: counts.writing + counts.speaking },
    { key: "writing", label: "Writing", count: counts.writing },
    { key: "speaking", label: "Speaking", count: counts.speaking },
  ];

  return (
    <div className="min-h-screen dark:bg-slate-950 bg-slate-50/50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-extrabold dark:text-white text-slate-900 tracking-tight mb-1">Questions</h1>
            <p className="text-sm dark:text-slate-400 text-slate-500">{counts.writing + counts.speaking} total questions</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="dark:bg-blue-600 hover:dark:bg-blue-500 bg-slate-900 hover:bg-blue-600 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Question
          </button>
        </div>

        {showNew && (
          <div className="dark:bg-slate-900 bg-white rounded-2xl border dark:border-slate-800 border-slate-100 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-bold dark:text-slate-200 text-slate-800 mb-4">New Question</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <select value={form.exam_type} onChange={(e) => setForm({ ...form, exam_type: e.target.value })} disabled={isCreating} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm disabled:opacity-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none">
                <option value="speaking">Speaking</option>
                <option value="writing">Writing</option>
              </select>
              {form.exam_type === "writing" && (
                <select value={form.task_type ?? ""} onChange={(e) => setForm({ ...form, task_type: e.target.value })} disabled={isCreating} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm disabled:opacity-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none">
                  <option value="task1">Task 1</option>
                  <option value="task2">Task 2</option>
                </select>
              )}
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })} disabled={isCreating} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm disabled:opacity-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none">
                <option value={1}>Easy</option>
                <option value={2}>Medium</option>
                <option value={3}>Hard</option>
              </select>
              <select value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} disabled={isCreating} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm disabled:opacity-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none">
                <option value="general">General Training</option>
                <option value="academic">Academic</option>
              </select>
            </div>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Short title (e.g. Community Service in Schools)"
              disabled={isCreating}
              className="w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm mb-3 disabled:opacity-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none"
            />
            <RichTextEditor value={form.prompt_text} onChange={(value) => setForm({ ...form, prompt_text: value })} placeholder="Full question prompt..." className="mb-4" />
            {form.exam_type === "writing" && form.task_type === "task1" && (
              <div className="mb-4 space-y-3">
                <label className="text-sm font-medium dark:text-slate-300 text-slate-700">Image (optional)</label>
                <div className="flex items-center gap-3">
                  <label className={`flex items-center gap-2 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 cursor-pointer text-sm text-slate-600 transition-colors ${isCreating || uploadingImage ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <Upload className="w-4 h-4" />
                    {uploadingImage ? "Uploading..." : "Choose file"}
                    <input type="file" accept="image/*" disabled={isCreating || uploadingImage} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }} />
                  </label>
                  {form.img_url && <span className="text-sm dark:text-emerald-400 text-emerald-600 font-medium">Image selected</span>}
                </div>
                {form.img_url && <img src={form.img_url} alt="Preview" className="max-h-40 rounded-xl border dark:border-slate-700 border-slate-200" />}
                <textarea
                  value={form.img_info || ""}
                  onChange={(e) => setForm({ ...form, img_info: e.target.value || null })}
                  placeholder="Describe the image for AI evaluation..."
                  disabled={isCreating}
                  className="w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm resize-none h-20 disabled:opacity-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleCreate} disabled={isCreating || uploadingImage || !form.prompt_text.trim()} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50 flex items-center gap-2 transition-colors">
                {isCreating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</> : "Create Question"}
              </button>
              <button onClick={() => { if (!isCreating) setShowNew(false); }} disabled={isCreating} className="dark:bg-slate-800 dark:text-slate-400 px-4 py-2.5 rounded-xl text-slate-600 hover:dark:bg-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors">Cancel</button>
              {createSuccess && <span className="flex items-center gap-1 dark:text-emerald-400 text-emerald-600 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Created!</span>}
            </div>
          </div>
        )}

        <div className="dark:bg-slate-800/50 bg-slate-100/80 rounded-xl p-1 inline-flex gap-1 mb-6">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleFilterChange(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === tab.key ? "dark:bg-slate-900 dark:text-white bg-white text-slate-900 shadow-sm" : "dark:text-slate-400 text-slate-500 hover:dark:text-slate-300 hover:text-slate-700"}`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {questions.length === 0 ? (
            <div className="dark:bg-slate-900 bg-white rounded-2xl border dark:border-slate-800 border-slate-100 shadow-sm p-12 text-center">
              <FileQuestion className="w-12 h-12 dark:text-slate-600 text-slate-200 mx-auto mb-4" />
              <p className="dark:text-slate-400 text-slate-500">No questions found</p>
            </div>
          ) : (
            questions.map((q) => (
              editing === q.id ? (
                <div key={q.id} className="dark:bg-slate-900 bg-white rounded-xl border dark:border-slate-800 border-slate-100 shadow-sm p-5">
                  <input value={q.title || ""} onChange={(e) => setQuestions(questions.map((qq) => qq.id === q.id ? { ...qq, title: e.target.value } : qq))} placeholder="Title" className="w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm mb-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none" />
                  <RichTextEditor value={q.prompt_text} onChange={(value) => setQuestions(questions.map((qq) => qq.id === q.id ? { ...qq, prompt_text: value } : qq))} className="mb-3" />
                  {q.exam_type === "writing" && q.task_type === "task1" && (
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 cursor-pointer text-sm text-slate-600 transition-colors">
                          <Upload className="w-4 h-4" />
                          {uploadingImage ? "Uploading..." : "Upload Image"}
                          <input type="file" accept="image/*" disabled={uploadingImage} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUploadForQuestion(file, q.id); }} />
                        </label>
                        {q.img_url && <span className="text-sm dark:text-emerald-400 text-emerald-600 font-medium">Has image</span>}
                      </div>
                      {q.img_url && <img src={q.img_url} alt="Current" className="max-h-32 rounded border dark:border-slate-700 border-slate-200" />}
                      <textarea value={q.img_info || ""} onChange={(e) => setQuestions(questions.map((qq) => qq.id === q.id ? { ...qq, img_info: e.target.value } : qq))} placeholder="Image description..." className="w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm resize-none h-20 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none" />
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <select value={q.difficulty} onChange={(e) => setQuestions(questions.map((qq) => qq.id === q.id ? { ...qq, difficulty: Number(e.target.value) } : qq))} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-sm">
                      <option value={1}>Easy</option><option value={2}>Medium</option><option value={3}>Hard</option>
                    </select>
                    <select value={q.module || "general"} onChange={(e) => setQuestions(questions.map((qq) => qq.id === q.id ? { ...qq, module: e.target.value } : qq))} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-sm">
                      <option value="general">General</option><option value="academic">Academic</option>
                    </select>
                    <button onClick={() => handleUpdate(q.id)} className="bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg">Save</button>
                    <button onClick={() => setEditing(null)} className="dark:text-slate-500 text-slate-500 text-sm px-3 py-1.5">Cancel</button>
                  </div>
                </div>
              ) : (
                <QuestionCard
                  key={q.id}
                  question={q}
                  onEdit={() => setEditing(q.id)}
                  onDelete={() => handleDelete(q.id)}
                  onToggle={() => toggleActive(q)}
                />
              )
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => { setPage(page - 1); fetchQuestions(page - 1); }}
              disabled={page <= 1}
              className="w-10 h-10 rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:dark:bg-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm dark:text-slate-400 text-slate-600">Page {page} of {totalPages}</span>
            <button
              onClick={() => { setPage(page + 1); fetchQuestions(page + 1); }}
              disabled={page >= totalPages}
              className="w-10 h-10 rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:dark:bg-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
