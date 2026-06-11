import styles from "./Styles/InfoPage.module.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
    dim: "rgba(77,168,245,0.10)",
  },
  {
    icon: <FiPieChart />,
    name: "Sales & Inventory Mix",
    desc: "Understand how your products, suppliers, and sales are performing through simple visual breakdowns.",
    color: "#6c74f0",
    dim: "rgba(108,116,240,0.10)",
  },
  {
    icon: <FiTrendingUp />,
    name: "Trend Analysis",
    desc: "Spot patterns in your data over time so you can plan better and respond to changes early.",
    color: "#3ecf8e",
    dim: "rgba(62,207,142,0.10)",
  },
  {
    icon: <FiFileText />,
    name: "Exportable Reports",
    desc: "Download and share reports when needed, making it easier to review or discuss performance with your team.",
    color: "#f0a855",
    dim: "rgba(240,168,85,0.10)",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const ReportsInfo = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* ══ HERO ══ */}
      <section className={styles.hero} aria-labelledby="reports-hero-heading">
        <div
          className={styles.heroOrb}
          style={{
            "--orb-color": "radial-gradient(ellipse, rgba(77,168,245,0.09) 0%, transparent 65%)",
            right: "-80px",
            left: "auto",
            top: "-60px",
          }}
          aria-hidden="true"
        />

        <div className={styles.heroInner}>
          {/* Left */}
          <motion.div
            className={styles.heroLeft}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className={styles.eyebrow}
              style={{
                color: "#4da8f5",
                background: "rgba(77,168,245,0.10)",
                border: "1px solid rgba(77,168,245,0.22)",
              }}
            >
              Reports Module
            </span>

            <h1
              id="reports-hero-heading"
              className={styles.heroTitle}
              style={{ "--title-gradient": "linear-gradient(135deg, #4da8f5 0%, #7fc5fa 50%, #4da8f5 100%)" }}
            >
              Turn your daily data
              <br />
              <span>into clear business insights</span>
            </h1>

            <p className={styles.heroDesc}>
              Stop guessing what's happening in your business. Understand your
              performance at a glance, explore what the data is telling you, and
              make better decisions as a result.
            </p>

            <div className={styles.heroBtns}>
              <motion.button
                className={styles.btnPrimary}
                style={{
                  background: "linear-gradient(135deg, #4da8f5, #7fc5fa)",
                  "--btn-shadow": "rgba(77,168,245,0.28)",
                }}
                onClick={() => navigate("/login")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Access Reports module"
              >
                Access Reports <FiArrowRight aria-hidden="true" />
              </motion.button>
            </div>
          </motion.div>

          {/* Right — analytics chart preview */}
          <motion.div
            className={styles.heroRight}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.56, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.analyticsCard} aria-label="Reports analytics preview">
              <div className={styles.analyticsHeader}>Performance Overview</div>

              {/* Animated bar chart */}
              <div className={styles.chartPreview} role="img" aria-label="Bar chart showing performance trend">
                {[35, 55, 42, 70, 50, 78, 90, 62].map((h, i) => (
                  <motion.div
                    key={i}
                    className={styles.chartBar}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{
                      delay: 0.3 + i * 0.06,
                      duration: 0.48,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{
                      background: `linear-gradient(to top, #4da8f5, rgba(77,168,245,0.22))`,
                    }}
                  />
                ))}
              </div>

              <div className={styles.analyticsMetrics}>
                {[
                  "Sales Trend",
                  "Stock Movement",
                  "Order Volume",
                  "Revenue Flow",
                ].map((label) => (
                  <div key={label} className={styles.metricItem}>
                    <div
                      className={styles.metricDot}
                      style={{ background: "#4da8f5" }}
                      aria-hidden="true"
                    />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className={styles.featuresSection} aria-labelledby="reports-features-heading">
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 id="reports-features-heading" className={styles.sectionTitle}>
            What the Reports module gives you
          </h2>
          <p className={styles.sectionDesc}>
            From interactive dashboards to exportable summaries, every tool is
            designed to help you understand your operations without complexity.
          </p>
        </motion.div>

        <motion.div
          className={styles.featureGrid}
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((f) => (
            <motion.div
              key={f.name}
              className={styles.featureCard}
              style={{ "--fc": f.color }}
              variants={fadeUp}
            >
              <div
                className={styles.featureIcon}
                style={{ background: f.dim, color: f.color }}
                aria-hidden="true"
              >
                {f.icon}
              </div>
              <div className={styles.featureName}>{f.name}</div>
              <div className={styles.featureDesc}>{f.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══ CTA ══ */}
      <section className={styles.ctaSection} aria-labelledby="reports-cta-heading">
        <div className={styles.ctaBox}>
          <motion.h2
            id="reports-cta-heading"
            className={styles.ctaTitle}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            Understand your business through the data you already have
          </motion.h2>

          <motion.div
            className={styles.ctaActions}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <motion.button
              className={styles.btnPrimary}
              style={{
                background: "linear-gradient(135deg, #4da8f5, #7fc5fa)",
                "--btn-shadow": "rgba(77,168,245,0.28)",
              }}
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Open Module <FiArrowRight aria-hidden="true" />
            </motion.button>

            <motion.button
              className={styles.btnSecondary}
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Back to Home
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ReportsInfo;