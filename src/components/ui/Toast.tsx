"use client";

import { useEffect, useState, createContext, useContext, useCallback, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  action?: { label: string; onClick: () => void };
}

let toastId = 0;
const listeners = new Set<() => void>();
let toasts: Toast[] = [];

function notify() {
  listeners.forEach((l) => l());
}

export function showToast(message: string, type: ToastType = "info", action?: Toast["action"]) {
  const id = ++toastId;
  toasts = [...toasts, { id, message, type, action }];
  notify();
  if (type !== "error") {
    setTimeout(() => dismissToast(id), 4000);
  }
  return id;
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

const ToastContext = createContext<Toast[]>([]);

export function useToast() {
  return useContext(ToastContext);
}

export function showSuccess(msg: string, action?: Toast["action"]) { return showToast(msg, "success", action); }
export function showError(msg: string) { return showToast(msg, "error"); }
export function showInfo(msg: string, action?: Toast["action"]) { return showToast(msg, "info", action); }

function ToastItem({ toast }: { toast: Toast }) {
  const colors: Record<ToastType, string> = {
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    error: "bg-error-container text-on-error-container border-error/30",
    info: "bg-primary-fixed text-on-primary-fixed border-primary/20",
  };
  const icons: Record<ToastType, string> = {
    success: "check_circle",
    error: "error",
    info: "info",
  };

  return (
    <div className={`rounded-lg border px-4 py-3 shadow-lg flex items-start gap-3 animate-slide-up w-[calc(100vw-2rem)] max-w-[420px] ${colors[toast.type]}`}>
      <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">{icons[toast.type]}</span>
      <p className="text-body-md flex-1">{toast.message}</p>
      <div className="flex items-center gap-2 shrink-0">
        {toast.action && (
          <button onClick={toast.action.onClick} className="text-label-sm font-semibold underline hover:opacity-80">{toast.action.label}</button>
        )}
        <button onClick={() => dismissToast(toast.id)} className="opacity-60 hover:opacity-100">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}

export function ToastContainer({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    const update = () => setItems([...toasts]);
    listeners.add(update);
    update();
    return () => { listeners.delete(update); };
  }, []);

  return (
    <>
      {children}
      {items.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
          {items.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
