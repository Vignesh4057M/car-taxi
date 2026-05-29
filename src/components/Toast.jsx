import { useEffect } from "react";

export default function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: "#22c55e",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        background: colors[type] || colors.info,
        color: "#fff",
        padding: "14px 22px",
        borderRadius: 12,
        fontFamily: "'Sora', sans-serif",
        fontWeight: 600,
        fontSize: 15,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        zIndex: 9999,
        maxWidth: 340,
        animation: "slideIn 0.3s ease",
      }}
    >
      {msg}
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          marginLeft: 12,
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        ×
      </button>
    </div>
  );
}
