import styles from "./HomePage.module.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiBox,
  FiSettings,
  FiShoppingCart,
  FiBarChart2,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";

const modules = [
  {
    icon: <FiBox />,
    name: "Inventory",
    desc: "Stay on top of your stock without guesswork. Know what’s available, what’s low, and what needs attention.",
    path: "/inventory/info",
    color: "var(--mod-inventory)",
    dim: "var(--mod-inventory-soft)",
  },
  {
    icon: <FiSettings />,
    name: "Production",
    desc: "Plan and manage production in a way that keeps things moving smoothly without losing track of resources.",
    path: "/production/info",
    color: "var(--mod-production)",
    dim: "var(--mod-production-soft)",
  },
  {
    icon: <FiShoppingCart />,
    name: "Sales",
    desc: "Handle orders and customer interactions with better clarity, from the first request to final delivery.",
    path: "/sales",
    color: "var(--mod-sales)",
    dim: "var(--mod-sales-soft)",
  },
  {
    icon: <FiBarChart2 />,
    name: "Reports",
    desc: "Turn your daily data into clear insights so you can understand what’s working and what needs improvement.",
    path: "/reports/info",
    color: "var(--mod-reports)",
    dim: "var(--mod-reports-soft)",
  },
];

const steps = [
  {
    num: "01",
    title: "Plan",
    desc: "Set up how your business operates — from inventory structure to production flow.",
  },
  {
    num: "02",
    title: "Manage",
    desc: "Handle day-to-day operations without juggling multiple systems or spreadsheets.",
  },
  {
    num: "03",
    title: "Track",
    desc: "Keep an eye on what’s happening across inventory, orders, and production in real-time.",
  },
  {
    num: "04",
    title: "Optimize",
    desc: "Identify gaps, improve processes, and make better decisions as your data grows.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <section>
        <div className={styles.hero}>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />

          {/* LEFT SIDE */}
          <motion.div
            className={styles.heroLeft}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.badge}>Enterprise Resource Planning</div>
            <h1 className={styles.heroTitle}>
              Manage Your Business
              <br />
              <span>With One Unified System</span>
            </h1>

            <p className={styles.heroDesc}>
              Running a business means handling multiple moving parts every day
              — stock, orders, production, and reports. This system brings
              everything together in one place, so you can stay organized,
              reduce manual work, and always know what’s happening across your
              operations.
            </p>

            <div className={styles.heroActions}>
              <motion.button
                className={styles.btnPrimary}
                onClick={() => navigate("/login")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Get Started <FiArrowRight />
              </motion.button>

              <motion.button
                className={styles.btnSecondary}
                onClick={() => navigate("/about")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Learn More
              </motion.button>
            </div>

            <p className={styles.heroNote}>
              No complicated setup. Start simple and expand as you need.
            </p>

            <div className={styles.heroTrust}>
              {[
                "Keep everything in one place without switching tools",
                "Designed to stay simple as your operations grow",
                "Clear visibility into daily business activities",
              ].map((t) => (
                <span key={t} className={styles.trustItem}>
                  <FiCheck />
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* RIGHT SIDE */}
          <motion.div
            className={styles.heroRight}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.heroImageWrap}>
              <img
                src="/homeImage.png"
                alt="ERP Dashboard Preview"
                className={styles.heroImage}
              />
            </div>

            <div className={styles.dashPreview}>
              <div className={styles.previewBar}>
                {["#f87171", "#f0a855", "#3ecf8e"].map((c, i) => (
                  <div
                    key={i}
                    className={styles.dot}
                    style={{ background: c }}
                  />
                ))}
              </div>

              <div className={styles.previewBody}>
                <div className={styles.previewKpis}>
                  {[
                    {
                      label: "Orders",
                      val: "Managed",
                      trend: "Active",
                      tColor: "var(--green)",
                    },
                    {
                      label: "Inventory",
                      val: "Tracked",
                      trend: "Updated",
                      tColor: "var(--green)",
                    },
                    {
                      label: "Stock Alerts",
                      val: "Monitored",
                      trend: "Live",
                      tColor: "var(--amber)",
                    },
                    {
                      label: "Products",
                      val: "Organized",
                      trend: "Stable",
                      tColor: "var(--text-secondary)",
                    },
                  ].map((k) => (
                    <div key={k.label} className={styles.kpiMini}>
                      <span className={styles.kpiLabel}>{k.label}</span>
                      <span className={styles.kpiVal}>{k.val}</span>
                      <span
                        className={styles.kpiTrend}
                        style={{ color: k.tColor }}
                      >
                        {k.trend}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.previewChart}>
                  <span className={styles.chartLabel}>
                    Operational Activity Overview
                  </span>

                  <div className={styles.chartBars}>
                    {[30, 50, 38, 65, 45, 72, 88].map((h, i) => (
                      <motion.div
                        key={i}
                        className={styles.bar}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{
                          delay: 0.4 + i * 0.06,
                          duration: 0.5,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className={styles.statsStrip}>
        <div className={styles.statsInner}>
          {[
            "Everything connected in one system",
            "Built to adapt to your workflow",
            "Track what matters in real-time",
            "Grows with your business needs",
          ].map((text, i) => (
            <motion.div
              key={text}
              className={styles.statItem}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <span className={styles.statVal}>{text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <section className={styles.modulesSection}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className={styles.eyebrow}>Core Modules</span>
          <h2 className={styles.sectionTitle}>
            Integrated business functionalities
          </h2>
          <p className={styles.sectionSub}>
            Each module focuses on a key part of your business, while staying
            connected so information flows naturally between teams and
            processes.
          </p>
        </motion.div>

        <motion.div
          className={styles.moduleGrid}
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {modules.map((m) => (
            <motion.div
              key={m.name}
              className={styles.moduleCard}
              style={{ "--c": m.color }}
              variants={fadeUp}
              onClick={() => navigate(m.path)}
            >
              <div
                className={styles.moduleIconWrap}
                style={{ background: m.dim, color: m.color }}
              >
                {m.icon}
              </div>
              <div className={styles.moduleName}>{m.name}</div>
              <div className={styles.moduleDesc}>{m.desc}</div>
              <div className={styles.moduleArrow}>
                Explore <FiArrowRight />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className={styles.howSection}>
        <div className={styles.howInner}>
          <motion.div
            className={styles.sectionHeader}
            style={{ textAlign: "left", alignItems: "flex-start" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className={styles.eyebrow}>Workflow</span>
            <h2 className={styles.sectionTitle}>Structured business process</h2>
            <p className={styles.sectionSub}>
              A practical flow that reflects how businesses actually operate —
              from planning work to improving it over time.
            </p>
          </motion.div>

          <motion.div
            className={styles.stepsGrid}
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {steps.map((s) => (
              <motion.div key={s.num} className={styles.step} variants={fadeUp}>
                <div className={styles.stepNum}>{s.num}</div>
                <div className={styles.stepTitle}>{s.title}</div>
                <div className={styles.stepDesc}>{s.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <motion.div
          className={styles.ctaInner}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.ctaBox}>
            <h2 className={styles.ctaTitle}>
              Bring clarity to your daily operations
            </h2>
            <p className={styles.ctaDesc}>
              Instead of managing everything separately, use one system to keep
              your processes organized, visible, and easier to control as your
              business grows.
            </p>

            <div className={styles.ctaActions}>
              <motion.button
                className={styles.btnPrimary}
                onClick={() => navigate("/login")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Get Started <FiArrowRight />
              </motion.button>

              <motion.button
                className={styles.btnSecondary}
                onClick={() => navigate("/contact")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Contact Us
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
