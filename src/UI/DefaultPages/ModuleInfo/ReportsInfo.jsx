import styles from "./Styles/InfoPage.module.css";
import { useNavigate } from "react-router-dom";
import {
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiFileText,
  FiArrowRight,
} from "react-icons/fi";

const features = [
  {
    icon: <FiBarChart2 />,
    name: "Interactive Dashboards",
    desc: "Get a clear view of your key metrics in one place, and explore details when something needs attention.",
    color: "#4da8f5",
    dim: "rgba(77,168,245,0.1)",
  },
  {
    icon: <FiPieChart />,
    name: "Sales & Inventory Mix",
    desc: "Understand how your products, suppliers, and sales are performing through simple visual breakdowns.",
    color: "#6c74f0",
    dim: "rgba(108,116,240,0.1)",
  },
  {
    icon: <FiTrendingUp />,
    name: "Trend Analysis",
    desc: "Spot patterns in your data over time so you can plan better and respond to changes early.",
    color: "#3ecf8e",
    dim: "rgba(62,207,142,0.1)",
  },
  {
    icon: <FiFileText />,
    name: "Exportable Reports",
    desc: "Download and share reports when needed, making it easier to review or discuss performance with your team.",
    color: "#f0a855",
    dim: "rgba(240,168,85,0.1)",
  },
];

const ReportsInfo = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <div
          className={styles.heroOrb}
          style={{
            "--orb-color":
              "radial-gradient(ellipse, rgba(77,168,245,0.09) 0%, transparent 65%)",
            right: "-80px",
            left: "auto",
          }}
        />

        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <span
              className={styles.eyebrow}
              style={{
                color: "#4da8f5",
                background: "rgba(77,168,245,0.1)",
                border: "1px solid rgba(77,168,245,0.2)",
              }}
            >
              Reports Module
            </span>

            <h1 className={styles.heroTitle}>
              Understand your business
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg,#4da8f5,#7ec8ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                through clear insights
              </span>
            </h1>

            <p className={styles.heroDesc}>
              When data is scattered, it’s hard to make decisions. This module
              brings everything together so you can see what’s happening,
              understand trends, and make more confident choices.
            </p>

            <div className={styles.heroBtns}>
              <button
                className={styles.btnPrimary}
                style={{
                  background: "#1c7abf",
                  borderColor: "rgba(77,168,245,0.5)",
                  "--btn-shadow": "rgba(77,168,245,0.3)",
                }}
                onClick={() => navigate("/login")}
              >
                View Reports <FiArrowRight />
              </button>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.analyticsCard}>
              <div className={styles.analyticsHeader}>
                <span>Analytics Overview</span>
              </div>

              <div className={styles.chartPreview}>
                {[40, 60, 35, 70, 55, 80, 65].map((h, i) => (
                  <div
                    key={i}
                    className={styles.chartBar}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              <div className={styles.analyticsMetrics}>
                {[
                  "Revenue Trends",
                  "Order Activity",
                  "Inventory Movement",
                  "Overall Performance",
                ].map((label) => (
                  <div key={label} className={styles.metricItem}>
                    <span className={styles.metricDot} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Insights that help you make better decisions
          </h2>
        </div>

        <div className={styles.featureGrid}>
          {features.map((f) => (
            <div
              key={f.name}
              className={styles.featureCard}
              style={{ "--fc": f.color }}
            >
              <div
                className={styles.featureIcon}
                style={{
                  background: f.dim,
                  color: f.color,
                  border: `1px solid ${f.color}22`,
                }}
              >
                {f.icon}
              </div>

              <div className={styles.featureName}>{f.name}</div>
              <div className={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <h2 className={styles.ctaTitle}>
            Use your data to move forward with clarity
          </h2>

          <div className={styles.ctaActions}>
            <button
              className={styles.btnPrimary}
              style={{
                background: "#1c7abf",
                borderColor: "rgba(77,168,245,0.5)",
              }}
              onClick={() => navigate("/login")}
            >
              Open Reports <FiArrowRight />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReportsInfo;