import { useTheme } from "../context/ThemeContext";
import { getStyles } from "../utils/styles";

export default function DriverForm({ form, setForm, onSave, onCancel }) {
  const { isDark } = useTheme();
  const styles = getStyles(isDark);

  const f = (key) => ({
    style: styles.input,
    value: form[key] || "",
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <div style={styles.formCard}>
      <h3 style={{ color: styles.textPrimary, marginBottom: 16 }}>
        {form.id ? "Edit Driver" : "Add Driver"}
      </h3>
      <div style={styles.grid3}>
        {[
          ["name", "Driver Name"], ["age", "Age"], ["phone", "Phone"],
          ["email", "Email"], ["license", "License No"], ["expiry", "License Expiry"],
          ["experience", "Experience (years)"], ["address", "Address"], ["notes", "Notes"],
        ].map(([key, label]) => (
          <div key={key} style={styles.formGroup}>
            <label style={styles.labelDark}>{label}</label>
            <input placeholder={label} {...f(key)} />
          </div>
        ))}
        <div style={styles.formGroup}>
          <label style={styles.labelDark}>
            {form.id ? "New Password (leave blank to keep)" : "Password"}
          </label>
          <input
            type="password"
            placeholder="Driver login password"
            style={styles.input}
            value={form.password || ""}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button style={styles.submitBtn} onClick={onSave}>Save Driver</button>
        <button style={styles.cancelBtn} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
