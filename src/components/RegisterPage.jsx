import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { getStyles } from "../utils/styles";
import { api } from "../utils/api";

export default function RegisterPage({ setPage, onLogin, showToast }) {
  const [form, setForm] = useState({
    username: "", email: "", phone: "", password: "", confirm_password: "", district: "", gender: "",
  });
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();
  const styles = getStyles(isDark);

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.phone || !form.password) {
      showToast("Please fill all required fields", "warning");
      return;
    }
    if (form.password !== form.confirm_password) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (form.phone.length !== 10) {
      showToast("Phone number must be 10 digits", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/register", form);
      if (res.success) {
        onLogin(res.session);
        showToast("Registration successful!", "success");
      } else {
        showToast(res.message || "Registration failed", "error");
      }
    } catch {
      showToast("Server error", "error");
    }
    setLoading(false);
  };

  const f = (key) => ({
    style: styles.input,
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <div style={styles.authBg} className="auth-bg">
      <div style={{ ...styles.authCard, maxWidth: 520 }} className="auth-card">
        <div style={styles.authLogo}>NT</div>
        <h2 style={styles.authTitle}>Create Account</h2>
        <p style={styles.authSub}>Join Namma Taxi today</p>
        <div style={styles.grid2}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username *</label>
            <input placeholder="Your name" {...f("username")} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input type="email" placeholder="you@email.com" {...f("email")} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone *</label>
            <input placeholder="10-digit number" maxLength={10} {...f("phone")} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>District</label>
            <select style={styles.input} value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}>
              <option value="">Choose District</option>
              {["Tirunelveli", "Tenkasi", "Madurai", "Coimbatore", "Tuticorin"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password *</label>
            <input type="password" placeholder="Min 8 chars" {...f("password")} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password *</label>
            <input type="password" placeholder="Repeat password" {...f("confirm_password")} />
          </div>
        </div>
        <div style={{ ...styles.formGroup, marginTop: 4 }}>
          <label style={styles.label}>Gender</label>
          <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
            {["Male", "Female", "Other"].map((g) => (
              <label key={g} style={{ color: isDark ? "#ccc" : "#444", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <input type="radio" name="gender" value={g}
                  checked={form.gender === g}
                  onChange={() => setForm({ ...form, gender: g })} />
                {g}
              </label>
            ))}
          </div>
        </div>
        <button
          style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1, marginTop: 20 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
        <p style={styles.authSwitch}>
          Already have an account?{" "}
          <span style={styles.authLink} onClick={() => setPage("login")}>
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}
