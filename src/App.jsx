import { useState, useEffect, useCallback } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { api } from "./utils/api";

import Toast from "./components/Toast";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import BookNowPage from "./components/BookNowPage";
import MyCartPage from "./components/MyCartPage";
import DashboardPage from "./components/DashboardPage";
import DriverLoginPage from "./components/DriverLoginPage";
import DriverPanelPage from "./components/DriverPanelPage";

function AppInner() {
  const [page, setPage] = useState("home");
  const [session, setSession] = useState(null);
  const [toast, setToast] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    api.get("/api/session").then(setSession).catch(() => {});
  }, []);

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type, id: Date.now() });
  }, []);

  const handleLogin = (sess) => {
    setSession(sess);
    setPage(sess?.admin_logged_in ? "dashboard" : "home");
  };

  const handleDriverLogin = (sess) => {
    setSession(prev => ({ ...prev, ...sess }));
    setPage("driver-panel");
  };

  const handleLogout = async () => {
    await api.post("/api/logout", {});
    setSession(null);
    setPage("home");
    showToast("Logged out successfully", "info");
  };

  const bg = isDark ? "#0d0d0d" : "#f5f5f0";
  const selectOptionBg = isDark ? "#1a1a1a" : "#ffffff";

  const isFullPage = page === "dashboard" || page === "driver-panel";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Sora', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${bg}; transition: background 0.3s ease; overflow-x: hidden; }
        img { max-width: 100%; }
        button { transition: transform .2s ease, box-shadow .2s ease, background .2s ease; }
        button:hover { transform: translateY(-1px); }
        table { min-width: 720px; }
        .table-wrap, [style*="overflow"] { max-width: 100%; } 
        .hover-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .hover-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important; }
        @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        select option { background: ${selectOptionBg}; color: ${isDark ? "#fff" : "#111"}; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${isDark ? "#111" : "#eee"}; }
        ::-webkit-scrollbar-thumb { background: #d4a017; border-radius: 3px; }
        .nav-links { display: flex; gap: 4px; align-items: center; }
        .hamburger-btn { display: none !important; }
        @media (max-width: 980px) {
          table { min-width: 760px; }
        }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .hamburger-btn { display: flex !important; }

          /* Hero */
          section[style*="78vh"] { padding: 80px 20px 60px !important; min-height: 60vh !important; }

          /* Auth cards */
          .auth-card { padding: 24px 16px !important; max-width: calc(100% - 32px) !important; }

          /* Book page */
          .book-bg { padding: 20px 12px !important; }
          .book-container { padding: 20px 14px !important; }

          /* Footer grid */
          div[style*="repeat(auto-fit, minmax(200px"] { grid-template-columns: 1fr !important; }

          /* Dashboard: sidebar hidden, content full width */
          .admin-sidebar { transform: translateX(-100%); position: fixed; }
          .dash-content { margin-left: 0 !important; }
          .driver-main { margin-left: 0 !important; }

          /* Stats grid 2-col on tablet */
          div[style*="repeat(auto-fill, minmax(200px"] { grid-template-columns: 1fr 1fr !important; }

          /* Tables scrollable */
          table { min-width: 560px !important; }

          /* Fare card */
          div[style*="fareCard"] { flex-direction: column !important; align-items: flex-start !important; }

          /* Page header */
          .page-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .dash-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }

          /* Stats grid 2-col on tablet */
          div[style*="repeat(auto-fill, minmax(200px"] { grid-template-columns: 1fr 1fr !important; }
        input, select, textarea { color-scheme: ${isDark ? "dark" : "light"}; }
      `}</style>

      {!isFullPage && (
        <Navbar page={page} setPage={setPage} session={session} onLogout={handleLogout} />
      )}

      {toast && (
        <Toast key={toast.id} msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div style={!isFullPage ? { paddingTop: 76 } : {}}>
        {page === "home" && <HomePage setPage={setPage} />}
        {page === "login" && <LoginPage setPage={setPage} onLogin={handleLogin} showToast={showToast} />}
        {page === "register" && <RegisterPage setPage={setPage} onLogin={handleLogin} showToast={showToast} />}
        {page === "booknow" && <BookNowPage session={session} setPage={setPage} showToast={showToast} />}
        {page === "mycart" && <MyCartPage session={session} setPage={setPage} showToast={showToast} />}
        {page === "dashboard" && <DashboardPage session={session} setPage={setPage} showToast={showToast} />}
        {page === "driver-login" && <DriverLoginPage setPage={setPage} onDriverLogin={handleDriverLogin} showToast={showToast} />}
        {page === "driver-panel" && <DriverPanelPage session={session} setPage={setPage} showToast={showToast} onLogout={handleLogout} />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
