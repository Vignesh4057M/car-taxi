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
        @media (max-width: 980px) {
          table { min-width: 760px; }
        }
        @media (max-width: 768px) {
          .nav-links { display: none; flex-direction: column; position: absolute; top: 76px; left: 0; right: 0;
            background: ${isDark ? "#0d0d0d" : "#ffffff"}; padding: 16px;
            border-top: 1px solid ${isDark ? "#222" : "#ddd"}; z-index: 100; }
          .nav-links.open { display: flex !important; }
          .mobile-theme-btn { display: flex !important; }
        }
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
