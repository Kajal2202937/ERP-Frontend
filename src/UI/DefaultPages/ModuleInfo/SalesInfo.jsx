import styles from "./Styles/InfoPage.module.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
    dim: "rgba(62,207,142,0.10)",
  },
  {
    icon: <FiUsers />,
    name: "Customer Intelligence",
    desc: "Keep track of your customers, their orders, and how often they buy, so you can serve them better.",
    color: "#6c74f0",
    dim: "rgba(108,116,240,0.10)",
  },
  {
    icon: <FiDollarSign />,
    name: "Revenue Tracking",
    desc: "See how your sales are performing over time and understand where your revenue is coming from.",
    color: "#f0a855",
    dim: "rgba(240,168,85,0.10)",
  },
  {
    icon: <FiTrendingUp />,
    name: "Growth Insights",
    desc: "Identify which products and customers are driving your business forward.",
    color: "#4da8f5",
    dim: "rgba(77,168,245,0.10)",
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

const SalesInfo = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* ══ HERO ══ */}
      <section className={styles.hero} aria-labelledby="sales-hero-heading">
        <div
          className={styles.heroOrb}
          style={{
            "--orb-color": "radial-gradient(ellipse, rgba(62,207,142,0.08) 0%, transparent 65%)",
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
                color: "#3ecf8e",
                background: "rgba(62,207,142,0.10)",
                border: "1px solid rgba(62,207,142,0.22)",
              }}
            >
              Sales Module
            </span>

            <h1
              id="sales-hero-heading"
              className={styles.heroTitle}
              style={{ "--title-gradient": "linear-gradient(135deg, #3ecf8e 0%, #5edba5 50%, #3ecf8e 100%)" }}
            >
              Manage your sales
              <br />
              <span>with better clarity</span>
            </h1>

            <p className={styles.heroDesc}>
              From incoming orders to customer follow-ups, keep everything
              structured in one place — so you can focus on serving your
              customers well instead of chasing information.
            </p>

            <div className={styles.heroBtns}>
              <motion.button
                className={styles.btnPrimary}
                style={{
                  background: "linear-gradient(135deg, #3ecf8e, #5edba5)",
                  "--btn-shadow": "rgba(62,207,142,0.28)",
                }}
                onClick={() => navigate("/login")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Access Sales module"
              >
                Access Sales <FiArrowRight aria-hidden="true" />
              </motion.button>
            </div>
          </motion.div>

          {/* Right — sales pipeline preview */}
          <motion.div
            className={styles.heroRight}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.56, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.salesCard} aria-label="Sales pipeline preview">
              <div className={styles.salesHeader}>Order Pipeline</div>
              <div className={styles.pipeline}>
                {[
                  { label: "New Orders",      color: "#4da8f5" },
                  { label: "In Processing",   color: "#f0a855" },
                  { label: "Ready to Ship",   color: "#6c74f0" },
                  { label: "Completed",       color: "#3ecf8e" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    className={styles.pipelineItem}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.22 + i * 0.07, duration: 0.38 }}
                  >
                    <div
                      className={styles.pipelineDot}
                      style={{ background: item.color }}
                      aria-hidden="true"
                    />
                    {item.label}
                  </motion.div>
                ))}
              </div>
              <div className={styles.pipelineFooter}>
                All orders tracked from receipt to delivery
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className={styles.featuresSection} aria-labelledby="sales-features-heading">
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 id="sales-features-heading" className={styles.sectionTitle}>
            Tools to manage your sales pipeline
          </h2>
          <p className={styles.sectionDesc}>
            Handle the full order lifecycle, understand your customers, and
            track how your sales are performing over time.
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
      <section className={styles.ctaSection} aria-labelledby="sales-cta-heading">
        <div className={styles.ctaBox}>
          <motion.h2
            id="sales-cta-heading"
            className={styles.ctaTitle}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            Give your sales process the structure it needs
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
                background: "linear-gradient(135deg, #3ecf8e, #5edba5)",
                "--btn-shadow": "rgba(62,207,142,0.28)",
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

export default SalesInfo;