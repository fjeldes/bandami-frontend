"use client";

import { useState } from "react";

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScuentmf5p5Zyg5ZpuBFdqeEHHa1nQCLCwrJ3ILfZNo3LdBAA/viewform?embedded=true&entry.1071395621=General";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      <div className="fixed bottom-0 right-0 z-[60] flex items-end">
        <div
          className={`transition-all duration-300 ease-in-out ${
            isVisible
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-3 py-4 rounded-l-lg bg-primary text-on-primary shadow-lg hover:brightness-90 active:brightness-80 transition-all font-label-sm text-label-sm font-medium"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            aria-label="Open feedback form"
          >
            <span>Feedback</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center ml-1"
              aria-label="Hide feedback button"
            >
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </button>
        </div>

        {!isVisible && (
          <button
            onClick={() => setIsVisible(true)}
            className="fixed bottom-0 right-0 w-8 h-12 rounded-l-lg bg-primary text-on-primary shadow-lg hover:brightness-90 active:brightness-80 transition-all flex items-center justify-center"
            aria-label="Show feedback button"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
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
