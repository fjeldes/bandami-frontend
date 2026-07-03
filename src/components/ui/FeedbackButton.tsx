"use client";

import { useState } from "react";

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScuentmf5p5Zyg5ZpuBFdqeEHHa1nQCLCwrJ3ILfZNo3LdBAA/viewform?embedded=true&entry.1071395621=General";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      <div className="fixed bottom-6 right-0 z-[60] flex items-end">
        <div
          className={`transition-all duration-500 ease-out ${
            isVisible
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col items-center rounded-l-lg bg-primary text-on-primary shadow-lg overflow-hidden">
            <button
              onClick={() => setOpen(true)}
              className="px-4 py-3 hover:bg-white/10 active:bg-white/20 transition-all duration-500 ease-out font-label-sm text-label-sm font-medium"
              aria-label="Open feedback form"
            >
              Feedback
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="w-full h-8 flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-all duration-500 ease-out border-t border-white/10"
              aria-label="Hide feedback button"
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>

        {!isVisible && (
          <button
            onClick={() => setIsVisible(true)}
            className="fixed bottom-6 right-0 w-10 h-14 rounded-l-lg bg-primary text-on-primary shadow-lg hover:bg-white/10 active:bg-white/20 transition-all duration-500 ease-out flex items-center justify-center"
            aria-label="Show feedback button"
          >
            <span className="material-symbols-outlined text-[18px]">
              chevron_left
            </span>
          </button>
        )}
      </div>

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
