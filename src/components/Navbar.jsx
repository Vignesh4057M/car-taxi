import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { getStyles, gold } from "../utils/styles";

export default function Navbar({ page, setPage, session, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const styles = getStyles(isDark);

  const navItems = [
    { key: "home", label: "🏠 Home" },
    { key: "booknow", label: "🚖 Book Now" },
    session?.user_email ? { key: "mycart", label: "🧾 My Trips" } : null,
    session?.admin_logged_in ? { key: "dashboard", label: "📊 Dashboard" } : null,
  ].filter(Boolean);

  const close = () => setMenuOpen(false);

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          {/* Brand — always visible */}
          <div style={styles.navBrand} onClick={() => { setPage("home"); close(); }}>
            <div style={styles.navLogo}>NT</div>
            <span style={styles.navTitle}>NAMMA TAXI</span>
          </div>

          {/* Desktop links */}
          <div className="nav-links" style={styles.navLinks}>
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                style={{ ...styles.navBtn, ...(page === item.key ? styles.navBtnActive : {}) }}
              >
                {item.label}
              </button>
            ))}
            {session?.user_email || session?.admin_logged_in ? (
              <button onClick={onLogout} style={styles.navBtnLogout}>Logout</button>
            ) : (
              <>
                <button onClick={() => setPage("login")} style={styles.navBtn}>Login</button>
                <button onClick={() => setPage("driver-login")} style={styles.navBtn}>🚖 Driver</button>
                <button onClick={() => setPage("register")} style={styles.navBtnCta}>Sign Up</button>
              </>
            )}
            <button onClick={toggleTheme} style={styles.themeToggleBtn}>
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>

          {/* Mobile three-dot */}
          <button
            className="hamburger-btn"
            style={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ⋮
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          onClick={close}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            zIndex: 1100, backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Mobile side drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 260,
        background: isDark ? "#0d0f1a" : "#ffffff",
        borderLeft: `1px solid ${isDark ? "#1e2235" : "#e0ddd4"}`,
        zIndex: 1200, display: "flex", flexDirection: "column",
        transform: menuOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.28s cubic-bezier(.4,0,.2,1)",
        boxShadow: menuOpen ? "-8px 0 32px rgba(0,0,0,0.3)" : "none",
      }}>
        {/* Drawer header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 18px 14px",
          borderBottom: `1px solid ${isDark ? "#1e2235" : "#ece9e0"}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={styles.navLogo}>NT</div>
            <span style={{ ...styles.navTitle, fontSize: 15 }}>NAMMA TAXI</span>
          </div>
          <button onClick={close} style={{
            background: "none", border: "none", fontSize: 22,
            color: isDark ? "#888" : "#555", cursor: "pointer", lineHeight: 1,
          }}>✕</button>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: "12px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { setPage(item.key); close(); }}
              style={{
                background: page === item.key ? `${gold}18` : "none",
                border: "none",
                borderLeft: page === item.key ? `3px solid ${gold}` : "3px solid transparent",
                color: page === item.key ? gold : (isDark ? "#ccc" : "#333"),
                padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                fontSize: 15, fontWeight: page === item.key ? 700 : 500,
                textAlign: "left", fontFamily: "'Sora', sans-serif", width: "100%",
              }}
            >
              {item.label}
            </button>
          ))}

          <div style={{ borderTop: `1px solid ${isDark ? "#1e2235" : "#ece9e0"}`, margin: "8px 0" }} />

          {session?.user_email || session?.admin_logged_in ? (
            <button onClick={() => { onLogout(); close(); }} style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid #ef444430",
              color: "#ef4444", padding: "11px 14px", borderRadius: 10,
              cursor: "pointer", fontSize: 14, fontWeight: 600,
              textAlign: "left", fontFamily: "'Sora', sans-serif",
            }}>
              🚪 Logout
            </button>
          ) : (
            <>
              <button onClick={() => { setPage("login"); close(); }} style={{
                background: "none", border: `1px solid ${isDark ? "#333" : "#ddd"}`,
                color: isDark ? "#ccc" : "#333", padding: "11px 14px", borderRadius: 10,
                cursor: "pointer", fontSize: 14, fontWeight: 500,
                textAlign: "left", fontFamily: "'Sora', sans-serif",
              }}>
                🔑 Login
              </button>
              <button onClick={() => { setPage("driver-login"); close(); }} style={{
                background: "none", border: `1px solid ${isDark ? "#333" : "#ddd"}`,
                color: isDark ? "#ccc" : "#333", padding: "11px 14px", borderRadius: 10,
                cursor: "pointer", fontSize: 14, fontWeight: 500,
                textAlign: "left", fontFamily: "'Sora', sans-serif",
              }}>
                🚖 Driver Login
              </button>
              <button onClick={() => { setPage("register"); close(); }} style={{
                background: `linear-gradient(135deg, ${gold}, #a90f28)`,
                border: "none", color: "#fff", padding: "12px 14px", borderRadius: 10,
                cursor: "pointer", fontSize: 14, fontWeight: 700,
                textAlign: "left", fontFamily: "'Sora', sans-serif",
              }}>
                ✨ Sign Up
              </button>
            </>
          )}
        </div>

        {/* Theme toggle at bottom */}
        <div style={{ padding: "12px 12px 20px" }}>
          <button onClick={toggleTheme} style={{
            width: "100%", padding: "10px", borderRadius: 10,
            border: `1px solid ${isDark ? "#1e2235" : "#ddd"}`,
            background: isDark ? "#161922" : "#f5f3ef",
            color: isDark ? "#ccc" : "#444",
            fontSize: 14, cursor: "pointer", fontFamily: "'Sora', sans-serif",
          }}>
            {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </div>
    </>
  );
}
