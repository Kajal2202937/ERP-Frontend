import styles from "./Styles/InfoPage.module.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
    desc: "Always know what's in stock, what's reserved, and what's moving — without needing to double-check or guess.",
    color: "#6c74f0",
    dim: "rgba(108,116,240,0.10)",
  },
  {
    icon: <FiLayers />,
    name: "Location Management",
    desc: "Organize your inventory across different warehouses or storage areas in a way that's easy to manage and understand.",
    color: "#4da8f5",
    dim: "rgba(77,168,245,0.10)",
  },
  {
    icon: <FiRefreshCw />,
    name: "Reorder Configuration",
    desc: "Set minimum stock levels and get clarity on when items need restocking, so you avoid last-minute shortages.",
    color: "#f0a855",
    dim: "rgba(240,168,85,0.10)",
  },
  {
    icon: <FiBarChart2 />,
    name: "Inventory Insights",
    desc: "Understand how your stock is used over time and spot patterns that help you plan better.",
    color: "#3ecf8e",
    dim: "rgba(62,207,142,0.10)",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const InventoryInfo = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* ══ HERO ══ */}
      <section className={styles.hero} aria-labelledby="inv-hero-heading">
        <div
          className={styles.heroOrb}
          style={{
            "--orb-color":
              "radial-gradient(ellipse, rgba(108,116,240,0.10) 0%, transparent 65%)",
            left: "-120px",
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
                color: "#8b91f5",
                background: "rgba(108,116,240,0.10)",
                border: "1px solid rgba(108,116,240,0.22)",
              }}
            >
              Inventory Module
            </span>

            <h1
              id="inv-hero-heading"
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
              Managing inventory shouldn't feel overwhelming. Keep track of
              stock, monitor movements, and maintain clear records — all in one
              place so you always know what's happening.
            </p>

            <div className={styles.heroBtns}>
              <motion.button
                className={styles.btnPrimary}
                style={{
                  background: "linear-gradient(135deg, #6c74f0, #8b91f5)",
                  "--btn-shadow": "rgba(108,116,240,0.32)",
                }}
                onClick={() => navigate("/login")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Access Inventory module"
              >
                Access Inventory <FiArrowRight aria-hidden="true" />
              </motion.button>
            </div>
          </motion.div>

          {/* Right — stock status preview */}
          <motion.div
            className={styles.heroRight}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.56,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div
              className={styles.mockCard}
              aria-label="Inventory status preview"
            >
              <div className={styles.mockBar} aria-hidden="true">
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
                  {
                    label: "Low Stock Alerts",
                    status: "2 Items",
                    color: "#f87171",
                  },
                ].map((r) => (
                  <motion.div
                    key={r.label}
                    className={styles.mockRow}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.28 }}
                  >
                    <span className={styles.mockRowLabel}>{r.label}</span>
                    <span
                      className={styles.mockRowVal}
                      style={{ color: r.color }}
                    >
                      {r.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section
        className={styles.featuresSection}
        aria-labelledby="inv-features-heading"
      >
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 id="inv-features-heading" className={styles.sectionTitle}>
            What you can manage with ease
          </h2>
          <p className={styles.sectionDesc}>
            Each capability is focused on keeping your stock operations clear,
            consistent, and easy to act on.
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
      <section className={styles.ctaSection} aria-labelledby="inv-cta-heading">
        <div className={styles.ctaBox}>
          <motion.h2
            id="inv-cta-heading"
            className={styles.ctaTitle}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            Keep your inventory organized and under control
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
                background: "linear-gradient(135deg, #6c74f0, #8b91f5)",
                "--btn-shadow": "rgba(108,116,240,0.32)",
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

export default InventoryInfo;
