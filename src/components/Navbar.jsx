import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { getStyles } from "../utils/styles";

export default function Navbar({ page, setPage, session, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const styles = getStyles(isDark);

  const navItems = [
    { key: "home", label: "Home" },
    { key: "booknow", label: "Book Now" },
    session?.user_email ? { key: "mycart", label: "My Trips" } : null,
    session?.admin_logged_in ? { key: "dashboard", label: "Dashboard" } : null,
  ].filter(Boolean);

  return (
    <nav style={styles.nav}>
      <div style={styles.navInner}>
        <div style={styles.navBrand} onClick={() => setPage("home")}>
          <div style={styles.navLogo}>NT</div>
          <span style={styles.navTitle}>NAMMA TAXI</span>
        </div>

        <div
          className="nav-links"
          style={{ ...styles.navLinks, display: menuOpen ? "flex" : undefined }}
        >
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setPage(item.key);
                setMenuOpen(false);
              }}
              style={{
                ...styles.navBtn,
                ...(page === item.key ? styles.navBtnActive : {}),
              }}
            >
              {item.label}
            </button>
          ))}

          {session?.user_email || session?.admin_logged_in ? (
            <button onClick={onLogout} style={styles.navBtnLogout}>
              Logout
            </button>
          ) : (
            <>
              <button onClick={() => setPage("login")} style={styles.navBtn}>
                Login
              </button>

              <button
                onClick={() => setPage("driver-login")}
                style={styles.navBtn}
              >
                🚖 Driver
              </button>

              <button
                onClick={() => setPage("register")}
                style={styles.navBtnCta}
              >
                Sign Up
              </button>
            </>
          )}

          <button onClick={toggleTheme} style={styles.themeToggleBtn}>
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>

        <button
          style={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>
    </nav>
  );
}