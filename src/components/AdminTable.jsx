import { useTheme } from "../context/ThemeContext";
import { getStyles } from "../utils/styles";

export default function AdminTable({ cols, rows }) {
  const { isDark } = useTheme();
  const styles = getStyles(isDark);

  return (
    <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${styles.border}` }}>
      <table style={styles.table}>
        <thead>
          <tr>
            {cols.map((c) => <th key={c} style={styles.th}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={cols.length} style={{ ...styles.td, textAlign: "center", color: styles.textMuted }}>
                No records found
              </td>
            </tr>
          ) : rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${styles.border}` }}>
              {row.map((cell, j) => <td key={j} style={styles.td}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
