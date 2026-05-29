import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { getStyles, gold, goldLight } from "../utils/styles";
import { api } from "../utils/api";

export default function DriverLoginPage({ setPage, onDriverLogin, showToast }) {
  const { isDark } = useTheme();
  const styles = getStyles(isDark);
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const bg = isDark ? "#0d0d0d" : "#f5f5f0";
  const card = isDark ? "#161616" : "#fff";
  const border = isDark ? "#222" : "#e0ddd4";
  const text = isDark ? "#fff" : "#111";
  const sub = isDark ? "#888" : "#666";
  const inputBg = isDark ? "#111" : "#f9f7f2";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/driver/login", form);
      if (res.success) {
        showToast(res.message, "success");
        onDriverLogin(res.session);
      } else {
        showToast(res.message, "error");
      }
    } catch {
      showToast("Server error", "error");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: `linear-gradient(135deg, ${gold}, ${goldLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: 28
          }}>🚖</div>
          <h1 style={{ color: text, fontFamily: "'Space Mono', monospace", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
            Driver Portal
          </h1>
          <p style={{ color: sub, fontSize: 14 }}>Sign in to your driver account</p>
        </div>

        <div style={{
          background: card, borderRadius: 16, padding: 32,
          border: `1px solid ${border}`, boxShadow: isDark ? "0 8px 40px rgba(0,0,0,0.4)" : "0 8px 40px rgba(0,0,0,0.08)"
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", color: sub, fontSize: 13, marginBottom: 6, fontWeight: 500 }}>
                Phone / Email
              </label>
              <input
                type="text"
                placeholder="Enter your phone or email"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10,
                  background: inputBg, border: `1px solid ${border}`,
                  color: text, fontSize: 14, outline: "none",
                  fontFamily: "'Sora', sans-serif"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", color: sub, fontSize: 13, marginBottom: 6, fontWeight: 500 }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10,
                  background: inputBg, border: `1px solid ${border}`,
                  color: text, fontSize: 14, outline: "none",
                  fontFamily: "'Sora', sans-serif"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px",
                background: loading ? "#666" : `linear-gradient(135deg, ${gold}, ${goldLight})`,
                border: "none", borderRadius: 10, color: "#000",
                fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Sora', sans-serif", marginTop: 4
              }}
            >
              {loading ? "Signing in..." : "Sign In as Driver"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button onClick={() => setPage("login")} style={{
              background: "none", border: "none", color: gold,
              cursor: "pointer", fontSize: 13, textDecoration: "underline"
            }}>
              Customer Login →
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={() => setPage("home")} style={{
            background: "none", border: "none", color: sub,
            cursor: "pointer", fontSize: 13
          }}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
