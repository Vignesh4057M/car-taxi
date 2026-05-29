import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import { gold, goldLight } from "../utils/styles";
import { api } from "../utils/api";

const STATUS_STEPS = ["Pending", "Accepted", "Reached Pickup", "Trip Started", "Trip Completed"];
const STATUS_COLOR = {
  "Pending": "#f59e0b",
  "Accepted": "#3b82f6",
  "Reached Pickup": "#8b5cf6",
  "Trip Started": "#10b981",
  "Trip Completed": "#22c55e",
  "Rejected": "#ef4444",
  "Cancelled": "#6b7280",
};

export default function DriverPanelPage({ session, setPage, showToast, onLogout }) {
  const { isDark, toggleTheme } = useTheme();
  const [tab, setTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [trips, setTrips] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState({});
  const [sideOpen, setSideOpen] = useState(false);

  const bg = isDark ? "#0d0d0d" : "#f0ede4";
  const sidebar = isDark ? "#0a0a0a" : "#fff";
  const card = isDark ? "#161616" : "#fff";
  const border = isDark ? "#222" : "#e5e2d9";
  const text = isDark ? "#fff" : "#111";
  const sub = isDark ? "#888" : "#666";
  const inputBg = isDark ? "#111" : "#f9f7f2";

  const loadAll = useCallback(async (silent = false) => {
    try {
      const [dash, tripsData, prof] = await Promise.all([
        api.get("/api/driver/dashboard"),
        api.get("/api/driver/trips"),
        api.get("/api/driver/profile"),
      ]);
      setDashboard(dash);
      setTrips(Array.isArray(tripsData) ? tripsData : []);
      setProfile(prof);
    } catch {
      if (!silent) showToast("Failed to load data", "error");
    }
    setLoading(false);
  }, [showToast]);

  const refreshTripsOnly = useCallback(async () => {
    try {
      const tripsData = await api.get("/api/driver/trips");
      setTrips(Array.isArray(tripsData) ? tripsData : []);
    } catch {
      // silent auto-refresh; avoid disturbing driver with repeated toast messages
    }
  }, []);

  useEffect(() => {
    if (!session?.driver_logged_in) { setPage("driver-login"); return; }
    loadAll();
  }, [session?.driver_logged_in, setPage, loadAll]);

  useEffect(() => {
    if (!session?.driver_logged_in) return;
    const timer = setInterval(refreshTripsOnly, 5000);
    return () => clearInterval(timer);
  }, [session?.driver_logged_in, refreshTripsOnly]);

  const toggleStatus = async () => {
    const res = await api.post("/api/driver/toggle_status", {});
    if (res.success) {
      setDashboard(prev => ({ ...prev, is_online: res.is_online }));
      showToast(res.is_online ? "You are now Online 🟢" : "You are now Offline 🔴", "info");
    }
  };

  const tripAction = async (tripId, action, otp = null) => {
    const body = { action };
    if (otp) body.otp = otp;
    const res = await api.post(`/api/driver/trips/${tripId}/action`, body);
    if (res.success) {
      showToast("Trip updated!", "success");
      setTrips(prev => prev.map(t => t.id === tripId ? res.trip : t));
      refreshTripsOnly();
    } else {
      showToast(res.message || "Failed", "error");
    }
  };

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "trips", label: "My Trips", icon: "🚗" },
    { key: "earnings", label: "Earnings", icon: "💰" },
    { key: "profile", label: "Profile", icon: "👤" },
  ];

  if (!session?.driver_logged_in) return null;
  if (loading) return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: gold, fontSize: 16, fontFamily: "'Sora', sans-serif" }}>Loading driver panel...</div>
    </div>
  );

  const pendingTrips = trips.filter(t => t.status === "Pending");
  const activeTrips = trips.filter(t => ["Accepted", "Reached Pickup", "Trip Started"].includes(t.status));
  const completedTrips = trips.filter(t => t.status === "Trip Completed");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg, fontFamily: "'Sora', sans-serif", position: "relative" }}>

      {/* Mobile overlay */}
      {sideOpen && (
        <div onClick={() => setSideOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90
        }} />
      )}

      {/* Sidebar */}
      <div style={{
        width: 240, background: sidebar, borderRight: `1px solid ${border}`,
        display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0,
        zIndex: 100, transform: sideOpen ? "translateX(0)" : undefined,
        transition: "transform 0.3s ease",
      }} className="driver-sidebar">
        {/* Logo */}
        <div style={{ padding: "20px 20px 12px", borderBottom: `1px solid ${border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: `linear-gradient(135deg, ${gold}, ${goldLight})`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
            }}>🚖</div>
            <div>
              <div style={{ color: text, fontWeight: 700, fontSize: 13, fontFamily: "'Space Mono', monospace" }}>NAMMA TAXI</div>
              <div style={{ color: sub, fontSize: 11 }}>Driver Panel</div>
            </div>
          </div>

          {/* Online/Offline Toggle */}
          <div style={{
            background: isDark ? "#1a1a1a" : "#f5f3ef",
            borderRadius: 12, padding: "12px 14px",
            border: `1px solid ${dashboard?.is_online ? "#22c55e44" : "#ef444444"}`,
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontSize: 12, color: sub, marginBottom: 2 }}>Status</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: dashboard?.is_online ? "#22c55e" : "#ef4444" }}>
                {dashboard?.is_online ? "● Online" : "● Offline"}
              </div>
            </div>
            <button onClick={toggleStatus} style={{
              padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: dashboard?.is_online
                ? "rgba(239,68,68,0.15)"
                : "rgba(34,197,94,0.15)",
              color: dashboard?.is_online ? "#ef4444" : "#22c55e",
              fontWeight: 700, fontSize: 12, fontFamily: "'Sora', sans-serif"
            }}>
              {dashboard?.is_online ? "Go Off" : "Go On"}
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 12px" }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => { setTab(item.key); setSideOpen(false); }} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "11px 12px", borderRadius: 10, border: "none", cursor: "pointer",
              background: tab === item.key
                ? `linear-gradient(135deg, ${gold}22, ${goldLight}11)`
                : "none",
              color: tab === item.key ? gold : sub,
              fontWeight: tab === item.key ? 700 : 500,
              fontSize: 14, textAlign: "left",
              marginBottom: 4, fontFamily: "'Sora', sans-serif",
              borderLeft: tab === item.key ? `3px solid ${gold}` : "3px solid transparent"
            }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: 12, borderTop: `1px solid ${border}` }}>
          <div style={{ color: sub, fontSize: 12, marginBottom: 8, padding: "0 4px" }}>
            👋 {session?.driver_name}
          </div>
          <button onClick={toggleTheme} style={{
            width: "100%", padding: "8px", borderRadius: 8, border: `1px solid ${border}`,
            background: "none", color: text, cursor: "pointer", fontSize: 13, marginBottom: 6,
            fontFamily: "'Sora', sans-serif"
          }}>
            {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <button onClick={onLogout} style={{
            width: "100%", padding: "8px", borderRadius: 8, border: `1px solid #ef444440`,
            background: "rgba(239,68,68,0.08)", color: "#ef4444", cursor: "pointer",
            fontSize: 13, fontFamily: "'Sora', sans-serif", fontWeight: 600
          }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 240, minHeight: "100vh" }} className="driver-main">
        {/* Top bar */}
        <div style={{
          position: "sticky", top: 0, background: sidebar,
          borderBottom: `1px solid ${border}`, padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          zIndex: 50
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="driver-ham" onClick={() => setSideOpen(!sideOpen)} style={{
              display: "none", background: "none", border: "none", color: text,
              fontSize: 22, cursor: "pointer"
            }}>☰</button>
            <div>
              <div style={{ color: text, fontWeight: 700, fontSize: 16 }}>
                {navItems.find(n => n.key === tab)?.icon} {navItems.find(n => n.key === tab)?.label}
              </div>
              <div style={{ color: sub, fontSize: 12 }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </div>
            </div>
          </div>
          <div style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: dashboard?.is_online ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)",
            color: dashboard?.is_online ? "#22c55e" : "#ef4444",
            border: `1px solid ${dashboard?.is_online ? "#22c55e40" : "#ef444440"}`
          }}>
            {dashboard?.is_online ? "● ONLINE" : "● OFFLINE"}
          </div>
        </div>

        <div style={{ padding: 24 }}>

          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (
            <div>
              {/* Stats Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "Today's Trips", value: dashboard?.today_trips || 0, icon: "🗓️", color: "#3b82f6" },
                  { label: "Pending Trips", value: dashboard?.pending_trips || 0, icon: "⏳", color: "#f59e0b" },
                  { label: "Completed Trips", value: dashboard?.completed_trips || 0, icon: "✅", color: "#22c55e" },
                  { label: "Today's Earnings", value: `₹${(dashboard?.today_earnings || 0).toLocaleString()}`, icon: "💵", color: gold },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: card, borderRadius: 14, padding: "20px",
                    border: `1px solid ${border}`,
                    boxShadow: isDark ? "0 2px 16px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.06)"
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, fontFamily: "'Space Mono', monospace" }}>
                      {stat.value}
                    </div>
                    <div style={{ color: sub, fontSize: 12, marginTop: 4 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Availability Banner */}
              <div style={{
                background: dashboard?.is_online
                  ? "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))"
                  : "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.08))",
                border: `1px solid ${dashboard?.is_online ? "#22c55e40" : "#ef444440"}`,
                borderRadius: 14, padding: "20px 24px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: 12, marginBottom: 24
              }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: dashboard?.is_online ? "#22c55e" : "#ef4444" }}>
                    {dashboard?.is_online ? "🟢 You are Online" : "🔴 You are Offline"}
                  </div>
                  <div style={{ color: sub, fontSize: 13, marginTop: 4 }}>
                    {dashboard?.is_online
                      ? "You are available to receive new bookings"
                      : "You will not receive new bookings until you go online"}
                  </div>
                </div>
                <button onClick={toggleStatus} style={{
                  padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: dashboard?.is_online
                    ? "linear-gradient(135deg, #ef4444, #dc2626)"
                    : `linear-gradient(135deg, ${gold}, ${goldLight})`,
                  color: dashboard?.is_online ? "#fff" : "#000",
                  fontWeight: 700, fontSize: 14, fontFamily: "'Sora', sans-serif"
                }}>
                  {dashboard?.is_online ? "Go Offline" : "Go Online"}
                </button>
              </div>

              {/* Pending Trips */}
              {pendingTrips.length > 0 && (
                <div>
                  <h3 style={{ color: text, fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
                    ⏳ New Booking Requests ({pendingTrips.length})
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {pendingTrips.map(trip => (
                      <TripCard key={trip.id} trip={trip} isDark={isDark} text={text} sub={sub} card={card} border={border} inputBg={inputBg}
                        onAction={tripAction} otpInput={otpInput} setOtpInput={setOtpInput} showActions />
                    ))}
                  </div>
                </div>
              )}

              {pendingTrips.length === 0 && (
                <div style={{
                  textAlign: "center", padding: "40px 20px",
                  background: card, borderRadius: 14, border: `1px solid ${border}`, color: sub
                }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>No pending bookings right now</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>Stay online to receive new trips</div>
                </div>
              )}
            </div>
          )}

          {/* ── TRIPS ── */}
          {tab === "trips" && (
            <div>
              {/* Active Trips */}
              {activeTrips.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ color: text, fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
                    🚗 Active Trips ({activeTrips.length})
                  </h3>
                  {activeTrips.map(trip => (
                    <TripCard key={trip.id} trip={trip} isDark={isDark} text={text} sub={sub} card={card} border={border} inputBg={inputBg}
                      onAction={tripAction} otpInput={otpInput} setOtpInput={setOtpInput} showActions />
                  ))}
                </div>
              )}

              {/* Pending */}
              {pendingTrips.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ color: text, fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
                    ⏳ Pending ({pendingTrips.length})
                  </h3>
                  {pendingTrips.map(trip => (
                    <TripCard key={trip.id} trip={trip} isDark={isDark} text={text} sub={sub} card={card} border={border} inputBg={inputBg}
                      onAction={tripAction} otpInput={otpInput} setOtpInput={setOtpInput} showActions />
                  ))}
                </div>
              )}

              {/* History */}
              <div>
                <h3 style={{ color: text, fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
                  📋 Trip History
                </h3>
                {trips.filter(t => ["Trip Completed", "Rejected", "Cancelled"].includes(t.status)).length === 0 ? (
                  <div style={{ textAlign: "center", padding: 32, color: sub }}>No trip history yet</div>
                ) : (
                  trips.filter(t => ["Trip Completed", "Rejected", "Cancelled"].includes(t.status)).map(trip => (
                    <TripCard key={trip.id} trip={trip} isDark={isDark} text={text} sub={sub} card={card} border={border} inputBg={inputBg} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── EARNINGS ── */}
          {tab === "earnings" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
                {[
                  { label: "Today's Earnings", value: dashboard?.today_earnings || 0, icon: "📅", color: "#22c55e" },
                  { label: "Weekly Earnings", value: dashboard?.weekly_earnings || 0, icon: "📆", color: "#3b82f6" },
                  { label: "Monthly Earnings", value: dashboard?.monthly_earnings || 0, icon: "🗓️", color: gold },
                  { label: "Total Completed", value: completedTrips.length, icon: "✅", color: "#8b5cf6", isCnt: true },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: card, borderRadius: 14, padding: 24,
                    border: `1px solid ${border}`, textAlign: "center"
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, fontFamily: "'Space Mono', monospace" }}>
                      {stat.isCnt ? stat.value : `₹${Number(stat.value).toLocaleString()}`}
                    </div>
                    <div style={{ color: sub, fontSize: 13, marginTop: 6 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <h3 style={{ color: text, fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Completed Trips</h3>
              {completedTrips.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: sub, background: card, borderRadius: 14, border: `1px solid ${border}` }}>
                  No completed trips yet
                </div>
              ) : (
                <div style={{ background: card, borderRadius: 14, border: `1px solid ${border}`, overflow: "hidden" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: isDark ? "#111" : "#f5f3ef" }}>
                          {["#", "Date", "From → To", "Customer", "Fare", "Status"].map(h => (
                            <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: sub, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {completedTrips.map((trip, i) => (
                          <tr key={trip.id} style={{ borderTop: `1px solid ${border}` }}>
                            <td style={{ padding: "12px 16px", color: sub, fontSize: 13 }}>{i + 1}</td>
                            <td style={{ padding: "12px 16px", color: text, fontSize: 13 }}>{trip.trip_date}</td>
                            <td style={{ padding: "12px 16px", color: text, fontSize: 12 }}>
                              <span style={{ color: "#3b82f6" }}>{trip.pickup_location}</span>
                              <span style={{ color: sub }}> → </span>
                              <span style={{ color: "#22c55e" }}>{trip.drop_location}</span>
                            </td>
                            <td style={{ padding: "12px 16px", color: text, fontSize: 13 }}>{trip.customer_name}</td>
                            <td style={{ padding: "12px 16px", color: gold, fontSize: 14, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
                              ₹{trip.total_fare?.toLocaleString()}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <span style={{
                                padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                                background: STATUS_COLOR[trip.status] + "22", color: STATUS_COLOR[trip.status]
                              }}>{trip.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {tab === "profile" && profile && (
            <div>
              <div style={{
                background: card, borderRadius: 16, padding: 28,
                border: `1px solid ${border}`, marginBottom: 20
              }}>
                {/* Avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${gold}, ${goldLight})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, flexShrink: 0
                  }}>🧑</div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: text }}>{profile.name}</div>
                    <div style={{ color: sub, fontSize: 13, marginTop: 2 }}>{profile.phone}</div>
                    <div style={{
                      display: "inline-block", marginTop: 6, padding: "4px 12px", borderRadius: 20,
                      background: profile.is_online ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)",
                      color: profile.is_online ? "#22c55e" : "#ef4444", fontSize: 12, fontWeight: 700
                    }}>
                      {profile.is_online ? "● Online" : "● Offline"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  {[
                    { label: "Full Name", value: profile.name, icon: "👤" },
                    { label: "Phone", value: profile.phone, icon: "📱" },
                    { label: "Email", value: profile.email || "Not set", icon: "📧" },
                    { label: "License No.", value: profile.license, icon: "🪪" },
                    { label: "License Expiry", value: profile.expiry, icon: "📅" },
                    { label: "Experience", value: profile.experience ? `${profile.experience} years` : "Not set", icon: "⭐" },
                    { label: "Address", value: profile.address, icon: "🏠" },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: isDark ? "#1a1a1a" : "#f9f7f2",
                      borderRadius: 10, padding: "14px 16px",
                      border: `1px solid ${border}`
                    }}>
                      <div style={{ color: sub, fontSize: 11, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{item.icon}</span>{item.label}
                      </div>
                      <div style={{ color: text, fontSize: 14, fontWeight: 600 }}>{item.value || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Car Info */}
              {profile.car && (
                <div style={{
                  background: card, borderRadius: 16, padding: 24,
                  border: `1px solid ${border}`
                }}>
                  <h3 style={{ color: text, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🚗 Assigned Vehicle</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                    {[
                      { label: "Car", value: `${profile.car.make} ${profile.car.model}`, icon: "🚘" },
                      { label: "Year", value: profile.car.year, icon: "📅" },
                      { label: "Plate No.", value: profile.car.license_plate, icon: "🔖" },
                      { label: "Color", value: profile.car.color, icon: "🎨" },
                      { label: "Capacity", value: `${profile.car.seating_capacity} seats`, icon: "💺" },
                    ].map(item => (
                      <div key={item.label} style={{
                        background: isDark ? "#1a1a1a" : "#f9f7f2",
                        borderRadius: 10, padding: "14px 16px", border: `1px solid ${border}`
                      }}>
                        <div style={{ color: sub, fontSize: 11, marginBottom: 4 }}>{item.icon} {item.label}</div>
                        <div style={{ color: text, fontSize: 14, fontWeight: 600 }}>{item.value || "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .driver-sidebar { transform: translateX(-100%); }
          .driver-sidebar.open { transform: translateX(0); }
          .driver-main { margin-left: 0 !important; }
          .driver-ham { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

function TripCard({ trip, isDark, text, sub, card, border, inputBg, onAction, otpInput, setOtpInput, showActions }) {
  const statusColor = STATUS_COLOR[trip.status] || "#888";

  return (
    <div style={{
      background: card, borderRadius: 14, border: `1px solid ${border}`,
      marginBottom: 14, overflow: "hidden",
      boxShadow: isDark ? "0 2px 16px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.06)"
    }}>
      {/* Status bar */}
      <div style={{
        background: statusColor + "18", borderBottom: `1px solid ${statusColor}33`,
        padding: "8px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: statusColor + "22", color: statusColor
          }}>{trip.status}</span>
          <span style={{ color: sub, fontSize: 12 }}>Trip #{trip.id}</span>
        </div>
        <span style={{ color: sub, fontSize: 12 }}>{trip.trip_date}</span>
      </div>

      <div style={{ padding: "16px 18px" }}>
        {/* Route */}
        <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: sub, fontSize: 11, marginBottom: 3 }}>📍 PICKUP</div>
            <div style={{ color: "#3b82f6", fontSize: 14, fontWeight: 600 }}>{trip.pickup_location}</div>
          </div>
          <div style={{ color: sub, fontSize: 20, paddingTop: 8 }}>→</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: sub, fontSize: 11, marginBottom: 3 }}>🏁 DROP</div>
            <div style={{ color: "#22c55e", fontSize: 14, fontWeight: 600 }}>{trip.drop_location}</div>
          </div>
        </div>

        {/* Customer + Fare */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: showActions ? 16 : 0 }}>
          <div style={{ background: isDark ? "#1a1a1a" : "#f9f7f2", borderRadius: 8, padding: "10px 12px", border: `1px solid ${border}` }}>
            <div style={{ color: sub, fontSize: 11 }}>👤 Customer</div>
            <div style={{ color: text, fontSize: 13, fontWeight: 600, marginTop: 2 }}>{trip.customer_name}</div>
            <div style={{ color: sub, fontSize: 12 }}>{trip.customer_phone}</div>
          </div>
          <div style={{ background: isDark ? "#1a1a1a" : "#f9f7f2", borderRadius: 8, padding: "10px 12px", border: `1px solid ${border}` }}>
            <div style={{ color: sub, fontSize: 11 }}>💰 Fare</div>
            <div style={{ color: gold, fontSize: 16, fontWeight: 800, fontFamily: "'Space Mono', monospace", marginTop: 2 }}>
              ₹{trip.total_fare?.toLocaleString()}
            </div>
            <div style={{ color: sub, fontSize: 12 }}>{trip.distance_km} km</div>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && onAction && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {trip.status === "Pending" && (
              <>
                <ActionBtn label="✓ Accept" color="#22c55e" onClick={() => onAction(trip.id, "accept")} />
                <ActionBtn label="✕ Reject" color="#ef4444" onClick={() => onAction(trip.id, "reject")} />
              </>
            )}
            {trip.status === "Accepted" && (
              <ActionBtn label="📍 Reached Pickup" color="#8b5cf6" onClick={() => onAction(trip.id, "reached_pickup")} />
            )}
            {trip.status === "Reached Pickup" && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", width: "100%" }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter customer OTP"
                  value={otpInput[trip.id] || ""}
                  onChange={e => setOtpInput(prev => ({ ...prev, [trip.id]: e.target.value }))}
                  style={{
                    padding: "9px 12px", borderRadius: 8, border: `1px solid ${border}`,
                    background: inputBg, color: text, fontSize: 14,
                    fontFamily: "'Space Mono', monospace", letterSpacing: 4, width: 180,
                    outline: "none"
                  }}
                />
                <ActionBtn label="🚦 Start Trip" color="#10b981" onClick={() => onAction(trip.id, "start", otpInput[trip.id])} />
              </div>
            )}
            {trip.status === "Trip Started" && (
              <ActionBtn label="🏁 Complete Trip" color={gold} onClick={() => onAction(trip.id, "complete")} dark />
            )}
            {["Accepted", "Reached Pickup", "Trip Started"].includes(trip.status) && (
              <ActionBtn label="✕ Cancel" color="#ef4444" variant="outline" onClick={() => onAction(trip.id, "cancel")} />
            )}
          </div>
        )}

        {/* OTP display for customer (shown for accepted trips) */}
        {trip.status === "Accepted" && trip.otp && (
          <div style={{
            marginTop: 10, padding: "8px 14px", background: "#3b82f610",
            borderRadius: 8, border: "1px solid #3b82f630", fontSize: 12, color: "#3b82f6"
          }}>
            🔐 Customer OTP: <strong style={{ fontFamily: "'Space Mono', monospace", fontSize: 14 }}>{trip.otp}</strong>
            <span style={{ color: sub, marginLeft: 8 }}>(Show to customer if needed)</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ label, color, onClick, dark, variant }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "9px 18px", borderRadius: 8, border: variant === "outline" ? `1px solid ${color}` : "none",
        cursor: "pointer", fontWeight: 700, fontSize: 13,
        background: variant === "outline"
          ? hover ? color + "22" : "transparent"
          : hover ? color : color + (dark ? "" : ""),
        color: variant === "outline" ? color : dark ? "#000" : "#fff",
        fontFamily: "'Sora', sans-serif",
        transition: "all 0.15s"
      }}
    >
      {label}
    </button>
  );
}
