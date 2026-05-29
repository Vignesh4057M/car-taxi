import { useTheme } from "../context/ThemeContext";
import { getStyles } from "../utils/styles";

export default function CarForm({ form, setForm, onSave, onCancel }) {
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
        {form.id ? "Edit Car" : "Add Car"}
      </h3>
      <div style={styles.grid3}>
        {[
          ["make", "Make"], ["model", "Model"], ["year", "Year"],
          ["license_plate", "License Plate"], ["insurance_no", "Insurance No"],
          ["color", "Color"], ["seating_capacity", "Seating Capacity"],
        ].map(([key, label]) => (
          <div key={key} style={styles.formGroup}>
            <label style={styles.labelDark}>{label}</label>
            <input placeholder={label} {...f(key)} />
          </div>
        ))}
        <div style={styles.formGroup}>
          <label style={styles.labelDark}>Status</label>
          <select style={styles.input} value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.labelDark}>EMI Date</label>
          <input type="date" {...f("emi_date")} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.labelDark}>Service Date</label>
          <input type="date" {...f("service_date")} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <div style={styles.formGroup}>
            <label style={styles.labelDark}>Notes</label>
            <input placeholder="Notes" {...f("notes")} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button style={styles.submitBtn} onClick={onSave}>Save Car</button>
        <button style={styles.cancelBtn} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
