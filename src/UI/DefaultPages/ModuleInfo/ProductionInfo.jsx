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
    desc: "Set up production stages in a way that matches how your work actually flows, with clear responsibilities at each step.",
    color: "#f0a855",
    dim: "rgba(240,168,85,0.1)",
  },
  {
    icon: <FiActivity />,
    name: "Production Tracking",
    desc: "Keep track of what’s in progress, what’s completed, and what needs attention across your production line.",
    color: "#6c74f0",
    dim: "rgba(108,116,240,0.1)",
  },
  {
    icon: <FiClock />,
    name: "Process Monitoring",
    desc: "Understand where time is being spent so you can spot delays and improve how work moves forward.",
    color: "#4da8f5",
    dim: "rgba(77,168,245,0.1)",
  },
  {
    icon: <FiTrendingUp />,
    name: "Performance Insights",
    desc: "Review output trends and identify areas where your production process can become more efficient.",
    color: "#3ecf8e",
    dim: "rgba(62,207,142,0.1)",
  },
];

const ProductionInfo = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
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
              Keep your production running
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg,#f0a855,#fbc87a)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                smoothly and predictably
              </span>
            </h1>

            <p className={styles.heroDesc}>
              Production can quickly become hard to manage when multiple stages
              are involved. This system helps you stay organized, track
              progress, and keep everything moving without losing visibility.
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
                <span>Move step-by-step with clear visibility</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>KEY FEATURES</p>
          <h2 className={styles.sectionTitle}>
            Tools to manage production with clarity
          </h2>
          <p className={styles.sectionDesc}>
            Everything you need to organize, track, and improve your production
            workflow.
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

      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <h2 className={styles.ctaTitle}>
            Stay on top of your production without the confusion
          </h2>

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
