"use client";

import { useState } from "react";

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScuentmf5p5Zyg5ZpuBFdqeEHHa1nQCLCwrJ3ILfZNo3LdBAA/viewform?embedded=true";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-on-primary shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        aria-label="Send feedback"
      >
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          feedback
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow"
            >
              <span className="material-symbols-outlined text-[20px] text-gray-600">close</span>
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
