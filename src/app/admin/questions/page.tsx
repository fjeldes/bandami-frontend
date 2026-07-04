"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import RichTextEditor from "@/components/ui/RichTextEditor";
import RichTextRenderer from "@/components/ui/RichTextRenderer";

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
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB");
      return;
    }
    setPendingImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setForm((prev) => ({ ...prev, img_url: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageUploadForQuestion = async (file: File, questionId: string) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/v1/admin/questions/${questionId}/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, img_url: data.img_url } : q))
      );
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreate = async () => {
    const payload = { ...form, task_type: form.exam_type === "writing" ? form.task_type : undefined };
    const created = await apiFetch<Question>("/admin/questions", { method: "POST", body: JSON.stringify(payload) });

    if (created && pendingImageFile) {
      setUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append("file", pendingImageFile);
        const response = await fetch(`/api/v1/admin/questions/${created.id}/image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
          },
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          await apiFetch(`/admin/questions/${created.id}`, {
            method: "PATCH",
            body: JSON.stringify({ img_url: data.img_url }),
          });
        }
      } catch (err) {
        console.error("Image upload after create failed:", err);
      } finally {
        setUploadingImage(false);
      }
    }
    setPendingImageFile(null);
    setShowNew(false);
    setForm({ exam_type: "speaking", task_type: null, difficulty: 1, prompt_text: "", title: "", module: "general", img_url: null, img_info: null });
    fetchQuestions(1);
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
    await apiFetch(`/admin/questions/${q.id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: !q.is_active }),
    });
    fetchQuestions(page);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-heading text-display-md text-on-surface mb-1">Questions</h1>
          <p className="text-body-md text-on-surface-variant">{questions.length} questions{filterType !== "all" ? ` (${filterType})` : ""}</p>
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
              <select value={form.task_type ?? ""} onChange={(e) => setForm({ ...form, task_type: e.target.value })} className="bg-surface-container rounded-lg border border-outline-variant py-2.5 px-3 text-body-md">
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
          <RichTextEditor value={form.prompt_text} onChange={(value) => setForm({ ...form, prompt_text: value })} placeholder="Full question prompt..." className="mb-4" />
          {form.exam_type === "writing" && form.task_type === "task1" && (
            <div className="mb-4 space-y-2">
              <label className="text-label-md text-on-surface font-medium">Image (optional)</label>
              <div className="flex items-center gap-3">
                <label htmlFor="image-upload" className="flex items-center gap-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded-lg px-4 py-2 cursor-pointer text-body-md text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  {uploadingImage ? "Uploading..." : "Choose file"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  className="hidden"
                  id="image-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
                {form.img_url && (
                  <span className="text-label-sm text-emerald-600">Image selected</span>
                )}
              </div>
              {form.img_url && (
                <img src={form.img_url} alt="Preview" className="max-h-40 rounded-lg border border-outline-variant" />
              )}
              <label className="text-label-md text-on-surface font-medium">Image Description (for AI evaluation)</label>
              <textarea
                value={form.img_info || ""}
                onChange={(e) => setForm({ ...form, img_info: e.target.value || null })}
                placeholder="Describe the image in detail so the AI can evaluate the response accurately. Example: 'Line graph showing average monthly temperatures in London, New York, and Sydney from January to December. London ranges from 5°C to 19°C...'"
                className="w-full bg-surface-container rounded-lg border border-outline-variant py-2.5 px-3 text-body-md resize-none h-24"
              />
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={handleCreate} className="bg-primary text-on-primary font-bold px-4 py-2 rounded-lg hover:opacity-90">Create</button>
            <button onClick={() => setShowNew(false)} className="text-on-surface-variant hover:text-on-surface px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button onClick={() => handleFilterChange("all")} className={`px-4 py-2 rounded-lg text-label-sm font-medium ${filterType === "all" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>All ({counts.writing + counts.speaking})</button>
        <button onClick={() => handleFilterChange("writing")} className={`px-4 py-2 rounded-lg text-label-sm font-medium ${filterType === "writing" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>Writing ({counts.writing})</button>
        <button onClick={() => handleFilterChange("speaking")} className={`px-4 py-2 rounded-lg text-label-sm font-medium ${filterType === "speaking" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>Speaking ({counts.speaking})</button>
      </div>

      <div className="space-y-3">
        {questions.map((q) => (
          <div key={q.id} className={`bg-surface-container-lowest rounded-xl border p-5 shadow-sm ${q.is_active ? "border-outline-variant" : "border-outline-variant/30 opacity-50"}`}>
            {editing === q.id ? (
              <div className="space-y-3">
                <input value={q.title || ""} onChange={(e) => setQuestions(questions.map((qq) => qq.id === q.id ? { ...qq, title: e.target.value } : qq))} placeholder="Title" className="w-full bg-surface-container rounded-lg border border-outline-variant py-2 px-3 text-body-md" />
                <RichTextEditor value={q.prompt_text} onChange={(value) => setQuestions(questions.map((qq) => qq.id === q.id ? { ...qq, prompt_text: value } : qq))} className="mb-3" />
                {q.exam_type === "writing" && q.task_type === "task1" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded-lg px-3 py-1.5 cursor-pointer text-label-sm text-on-surface transition-colors">
                        <span className="material-symbols-outlined text-[16px]">upload</span>
                        {uploadingImage ? "Uploading..." : "Upload Image"}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUploadForQuestion(file, q.id);
                          }}
                        />
                      </label>
                      {q.img_url && <span className="text-label-sm text-emerald-600">Has image</span>}
                    </div>
                    {q.img_url && <img src={q.img_url} alt="Current" className="max-h-32 rounded border border-outline-variant" />}
                    <textarea value={q.img_info || ""} onChange={(e) => setQuestions(questions.map((qq) => qq.id === q.id ? { ...qq, img_info: e.target.value } : qq))} placeholder="Image description for AI evaluation..." className="w-full bg-surface-container rounded-lg border border-outline-variant py-2 px-3 text-body-md resize-none h-20" />
                  </div>
                )}
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
                <RichTextRenderer content={q.prompt_text} className="text-body-md text-on-surface" />
              </>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => { setPage(page - 1); fetchQuestions(page - 1); }}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg text-label-sm font-medium bg-surface-container text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-body-md text-on-surface-variant">Page {page} of {totalPages}</span>
          <button
            onClick={() => { setPage(page + 1); fetchQuestions(page + 1); }}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg text-label-sm font-medium bg-surface-container text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
