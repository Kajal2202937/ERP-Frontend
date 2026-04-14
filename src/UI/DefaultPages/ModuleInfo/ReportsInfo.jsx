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
    desc: "Real-time KPI dashboards with drill-down capability — see the whole picture or zoom into any metric.",
    color: "#4da8f5",
    dim: "rgba(77,168,245,0.1)",
  },
  {
    icon: <FiPieChart />,
    name: "Sales & Inventory Mix",
    desc: "Visual breakdowns of revenue by product, supplier, and period using donut and bar charts.",
    color: "#6c74f0",
    dim: "rgba(108,116,240,0.1)",
  },
  {
    icon: <FiTrendingUp />,
    name: "Trend Analysis",
    desc: "Detect growth patterns, seasonal demand, and operational trends with automated trendline overlays.",
    color: "#3ecf8e",
    dim: "rgba(62,207,142,0.1)",
  },
  {
    icon: <FiFileText />,
    name: "Exportable Reports",
    desc: "Generate PDF or CSV reports on demand, scheduled for email delivery, or triggered by milestones.",
    color: "#f0a855",
    dim: "rgba(240,168,85,0.1)",
  },
];

const ReportsInfo = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
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
              Decisions powered
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg,#4da8f5,#7ec8ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                by real data
              </span>
            </h1>
            <p className={styles.heroDesc}>
              Stop guessing. Understand your business performance with
              interactive charts, trend analysis, and exportable reports — all
              updated in real time.
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

              {/* Chart Preview */}
              <div className={styles.chartPreview}>
                {[40, 60, 35, 70, 55, 80, 65].map((h, i) => (
                  <div
                    key={i}
                    className={styles.chartBar}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              {/* Metrics Labels */}
              <div className={styles.analyticsMetrics}>
                {[
                  "Revenue Trends",
                  "Order Volume",
                  "Inventory Insights",
                  "Performance Summary",
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

      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <p
            style={{
              fontSize: 11,
              fontFamily: "'Geist Mono',monospace",
              color: "rgba(238,240,247,0.28)",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            KEY FEATURES
          </p>
          <h2 className={styles.sectionTitle}>
            Analytics that actually answer questions
          </h2>
          <p className={styles.sectionDesc}>
            From daily operations to quarterly reviews — every report you need,
            on demand.
          </p>
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

      <section className={styles.ctaSection}>
        <div
          className={styles.ctaBox}
          style={{
            "--cta-line":
              "linear-gradient(90deg, transparent, rgba(77,168,245,0.5), rgba(126,200,255,0.8), rgba(77,168,245,0.5), transparent)",
          }}
        >
          <h2 className={styles.ctaTitle}>Make data-driven decisions</h2>
          <p className={styles.ctaDesc}>
            Access the reports module and transform raw business data into
            actionable insights.
          </p>
          <div className={styles.ctaActions}>
            <button
              className={styles.btnPrimary}
              style={{
                background: "#1c7abf",
                borderColor: "rgba(77,168,245,0.5)",
                "--btn-shadow": "rgba(77,168,245,0.3)",
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
