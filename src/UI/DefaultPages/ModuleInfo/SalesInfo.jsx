import styles from "./Styles/InfoPage.module.css";
import { useNavigate } from "react-router-dom";
import {
  FiShoppingCart,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiArrowRight,
} from "react-icons/fi";

const features = [
  {
    icon: <FiShoppingCart />,
    name: "Order Management",
    desc: "Handle orders from start to finish in one place, so nothing gets missed or delayed.",
    color: "#3ecf8e",
    dim: "rgba(62,207,142,0.1)",
  },
  {
    icon: <FiUsers />,
    name: "Customer Intelligence",
    desc: "Keep track of your customers, their orders, and how often they buy, so you can serve them better.",
    color: "#6c74f0",
    dim: "rgba(108,116,240,0.1)",
  },
  {
    icon: <FiDollarSign />,
    name: "Revenue Tracking",
    desc: "See how your sales are performing over time and understand where your revenue is coming from.",
    color: "#f0a855",
    dim: "rgba(240,168,85,0.1)",
  },
  {
    icon: <FiTrendingUp />,
    name: "Growth Insights",
    desc: "Identify which products and customers are driving your business forward.",
    color: "#4da8f5",
    dim: "rgba(77,168,245,0.1)",
  },
];

const SalesInfo = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div
          className={styles.heroOrb}
          style={{
            "--orb-color":
              "radial-gradient(ellipse, rgba(62,207,142,0.08) 0%, transparent 65%)",
            left: "-80px",
          }}
        />

        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <span
              className={styles.eyebrow}
              style={{
                color: "#3ecf8e",
                background: "rgba(62,207,142,0.1)",
                border: "1px solid rgba(62,207,142,0.2)",
              }}
            >
              Sales Module
            </span>

            <h1 className={styles.heroTitle}>
              Manage your sales
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg,#3ecf8e,#5edba5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                with better clarity
              </span>
            </h1>

            <p className={styles.heroDesc}>
              Sales can get messy when orders, customers, and payments are
              handled separately. Bring everything together so you can stay
              organized, track progress, and understand how your business is
              growing.
            </p>

            <div className={styles.heroBtns}>
              <button
                className={styles.btnPrimary}
                style={{
                  background: "#1d9e75",
                  borderColor: "rgba(62,207,142,0.5)",
                  "--btn-shadow": "rgba(62,207,142,0.3)",
                }}
                onClick={() => navigate("/login")}
              >
                Go to Sales <FiArrowRight />
              </button>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.salesCard}>
              <div className={styles.salesHeader}>
                <span>Sales Pipeline</span>
              </div>

              <div className={styles.pipeline}>
                {[
                  { stage: "Pending", color: "#f0a855" },
                  { stage: "Processing", color: "#4da8f5" },
                  { stage: "Completed", color: "#3ecf8e" },
                ].map((item) => (
                  <div key={item.stage} className={styles.pipelineItem}>
                    <div
                      className={styles.pipelineDot}
                      style={{ background: item.color }}
                    />
                    <span>{item.stage}</span>
                  </div>
                ))}
              </div>

              <div className={styles.pipelineFooter}>
                <span>Orders move step by step until completion</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Everything you need to manage sales smoothly
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

      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <h2 className={styles.ctaTitle}>
            Keep your sales organized and growing
          </h2>

          <div className={styles.ctaActions}>
            <button
              className={styles.btnPrimary}
              style={{
                background: "#1d9e75",
                borderColor: "rgba(62,207,142,0.5)",
              }}
              onClick={() => navigate("/login")}
            >
              Open Sales <FiArrowRight />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SalesInfo;
