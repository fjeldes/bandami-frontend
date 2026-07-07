"use client";

import { useState } from "react";

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScuentmf5p5Zyg5ZpuBFdqeEHHa1nQCLCwrJ3ILfZNo3LdBAA/viewform?embedded=true&entry.1071395621=General";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-sm text-label-sm text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 hover:shadow-md transition-all"
        aria-label="Open feedback form"
      >
        Feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center shadow"
            >
              <span className="material-symbols-outlined text-[20px] text-gray-600 dark:text-slate-400">close</span>
            </button>
            <iframe
              src={FORM_URL}
              className="w-full border-0"
              style={{ height: "650px" }}
              title="Feedback form"
            />
          </div>
        </div>
      )}
    </>
  );
}
