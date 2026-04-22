import { useState, useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, default 4000
}

// Singleton event bus (no extra library needed)
const toastBus = new EventTarget();

export function showToast(toast: Omit<Toast, "id">) {
  toastBus.dispatchEvent(
    new CustomEvent("toast", {
      detail: { ...toast, id: Date.now().toString() },
    })
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const toast = (e as CustomEvent<Toast>).detail;
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, toast.duration ?? 4000);
    };
    toastBus.addEventListener("toast", handler);
    return () => toastBus.removeEventListener("toast", handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        maxWidth: "360px",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            background:
              toast.type === "success"
                ? "rgba(16, 185, 129, 0.97)"
                : toast.type === "error"
                ? "rgba(239, 68, 68, 0.97)"
                : toast.type === "warning"
                ? "rgba(245, 158, 11, 0.97)"
                : "rgba(59, 130, 246, 0.97)",
            color: "white",
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            animation: "toastSlideIn 0.3s ease",
            fontFamily: "'Inter', sans-serif",
            pointerEvents: "all",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.95rem",
              marginBottom: toast.message ? "4px" : 0,
            }}
          >
            {toast.type === "success"
              ? "✅ "
              : toast.type === "error"
              ? "❌ "
              : toast.type === "warning"
              ? "⚠️ "
              : "ℹ️ "}
            {toast.title}
          </div>
          {toast.message && (
            <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
              {toast.message}
            </div>
          )}
        </div>
      ))}
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
