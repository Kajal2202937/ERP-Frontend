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
    desc: "Create, track, and fulfil orders from a single view — with real-time stock validation on every line item.",
    color: "#3ecf8e",
    dim: "rgba(62,207,142,0.1)",
  },
  {
    icon: <FiUsers />,
    name: "Customer Intelligence",
    desc: "Build detailed customer profiles with purchase history, order frequency, and lifetime value metrics.",
    color: "#6c74f0",
    dim: "rgba(108,116,240,0.1)",
  },
  {
    icon: <FiDollarSign />,
    name: "Revenue Tracking",
    desc: "Monitor gross revenue, average order value, and margin across products, customers, and periods.",
    color: "#f0a855",
    dim: "rgba(240,168,85,0.1)",
  },
  {
    icon: <FiTrendingUp />,
    name: "Growth Analytics",
    desc: "Identify your best-performing products and customers with automated ranking and trend visualisations.",
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
              Close more, track
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg,#3ecf8e,#5edba5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                every rupee
              </span>
            </h1>
            <p className={styles.heroDesc}>
              Handle orders end-to-end, understand your customers deeply, and
              drive revenue growth with sales analytics built for scale.
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
                <span>Orders move through structured stages</span>
              </div>
            </div>
          </div>{" "}
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
            Sales tools that keep up with your team
          </h2>
          <p className={styles.sectionDesc}>
            From the first order to repeat business — every touchpoint managed
            in one system.
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
              "linear-gradient(90deg, transparent, rgba(62,207,142,0.5), rgba(94,219,165,0.8), rgba(62,207,142,0.5), transparent)",
          }}
        >
          <h2 className={styles.ctaTitle}>Grow your sales faster</h2>
          <p className={styles.ctaDesc}>
            Access the sales module and get complete visibility into every
            order, customer, and revenue stream.
          </p>
          <div className={styles.ctaActions}>
            <button
              className={styles.btnPrimary}
              style={{
                background: "#1d9e75",
                borderColor: "rgba(62,207,142,0.5)",
                "--btn-shadow": "rgba(62,207,142,0.3)",
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
