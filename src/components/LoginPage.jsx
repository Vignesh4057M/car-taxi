import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { getStyles } from "../utils/styles";
import { api } from "../utils/api";

export default function LoginPage({ setPage, onLogin, showToast }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();
  const styles = getStyles(isDark);

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      showToast("Please fill all fields", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/login", form);
      if (res.success) {
        onLogin(res.session);
        showToast(res.message || "Logged in!", "success");
      } else {
        showToast(res.message || "Invalid credentials", "error");
      }
    } catch {
      showToast("Server error", "error");
    }
    setLoading(false);
  };

  return (
    <div style={styles.authBg} className="auth-bg">
      <div style={styles.authCard} className="auth-card">
        <div style={styles.authLogo}>NT</div>
        <h2 style={styles.authTitle}>Welcome Back</h2>
        <p style={styles.authSub}>Sign in to your Namma Taxi account</p>
        <div style={styles.formGroup}>
          <label style={styles.label}>Username / Email</label>
          <input
            style={styles.input}
            placeholder="Enter username or email"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <button
          style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p style={styles.authSwitch}>
          New user?{" "}
          <span style={styles.authLink} onClick={() => setPage("register")}>
            Create account
          </span>
        </p>
        {/* <div style={styles.adminHint}>
          Admin: username <b>admin</b> / password <b>admin123</b>
        </div> */}
      </div>
    </div>
  );
}
