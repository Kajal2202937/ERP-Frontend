import styles from "./Styles/InfoPage.module.css";
import { useNavigate } from "react-router-dom";
import {
  FiSettings,
  FiActivity,
  FiClock,
  FiTrendingUp,
  FiArrowRight,
} from "react-icons/fi";

const prodFeatures = [
  {
    icon: <FiSettings />,
    name: "Workflow Configuration",
    desc: "Define production stages, assign responsibilities, and maintain structured process flows.",
    color: "#f0a855",
    dim: "rgba(240,168,85,0.1)",
  },
  {
    icon: <FiActivity />,
    name: "Production Tracking",
    desc: "Monitor progress of ongoing production activities across different stages.",
    color: "#6c74f0",
    dim: "rgba(108,116,240,0.1)",
  },
  {
    icon: <FiClock />,
    name: "Process Monitoring",
    desc: "Track time spent in each stage to identify delays and improve efficiency.",
    color: "#4da8f5",
    dim: "rgba(77,168,245,0.1)",
  },
  {
    icon: <FiTrendingUp />,
    name: "Performance Insights",
    desc: "Review output trends and operational performance using structured reports.",
    color: "#3ecf8e",
    dim: "rgba(62,207,142,0.1)",
  },
];

const ProductionInfo = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <div
          className={styles.heroOrb}
          style={{
            "--orb-color":
              "radial-gradient(ellipse, rgba(240,168,85,0.09) 0%, transparent 65%)",
            left: "-80px",
          }}
        />

        <div className={styles.heroInner}>
          {/* LEFT */}
          <div className={styles.heroLeft}>
            <span
              className={styles.eyebrow}
              style={{
                color: "#f0a855",
                background: "rgba(240,168,85,0.1)",
                border: "1px solid rgba(240,168,85,0.2)",
              }}
            >
              Production Module
            </span>

            <h1 className={styles.heroTitle}>
              Manage production with
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(135deg,#f0a855,#fbc87a)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                structured workflows
              </span>
            </h1>

            <p className={styles.heroDesc}>
              Organize production processes, track progress across stages, and
              maintain full operational visibility from start to completion.
            </p>

            <div className={styles.heroBtns}>
              <button
                className={styles.btnPrimary}
                style={{
                  background: "#d4800a",
                  borderColor: "rgba(240,168,85,0.5)",
                  "--btn-shadow": "rgba(240,168,85,0.3)",
                }}
                onClick={() => navigate("/login")}
              >
                Go to Production <FiArrowRight />
              </button>

            </div>
          </div>

          {/* RIGHT → 🔥 NEW UI (NO HARDCODE DATA) */}
          <div className={styles.heroRight}>
            <div className={styles.processCard}>
              <div className={styles.processHeader}>
                <span>Production Flow</span>
              </div>

              <div className={styles.processSteps}>
                {[
                  "Planning",
                  "Material Allocation",
                  "Processing",
                  "Quality Check",
                  "Completed",
                ].map((step, index) => (
                  <div key={step} className={styles.processStep}>
                    <div className={styles.stepCircle}>{index + 1}</div>
                    <span className={styles.stepLabel}>{step}</span>
                  </div>
                ))}
              </div>

              <div className={styles.processFooter}>
                <span>Workflow progresses step-by-step</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>KEY FEATURES</p>
          <h2 className={styles.sectionTitle}>
            Production management capabilities
          </h2>
          <p className={styles.sectionDesc}>
            Tools designed to structure and monitor manufacturing operations.
          </p>
        </div>

        <div className={styles.featureGrid}>
          {prodFeatures.map((f) => (
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
            Improve production visibility
          </h2>
          <p className={styles.ctaDesc}>
            Access the production module to organize workflows and monitor
            progress efficiently.
          </p>

          <div className={styles.ctaActions}>
            <button
              className={styles.btnPrimary}
              style={{
                background: "#d4800a",
                borderColor: "rgba(240,168,85,0.5)",
                "--btn-shadow": "rgba(240,168,85,0.3)",
              }}
              onClick={() => navigate("/login")}
            >
              Open Production <FiArrowRight />
            </button>

          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductionInfo;