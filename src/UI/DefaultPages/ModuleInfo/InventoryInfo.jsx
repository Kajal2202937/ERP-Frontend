import styles from "./Styles/InfoPage.module.css";
import { useNavigate } from "react-router-dom";
import {
  FiPackage,
  FiLayers,
  FiRefreshCw,
  FiBarChart2,
  FiArrowRight,
} from "react-icons/fi";

const features = [
  {
    icon: <FiPackage />,
    name: "Stock Visibility",
    desc: "Always know what’s in stock, what’s reserved, and what’s moving — without needing to double-check or guess.",
    color: "#6c74f0",
    dim: "rgba(108,116,240,0.1)",
  },
  {
    icon: <FiLayers />,
    name: "Location Management",
    desc: "Organize your inventory across different warehouses or storage areas in a way that’s easy to manage and understand.",
    color: "#4da8f5",
    dim: "rgba(77,168,245,0.1)",
  },
  {
    icon: <FiRefreshCw />,
    name: "Reorder Configuration",
    desc: "Set minimum stock levels and get clarity on when items need restocking, so you avoid last-minute shortages.",
    color: "#f0a855",
    dim: "rgba(240,168,85,0.1)",
  },
  {
    icon: <FiBarChart2 />,
    name: "Inventory Insights",
    desc: "Understand how your stock is used over time and spot patterns that help you plan better.",
    color: "#3ecf8e",
    dim: "rgba(62,207,142,0.1)",
  },
];

const InventoryInfo = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* HERO SECTION */}
      <section className={styles.hero}>

        <div
          className={styles.heroOrb}
          style={{
            "--orb-color":
              "radial-gradient(ellipse, rgba(108,116,240,0.11) 0%, transparent 65%)",
            left: "-100px",
          }}
        />

        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <span
              className={styles.eyebrow}
              style={{
                color: "#8b91f5",
                background: "rgba(108,116,240,0.1)",
                border: "1px solid rgba(108,116,240,0.2)",
              }}
            >
              Inventory Module
            </span>

            <h1
              className={styles.heroTitle}
              style={{
                "--title-gradient":
                  "linear-gradient(135deg, #6c74f0 0%, #8b91f5 50%, #4da8f5 100%)",
              }}
            >
              Stay in control of your stock
              <br />
              <span>without the usual complexity</span>
            </h1>

            <p className={styles.heroDesc}>
              Managing inventory shouldn’t feel overwhelming. Keep track of
              stock, monitor movements, and maintain clear records — all in one
              place so you always know what’s happening.
            </p>

            <div className={styles.heroBtns}>
              <button
                className={styles.btnPrimary}
                style={{
                  background: "#6c74f0",
                  borderColor: "rgba(108,116,240,0.5)",
                  "--btn-shadow": "rgba(108,116,240,0.3)",
                }}
                onClick={() => navigate("/login")}
              >
                Access Inventory <FiArrowRight />
              </button>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.mockCard}>
              <div className={styles.mockBar}>
                {["#f87171", "#f0a855", "#3ecf8e"].map((c, i) => (
                  <div
                    key={i}
                    className={styles.dot}
                    style={{ background: c }}
                  />
                ))}
              </div>

              <div className={styles.mockBody}>
                {[
                  {
                    label: "Available Stock",
                    status: "Stable",
                    color: "#3ecf8e",
                  },
                  {
                    label: "Reserved Items",
                    status: "In Use",
                    color: "#4da8f5",
                  },
                  {
                    label: "Reorder Status",
                    status: "Needs Attention",
                    color: "#f0a855",
                  },
                ].map((r) => (
                  <div key={r.label} className={styles.mockRow}>
                    <span className={styles.mockRowLabel}>{r.label}</span>

                    <span
                      className={styles.mockRowVal}
                      style={{
                        color: r.color,
                        fontWeight: 500,
                      }}
                    >
                      {r.status}
                    </span>
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
          <h2 className={styles.sectionTitle}>What you can manage with ease</h2>
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
            Keep your inventory organized and under control
          </h2>

          <button
            className={styles.btnPrimary}
            style={{
              background: "#6c74f0",
              borderColor: "rgba(108,116,240,0.5)",
            }}
            onClick={() => navigate("/login")}
          >
            Open Module <FiArrowRight />
          </button>
        </div>
      </section>
    </div>
  );
};

export default InventoryInfo;
