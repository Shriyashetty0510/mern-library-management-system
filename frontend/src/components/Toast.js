import React, { useEffect } from "react";

export default function Toast({ toasts, remove }) {
  return (
    <div style={{
      position: "fixed", bottom: 22, right: 22,
      zIndex: 9999, display: "flex", flexDirection: "column", gap: 8,
    }}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} remove={remove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, remove }) {
  useEffect(() => {
    const timer = setTimeout(() => remove(toast.id), 3200);
    return () => clearTimeout(timer);
  }, [toast.id, remove]);

  const isErr = toast.type === "error";
  return (
    <div style={{
      background: isErr ? "var(--red-bg)" : "var(--green-bg)",
      color:      isErr ? "var(--red)"    : "var(--green)",
      border:    `0.5px solid ${isErr ? "var(--red-bd)" : "var(--green-bd)"}`,
      borderRadius: "var(--r)",
      padding: "10px 14px",
      fontSize: 13,
      display: "flex", alignItems: "center", gap: 9,
      boxShadow: "var(--shadow)",
      animation: "slideRight 0.22s ease",
      minWidth: 240, maxWidth: 340,
    }}>
      <span style={{ fontSize: 16 }}>{isErr ? "✖" : "✔"}</span>
      <span style={{ flex: 1 }}>{toast.msg}</span>
      <button onClick={() => remove(toast.id)}
        style={{ background: "none", border: "none", color: "inherit", fontSize: 16, opacity: 0.6, padding: 0 }}>
        ×
      </button>
    </div>
  );
}
