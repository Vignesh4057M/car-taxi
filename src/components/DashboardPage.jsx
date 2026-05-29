import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import { getStyles, gold } from "../utils/styles";
import { api } from "../utils/api";
import AdminTable from "./AdminTable";
import DriverForm from "./DriverForm";
import CarForm from "./CarForm";

export default function DashboardPage({ session, setPage, showToast }) {
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState({ drivers: [], cars: [], trips: [] });
  const [loading, setLoading] = useState(true);
  const [driverForm, setDriverForm] = useState(null);
  const [carForm, setCarForm] = useState(null);
  const { isDark, toggleTheme } = useTheme();
  const styles = getStyles(isDark);

  const loadData = useCallback(async () => {
    try {
      const [drivers, cars, trips] = await Promise.all([
        api.get("/api/drivers"),
        api.get("/api/cars"),
        api.get("/api/trips"),
      ]);
      setData({ drivers, cars, trips });
    } catch {
      showToast("Could not load data", "error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!session?.admin_logged_in) { setPage("login"); return; }
    loadData();
  }, []);

  const deleteDriver = async (id) => {
    if (!confirm("Delete this driver?")) return;
    await api.del(`/api/drivers/${id}`);
    showToast("Driver deleted", "success");
    loadData();
  };

  const deleteCar = async (id) => {
    if (!confirm("Delete this car?")) return;
    await api.del(`/api/cars/${id}`);
    showToast("Car deleted", "success");
    loadData();
  };

  const saveDriver = async () => {
    const res = driverForm.id
      ? await api.put(`/api/drivers/${driverForm.id}`, driverForm)
      : await api.post("/api/drivers", driverForm);
    if (res.success) {
      showToast("Driver saved!", "success");
      setDriverForm(null);
      loadData();
    } else {
      showToast(res.message || "Failed", "error");
    }
  };

  const saveCar = async () => {
    const res = carForm.id
      ? await api.put(`/api/cars/${carForm.id}`, carForm)
      : await api.post("/api/cars", carForm);
    if (res.success) {
      showToast("Car saved!", "success");
      setCarForm(null);
      loadData();
    } else {
      showToast(res.message || "Failed", "error");
    }
  };

  if (!session?.admin_logged_in) return null;
  if (loading) return <div style={styles.loader}>Loading dashboard...</div>;

  const totalFare = data.trips.reduce((s, t) => s + (t.total_fare || 0), 0);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "drivers", label: `Drivers (${data.drivers.length})` },
    { key: "cars", label: `Cars (${data.cars.length})` },
    { key: "trips", label: `Trips (${data.trips.length})` },
  ];

  return (
    <div style={styles.dashBg}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <div style={styles.navLogo}>NT</div>
          <div style={{ color: isDark ? "#fff" : "#111", fontWeight: 700, fontSize: 13 }}>Admin Panel</div>
        </div>
        {tabs.map((t) => (
          <button
            key={t.key}
            style={{ ...styles.sideBtn, ...(tab === t.key ? styles.sideBtnActive : {}) }}
            onClick={() => setTab(t.key)}
          >
            {{ overview: "📊", drivers: "👤", cars: "🚗", trips: "🛣️" }[t.key]} {t.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {/* Theme Toggle in Sidebar */}
        <button
          style={{ ...styles.sideBtn, display: "flex", alignItems: "center", gap: 8 }}
          onClick={toggleTheme}
        >
          {isDark ? "☀️" : "🌙"} {isDark ? "Light Mode" : "Dark Mode"}
        </button>
        <button style={styles.sideBtn} onClick={() => setPage("home")}>🏠 Home</button>
        <button style={styles.sideBtnLogout} onClick={() => setPage("login")}>🚪 Logout</button>
      </div>

      {/* Content */}
      <div style={styles.dashContent}>
        {tab === "overview" && (
          <>
            <h2 style={styles.dashTitle}>Dashboard Overview</h2>
            <div style={styles.statsGrid}>
              {[
                { label: "Total Drivers", value: data.drivers.length, icon: "👤", color: "#6366f1" },
                { label: "Total Cars", value: data.cars.length, icon: "🚗", color: "#f59e0b" },
                { label: "Total Trips", value: data.trips.length, icon: "🛣️", color: "#22c55e" },
                { label: "Total Revenue", value: `₹${totalFare.toFixed(0)}`, icon: "💰", color: "#ef4444" },
              ].map((s) => (
                <div key={s.label} style={{ ...styles.statCard, borderLeft: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: 36 }}>{s.icon}</div>
                  <div>
                    <div style={styles.statCardNum}>{s.value}</div>
                    <div style={styles.statCardLabel}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 32 }}>
              <h3 style={styles.dashSubtitle}>Recent Trips</h3>
              <AdminTable
                cols={["Customer", "Driver", "Car", "Date", "Fare"]}
                rows={data.trips.slice(-5).reverse().map((t) => [
                  t.customer_name,
                  t.driver_name || "—",
                  `${t.car_make || ""} ${t.car_model || ""}`,
                  t.trip_date,
                  `₹${t.total_fare?.toFixed(0)}`,
                ])}
              />
            </div>
          </>
        )}

        {tab === "drivers" && (
          <>
            <div style={styles.dashHeader}>
              <h2 style={styles.dashTitle}>Drivers</h2>
              <button style={styles.heroCta} onClick={() => setDriverForm({
                name: "", age: "", phone: "", email: "", license: "", expiry: "", address: "", notes: ""
              })}>
                + Add Driver
              </button>
            </div>
            {driverForm && (
              <DriverForm
                form={driverForm}
                setForm={setDriverForm}
                onSave={saveDriver}
                onCancel={() => setDriverForm(null)}
              />
            )}
            <AdminTable
              cols={["Name", "Age", "Phone", "Email", "License", "Actions"]}
              rows={data.drivers.map((d) => [
                d.name, d.age, d.phone, d.email, d.license,
                <div key={d.id} style={{ display: "flex", gap: 8 }}>
                  <button style={styles.editBtn} onClick={() => setDriverForm({ ...d })}>Edit</button>
                  <button style={styles.delBtn} onClick={() => deleteDriver(d.id)}>Delete</button>
                </div>,
              ])}
            />
          </>
        )}

        {tab === "cars" && (
          <>
            <div style={styles.dashHeader}>
              <h2 style={styles.dashTitle}>Cars</h2>
              <button style={styles.heroCta} onClick={() => setCarForm({
                make: "", model: "", year: "", license_plate: "", insurance_no: "",
                color: "", seating_capacity: "", notes: "", status: "available",
                emi_date: "", service_date: ""
              })}>
                + Add Car
              </button>
            </div>
            {carForm && (
              <CarForm
                form={carForm}
                setForm={setCarForm}
                onSave={saveCar}
                onCancel={() => setCarForm(null)}
              />
            )}
            <AdminTable
              cols={["Make", "Model", "Year", "Plate", "Status", "Actions"]}
              rows={data.cars.map((c) => [
                c.make, c.model, c.year, c.license_plate,
                <span key={c.id} style={{
                  background: c.status === "available" ? "#22c55e20" : "#ef444420",
                  color: c.status === "available" ? "#22c55e" : "#ef4444",
                  padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600
                }}>{c.status}</span>,
                <div key={c.id} style={{ display: "flex", gap: 8 }}>
                  <button style={styles.editBtn} onClick={() => setCarForm({ ...c })}>Edit</button>
                  <button style={styles.delBtn} onClick={() => deleteCar(c.id)}>Delete</button>
                </div>,
              ])}
            />
          </>
        )}

        {tab === "trips" && (
          <>
            <h2 style={styles.dashTitle}>All Trips</h2>
            <AdminTable
              cols={["#", "Customer", "Driver", "Car", "Pickup", "Drop", "Date", "Fare", "Status", "OTP"]}
              rows={data.trips.map((t) => [
                t.id, t.customer_name,
                t.driver_name || "—",
                `${t.car_make || ""} ${t.car_model || ""}`,
                t.pickup_location, t.drop_location, t.trip_date,
                `₹${t.total_fare?.toFixed(0)}`,
                t.status || "Pending",
                t.otp || "—",
              ])}
            />
          </>
        )}
      </div>
    </div>
  );
}
