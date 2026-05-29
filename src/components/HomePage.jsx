import { useTheme } from "../context/ThemeContext";
import { getStyles } from "../utils/styles";

const services = [
  {
    title: "Family Tours",
    desc: "Comfortable rides for the whole family — spacious, safe, and smooth.",
    img: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&q=80",
    rate: "₹1,000",
  },
  {
    title: "Couples Tour",
    desc: "Romantic getaways with premium sedans and personalized service.",
    img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80",
    rate: "₹1,000",
  },
  {
    title: "Friends Tour",
    desc: "Group adventures made easy with spacious fleet options.",
    img: "https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=600&q=80",
    rate: "₹1,000",
  },
  {
    title: "Office Meetings",
    desc: "Arrive in style and on time. Professional rides for professionals.",
    img: "https://images.unsplash.com/photo-1528747045269-390fe33c19f2?w=600&q=80",
    rate: "₹1,000",
  },
  {
    title: "Wedding Function",
    desc: "Make your special day unforgettable with luxury vehicles.",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
    rate: "₹1,200",
  },
  {
    title: "Airport Transfer",
    desc: "Punctual, comfortable transfers to and from the airport.",
    img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
    rate: "₹800",
  },
];



export default function HomePage({ setPage }) {
  const { isDark } = useTheme();
  const styles = getStyles(isDark);

  return (
    <div>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>Premium Car Rental Service</div>
          <h1 style={styles.heroH1}>NAMMA TAXI<br />AUTOMOTIVE</h1>
          <p style={styles.heroSub}>
            Luxury rides. Trusted drivers. Unforgettable journeys across Tamil Nadu.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <button style={styles.heroCta} onClick={() => setPage("booknow")}>
              Book Your Ride
            </button>
            <button style={styles.heroCtaOutline} onClick={() => setPage("register")}>
              Create Account
            </button>
          </div>
        </div>
        {/* <div style={styles.heroStats}>
          {[["500+", "Trips"], ["50+", "Drivers"], ["30+", "Vehicles"], ["4.9★", "Rating"]].map(
            ([num, label]) => (
              <div key={label} style={styles.statItem}>
                <span style={styles.statNum}>{num}</span>
                <span style={styles.statLabel}>{label}</span>
              </div>
            )
          )}
        </div> */}
      </section>

      {/* Services */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Our Services</h2>
          <p style={styles.sectionSub}>
            From family vacations to corporate travel — we've got you covered.
          </p>
          <div style={styles.grid3}>
            {services.map((s) => (
              <div key={s.title} style={styles.serviceCard} className="hover-card">
                <div style={styles.serviceImgWrap}>
                  <img src={s.img} alt={s.title} style={styles.serviceImg} />
                  <div style={styles.serviceImgOverlay} />
                </div>
                <div style={styles.serviceBody}>
                  <h3 style={styles.serviceTitle}>{s.title}</h3>
                  <p style={styles.serviceDesc}>{s.desc}</p>
                  <div style={styles.serviceFooter}>
                    <div>
                      <span style={styles.serviceRateLabel}>From </span>
                      <span style={styles.serviceRate}>{s.rate}</span>
                      <span style={styles.serviceRateLabel}>/day</span>
                    </div>
                    <button style={styles.smallBtn} onClick={() => setPage("booknow")}>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      

      {/* Why Us */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Why Choose Us?</h2>
          <div style={styles.grid3}>
            {[
              { icon: "🛡️", title: "Fully Insured", desc: "All vehicles carry comprehensive insurance for your peace of mind." },
              { icon: "⏰", title: "24/7 Available", desc: "Round-the-clock service — whenever you need a ride, we're here." },
              { icon: "💰", title: "Best Pricing", desc: "Transparent fare calculation. No hidden fees, ever." },
              { icon: "👨‍✈️", title: "Expert Drivers", desc: "Licensed, verified, and experienced professionals." },
              { icon: "🚗", title: "Modern Fleet", desc: "AC and Non-AC options in pristine condition." },
              { icon: "📱", title: "Easy Booking", desc: "Book online in minutes. Confirmation instantly." },
            ].map((item) => (
              <div key={item.title} style={styles.whyCard} className="hover-card">
                <div style={styles.whyIcon}>{item.icon}</div>
                <h4 style={styles.whyTitle}>{item.title}</h4>
                <p style={styles.whyDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={styles.ctaBanner}>
        <div style={styles.ctaOverlay} />
        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            Ready to Roll?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, marginBottom: 28 }}>
            Book your ride today and experience the Namma Taxi difference.
          </p>
          <button style={styles.heroCta} onClick={() => setPage("booknow")}>
            Book Now — It's Quick
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.footerGrid}>
            <div>
              <div style={styles.navBrand}>
                <div style={styles.navLogo}>NT</div>
                <span style={{ ...styles.navTitle, color: "#fff" }}>NAMMA TAXI</span>
              </div>
              <p style={{ color: "#888", marginTop: 12, lineHeight: 1.7 }}>
                Premium automotive rental services across Tamil Nadu. Trusted by thousands of happy customers.
              </p>
            </div>
            <div>
              <h5 style={styles.footerHead}>Contact</h5>
              <p style={styles.footerText}>📍 Tirunelveli, Tamil Nadu</p>
              <p style={styles.footerText}>📧 nammataxi@gmail.com</p>
              <p style={styles.footerText}>📞 +91 741 900 680</p>
            </div>
            <div>
              <h5 style={styles.footerHead}>Services</h5>
              {["Family Tours", "Couples Tour", "Airport Transfer", "Wedding Function"].map((s) => (
                <p
                  key={s}
                  style={{ ...styles.footerText, cursor: "pointer" }}
                  onClick={() => setPage("booknow")}
                >
                  {s}
                </p>
              ))}
            </div>
          </div>
          <div style={styles.footerBottom}>
            © 2025 Namma Taxi. All rights reserved. — Alpha X Software Company
          </div>
        </div>
      </footer>
    </div>
  );
}
