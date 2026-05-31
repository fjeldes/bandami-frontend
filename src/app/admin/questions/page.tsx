"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Question {
  id: string;
  exam_type: string;
  task_type?: string;
  difficulty: number;
  prompt_text: string;
  title?: string;
  module?: string;
  is_active: boolean;
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const [form, setForm] = useState({ exam_type: "speaking", task_type: "", difficulty: 1, prompt_text: "", title: "", module: "general" });

  const fetchQuestions = () => {
    apiFetch<Question[]>("/admin/questions")
      .then(setQuestions)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleCreate = async () => {
    await apiFetch("/admin/questions", { method: "POST", body: JSON.stringify(form) });
    setShowNew(false);
    setForm({ exam_type: "speaking", task_type: "", difficulty: 1, prompt_text: "", title: "", module: "general" });
    fetchQuestions();
  };

  const handleUpdate = async (id: string) => {
    const q = questions.find((q) => q.id === id);
    if (!q) return;
    await apiFetch(`/admin/questions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ prompt_text: q.prompt_text, title: q.title, module: q.module, difficulty: q.difficulty, task_type: q.task_type, is_active: q.is_active }),
    });
    setEditing(null);
    fetchQuestions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    await apiFetch(`/admin/questions/${id}`, { method: "DELETE" });
    fetchQuestions();
  };

  const toggleActive = async (q: Question) => {
    await apiFetch(`/admin/questions/${q.id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: !q.is_active }),
    });
    fetchQuestions();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-heading text-display-md text-on-surface mb-1">Questions</h1>
          <p className="text-body-md text-on-surface-variant">{questions.length} questions in bank</p>
        </div>
        <button onClick={() => setShowNew(true)} className="bg-primary text-on-primary font-bold px-4 py-2.5 rounded-xl hover:opacity-90 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span> New Question
        </button>
      </div>

      {showNew && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 mb-6 shadow-sm">
          <h3 className="font-heading text-headline-md text-on-surface mb-4">New Question</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <select value={form.exam_type} onChange={(e) => setForm({ ...form, exam_type: e.target.value })} className="bg-surface-container rounded-lg border border-outline-variant py-2.5 px-3 text-body-md">
              <option value="speaking">Speaking</option>
              <option value="writing">Writing</option>
            </select>
            {form.exam_type === "writing" && (
              <select value={form.task_type} onChange={(e) => setForm({ ...form, task_type: e.target.value })} className="bg-surface-container rounded-lg border border-outline-variant py-2.5 px-3 text-body-md">
                <option value="task1">Task 1</option>
                <option value="task2">Task 2</option>
              </select>
            )}
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })} className="bg-surface-container rounded-lg border border-outline-variant py-2.5 px-3 text-body-md">
              <option value={1}>Easy</option>
              <option value={2}>Medium</option>
              <option value={3}>Hard</option>
            </select>
            <select value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} className="bg-surface-container rounded-lg border border-outline-variant py-2.5 px-3 text-body-md">
              <option value="general">General Training</option>
              <option value="academic">Academic</option>
            </select>
          </div>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Short title (e.g. Community Service in Schools)"
            className="w-full bg-surface-container rounded-lg border border-outline-variant py-2.5 px-3 text-body-md mb-3"
          />
          <textarea value={form.prompt_text} onChange={(e) => setForm({ ...form, prompt_text: e.target.value })} placeholder="Full question prompt..." className="w-full bg-surface-container rounded-lg border border-outline-variant p-3 text-body-md resize-none h-24 mb-4" />
          <div className="flex gap-3">
            <button onClick={handleCreate} className="bg-primary text-on-primary font-bold px-4 py-2 rounded-lg hover:opacity-90">Create</button>
            <button onClick={() => setShowNew(false)} className="text-on-surface-variant hover:text-on-surface px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {questions.map((q) => (
          <div key={q.id} className={`bg-surface-container-lowest rounded-xl border p-5 shadow-sm ${q.is_active ? "border-outline-variant" : "border-outline-variant/30 opacity-50"}`}>
            {editing === q.id ? (
              <div className="space-y-3">
                <input value={q.title || ""} onChange={(e) => setQuestions(questions.map((qq) => qq.id === q.id ? { ...qq, title: e.target.value } : qq))} placeholder="Title" className="w-full bg-surface-container rounded-lg border border-outline-variant py-2 px-3 text-body-md" />
                <textarea value={q.prompt_text} onChange={(e) => setQuestions(questions.map((qq) => qq.id === q.id ? { ...qq, prompt_text: e.target.value } : qq))} className="w-full bg-surface-container rounded-lg border border-outline-variant p-3 text-body-md resize-none h-24" />
                <div className="flex gap-2 items-center">
                  <select value={q.difficulty} onChange={(e) => setQuestions(questions.map((qq) => qq.id === q.id ? { ...qq, difficulty: Number(e.target.value) } : qq))} className="bg-surface-container rounded-lg border border-outline-variant py-1.5 px-2 text-label-sm">
                    <option value={1}>Easy</option>
                    <option value={2}>Medium</option>
                    <option value={3}>Hard</option>
                  </select>
                  <select value={q.module || "general"} onChange={(e) => setQuestions(questions.map((qq) => qq.id === q.id ? { ...qq, module: e.target.value } : qq))} className="bg-surface-container rounded-lg border border-outline-variant py-1.5 px-2 text-label-sm">
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                  </select>
                  <button onClick={() => handleUpdate(q.id)} className="bg-primary text-on-primary text-label-sm font-bold px-3 py-1.5 rounded-lg">Save</button>
                  <button onClick={() => setEditing(null)} className="text-on-surface-variant text-label-sm px-3 py-1.5">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-label-sm bg-surface-container-high px-2 py-0.5 rounded capitalize">{q.exam_type}{q.task_type ? ` — ${q.task_type.replace("task", "Task ")}` : ""}</span>
                    <span className="text-label-sm text-on-surface-variant">{q.difficulty === 1 ? "Easy" : q.difficulty === 2 ? "Medium" : "Hard"}</span>
                    <span className={`text-label-sm px-2 py-0.5 rounded ${q.is_active ? "bg-emerald-100 text-emerald-700" : "bg-surface-container-high text-on-surface-variant"}`}>{q.is_active ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleActive(q)} className="text-label-sm text-on-surface-variant hover:text-on-surface px-2 py-1 rounded">{q.is_active ? "Disable" : "Enable"}</button>
                    <button onClick={() => setEditing(q.id)} className="text-label-sm text-primary hover:underline px-2 py-1">Edit</button>
                    <button onClick={() => handleDelete(q.id)} className="text-label-sm text-error hover:underline px-2 py-1">Delete</button>
                  </div>
                </div>
                <p className="text-body-md text-on-surface">{q.prompt_text}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
