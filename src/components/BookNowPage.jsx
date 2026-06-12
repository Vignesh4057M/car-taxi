import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { getStyles } from "../utils/styles";
import { api } from "../utils/api";

export default function BookNowPage({ session, setPage, showToast }) {
  const [drivers, setDrivers] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fare, setFare] = useState(null);
  const { isDark } = useTheme();
  const styles = getStyles(isDark);

  const [form, setForm] = useState({
    driver_id: "", car_id: "", car_status: "available",
    pickup_location: "", drop_location: "", trip_date: "",
    distance_km: "", fare_type: "per_km", car_type: "ac",
    customer_name: "", customer_phone: "", customer_age: "",
    passengers_accompanying: "1", trip_notes: "",
  });

  useEffect(() => {
    api.get("/api/drivers").then(setDrivers).catch(() => {});
    api.get("/api/cars").then(setCars).catch(() => {});
  }, []);

  useEffect(() => {
    const km = parseFloat(form.distance_km);
    if (!km) { setFare(null); return; }
    const driverCharge = 300, padiCharge = 500;
    let total;
    if (form.fare_type === "per_km") {
      const rate = form.car_type === "ac" ? 13 : 12;
      total = km * rate + driverCharge + padiCharge;
    } else {
      const base = form.car_type === "ac" ? 1200 : 1000;
      const extra = Math.max(0, km - 250) * (form.car_type === "ac" ? 13 : 12);
      total = base + extra + driverCharge + padiCharge;
    }
    setFare(total);
  }, [form.distance_km, form.fare_type, form.car_type]);

  const handleSubmit = async () => {
    if (!session?.user_email) {
      showToast("Please login to book a trip", "warning");
      setPage("login");
      return;
    }
    const required = ["driver_id", "car_id", "pickup_location", "drop_location", "trip_date", "distance_km", "customer_name", "customer_phone", "customer_age"];
    for (const k of required) {
      if (!form[k]) { showToast(`Please fill: ${k.replace(/_/g, " ")}`, "warning"); return; }
    }
    setLoading(true);
    try {
      const res = await api.post("/api/booknow", { ...form, total_fare: fare });
      if (res.success) {
        showToast("Booking confirmed!", "success");
        setPage("mycart");
      } else {
        showToast(res.message || "Booking failed", "error");
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
    <div style={styles.bookBg} className="book-bg">
      <div style={styles.bookContainer} className="book-container">
        <button style={styles.backBtn} onClick={() => setPage("home")}>
          ← Back to Home
        </button>
        <h2 style={styles.bookTitle}>Book a Trip</h2>
        <p style={styles.bookSub}>Fill in the details to confirm your ride</p>

        {fare && (
          <div style={styles.fareCard}>
            <span style={styles.fareLabel}>Estimated Fare</span>
            <span style={styles.fareAmount}>₹{fare.toFixed(2)}</span>
            <span style={styles.fareNote}>Includes driver charge (₹300) + toll (₹500)</span>
          </div>
        )}

        <div style={styles.grid2}>
          <div style={styles.formGroup}>
            <label style={styles.labelDark}>Driver</label>
            <select {...f("driver_id")}>
              <option value="">Select Driver</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.labelDark}>Car</label>
            <select {...f("car_id")}>
              <option value="">Select Car</option>
              {cars.map((c) => <option key={c.id} value={c.id}>{c.make} — {c.model}</option>)}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.labelDark}>Pickup Location</label>
            <input placeholder="Enter pickup point" {...f("pickup_location")} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.labelDark}>Drop Location</label>
            <input placeholder="Enter destination" {...f("drop_location")} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.labelDark}>Trip Date</label>
            <input type="date" {...f("trip_date")} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.labelDark}>Distance (km)</label>
            <input type="number" step="0.1" min="0" placeholder="e.g. 150" {...f("distance_km")} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.labelDark}>Fare Type</label>
            <select {...f("fare_type")}>
              <option value="per_km">Per KM</option>
              <option value="fixed">Fixed Fare</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.labelDark}>Car Type</label>
            <select {...f("car_type")}>
              <option value="ac">AC</option>
              <option value="non_ac">Non-AC</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.labelDark}>Customer Name</label>
            <input placeholder="Full name" {...f("customer_name")} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.labelDark}>Customer Phone</label>
            <input placeholder="10-digit number" maxLength={10} {...f("customer_phone")} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.labelDark}>Customer Age</label>
            <input type="number" min="15" max="99" placeholder="Age" {...f("customer_age")} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.labelDark}>Passengers</label>
            <input type="number" min="1" placeholder="Number of passengers" {...f("passengers_accompanying")} />
          </div>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.labelDark}>Notes</label>
          <textarea
            style={{ ...styles.input, minHeight: 80, resize: "vertical" }}
            placeholder="Any special instructions..."
            value={form.trip_notes}
            onChange={(e) => setForm({ ...form, trip_notes: e.target.value })}
          />
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1, flex: 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Confirming..." : "Confirm Booking"}
          </button>
          <button style={styles.cancelBtn} onClick={() => setPage("home")}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
