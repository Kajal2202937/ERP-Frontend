import styles from "./Styles/InfoPage.module.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
    dim: "rgba(240,168,85,0.10)",
  },
  {
    icon: <FiActivity />,
    name: "Production Tracking",
    desc: "Keep track of what's in progress, what's completed, and what needs attention across your production line.",
    color: "#6c74f0",
    dim: "rgba(108,116,240,0.10)",
  },
  {
    icon: <FiClock />,
    name: "Process Monitoring",
    desc: "Understand where time is being spent so you can spot delays and improve how work moves forward.",
    color: "#4da8f5",
    dim: "rgba(77,168,245,0.10)",
  },
  {
    icon: <FiTrendingUp />,
    name: "Performance Insights",
    desc: "Review output trends and identify areas where your production process can become more efficient.",
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
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const ProductionInfo = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* ══ HERO ══ */}
      <section className={styles.hero} aria-labelledby="prod-hero-heading">
        <div
          className={styles.heroOrb}
          style={{
            "--orb-color": "radial-gradient(ellipse, rgba(240,168,85,0.09) 0%, transparent 65%)",
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
                color: "#f0a855",
                background: "rgba(240,168,85,0.10)",
                border: "1px solid rgba(240,168,85,0.22)",
              }}
            >
              Production Module
            </span>

            <h1
              id="prod-hero-heading"
              className={styles.heroTitle}
              style={{ "--title-gradient": "linear-gradient(135deg, #f0a855 0%, #f5c47a 50%, #f0a855 100%)" }}
            >
              Manage your production
              <br />
              <span>in a way that makes sense</span>
            </h1>

            <p className={styles.heroDesc}>
              Plan production workflows, track progress, and monitor your
              resources in one place — so things stay on track without constant
              manual follow-up.
            </p>

            <div className={styles.heroBtns}>
              <motion.button
                className={styles.btnPrimary}
                style={{
                  background: "linear-gradient(135deg, #f0a855, #f5c47a)",
                  "--btn-shadow": "rgba(240,168,85,0.30)",
                }}
                onClick={() => navigate("/login")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Access Production module"
              >
                Access Production <FiArrowRight aria-hidden="true" />
              </motion.button>
            </div>
          </motion.div>

          {/* Right — process preview card */}
          <motion.div
            className={styles.heroRight}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.56, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.processCard} aria-label="Production workflow preview">
              <div className={styles.processHeader}>Production Workflow</div>
              <div className={styles.processSteps}>
                {[
                  "Material Planning",
                  "Production Start",
                  "Quality Check",
                  "Packaging",
                  "Delivery Prep",
                ].map((label, i) => (
                  <motion.div
                    key={label}
                    className={styles.processStep}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.22 + i * 0.06, duration: 0.4 }}
                  >
                    <div className={styles.stepCircle} aria-hidden="true">
                      {i + 1}
                    </div>
                    <span className={styles.stepLabel}>{label}</span>
                  </motion.div>
                ))}
              </div>
              <div className={styles.processFooter}>
                Each step is tracked end-to-end
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className={styles.featuresSection} aria-labelledby="prod-features-heading">
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 id="prod-features-heading" className={styles.sectionTitle}>
            How the Production module helps
          </h2>
          <p className={styles.sectionDesc}>
            Manage every stage of your production cycle with tools designed to
            keep workflows clear and output consistent.
          </p>
        </motion.div>

        <motion.div
          className={styles.featureGrid}
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {prodFeatures.map((f) => (
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
      <section className={styles.ctaSection} aria-labelledby="prod-cta-heading">
        <div className={styles.ctaBox}>
          <motion.h2
            id="prod-cta-heading"
            className={styles.ctaTitle}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            Keep your production moving without the guesswork
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
                background: "linear-gradient(135deg, #f0a855, #f5c47a)",
                "--btn-shadow": "rgba(240,168,85,0.30)",
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

export default ProductionInfo;