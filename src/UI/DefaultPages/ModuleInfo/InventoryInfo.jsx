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
    desc: "Track available quantities, reserved stock, and movements across locations in real time.",
    color: "#6c74f0",
    dim: "rgba(108,116,240,0.1)",
  },
  {
    icon: <FiLayers />,
    name: "Location Management",
    desc: "Organise inventory across warehouses, stores, or storage units with structured control.",
    color: "#4da8f5",
    dim: "rgba(77,168,245,0.1)",
  },
  {
    icon: <FiRefreshCw />,
    name: "Reorder Configuration",
    desc: "Define minimum stock levels and restocking workflows based on operational needs.",
    color: "#f0a855",
    dim: "rgba(240,168,85,0.1)",
  },
  {
    icon: <FiBarChart2 />,
    name: "Inventory Insights",
    desc: "View stock trends, movement history, and usage patterns for better decision-making.",
    color: "#3ecf8e",
    dim: "rgba(62,207,142,0.1)",
  },
];

const InventoryInfo = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* HERO */}
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
              Centralised control over
              <br />
              <span>inventory operations</span>
            </h1>
            <p className={styles.heroDesc}>
              Track inventory across locations, monitor stock movement, and
              maintain structured records with a system designed for operational
              clarity.
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

          {/* GENERIC UI PREVIEW (NO FAKE DATA) */}
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
                    status: "Pending",
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
          <p
            style={{
              fontSize: 11,
              fontFamily: "'Geist Mono',monospace",
              color: "rgba(238,240,247,0.28)",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            FEATURES
          </p>

          <h2 className={styles.sectionTitle}>Core inventory capabilities</h2>

          <p className={styles.sectionDesc}>
            Designed to support structured inventory processes across different
            business environments.
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

      {/* PREVIEW */}
      <section className={styles.previewSection}>
        <div className={styles.previewInner}>
          <div className={styles.previewText}>
            <h2 className={styles.previewTitle}>
              Structured inventory tracking for scalable operations
            </h2>

            <p className={styles.previewDesc}>
              The module adapts to different inventory sizes and operational
              complexity without changing workflow structure.
            </p>

            <div className={styles.previewList}>
              {[
                "Maintain consistent stock records",
                "Track item-level movement history",
                "Support bulk updates and imports",
                "Define custom stock thresholds",
              ].map((item) => (
                <div key={item} className={styles.previewItem}>
                  <span
                    className={styles.previewItemDot}
                    style={{ background: "#6c74f0" }}
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.mockCard} style={{ width: "100%" }}>
            <div className={styles.mockBar}>
              {["#f87171", "#f0a855", "#3ecf8e"].map((c, i) => (
                <div key={i} className={styles.dot} style={{ background: c }} />
              ))}
            </div>

            <div className={styles.previewFeatures}>
              {[
                {
                  title: "Stock Visibility",
                  desc: "Track available inventory across all locations in a structured view.",
                },
                {
                  title: "Movement Logs",
                  desc: "Maintain records of transfers and stock updates with traceability.",
                },
                {
                  title: "Low Stock Alerts",
                  desc: "Identify items that require attention based on defined thresholds.",
                },
                {
                  title: "Data Consistency",
                  desc: "Ensure accurate inventory records across all operations.",
                },
              ].map((item) => (
                <div key={item.title} className={styles.previewCard}>
                  <h4 className={styles.previewCardTitle}>{item.title}</h4>
                  <p className={styles.previewCardDesc}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className={styles.ctaSection}
        style={{
          "--cta-orb":
            "radial-gradient(ellipse, rgba(108,116,240,0.09) 0%, transparent 65%)",
        }}
      >
        <div
          className={styles.ctaBox}
          style={{
            "--cta-line":
              "linear-gradient(90deg, transparent, rgba(108,116,240,0.6), rgba(139,145,245,0.8), rgba(108,116,240,0.6), transparent)",
          }}
        >
          <h2 className={styles.ctaTitle}>
            Bring structure to your inventory operations
          </h2>
          <p className={styles.ctaDesc}>
            Sign in to access inventory tools or create an account to begin
            using the system.
          </p>

          <div className={styles.ctaActions}>
            <button
              className={styles.btnPrimary}
              style={{
                background: "#6c74f0",
                borderColor: "rgba(108,116,240,0.5)",
                "--btn-shadow": "rgba(108,116,240,0.3)",
              }}
              onClick={() => navigate("/login")}
            >
              Open Module <FiArrowRight />
            </button>

          </div>
        </div>
      </section>
    </div>
  );
};

export default InventoryInfo;
