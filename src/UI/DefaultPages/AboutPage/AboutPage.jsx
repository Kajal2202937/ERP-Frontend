import styles from "./AboutPage.module.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiBox,
  FiSettings,
  FiShoppingCart,
  FiBarChart2,
  FiArrowRight,
  FiUsers,
  FiServer,
} from "react-icons/fi";

const modules = [
  {
    icon: <FiBox />,
    name: "Inventory",
    desc: "Keep track of your stock without confusion. Know what’s available, what’s running low, and what needs attention.",
    path: "/inventory/info",
    color: "var(--mod-inventory)",
    dim: "var(--mod-inventory-soft)",
  },
  {
    icon: <FiSettings />,
    name: "Production",
    desc: "Plan and manage production in a way that keeps workflows smooth and resources properly used.",
    path: "/production/info",
    color: "var(--mod-production)",
    dim: "var(--mod-production-soft)",
  },
  {
    icon: <FiShoppingCart />,
    name: "Sales",
    desc: "Handle customer orders and sales processes clearly, from initial request to final delivery.",
    path: "/sales",
    color: "var(--mod-sales)",
    dim: "var(--mod-sales-soft)",
  },
  {
    icon: <FiBarChart2 />,
    name: "Reports",
    desc: "Understand your business better with simple insights based on your daily operations and data.",
    path: "/reports/info",
    color: "var(--mod-reports)",
    dim: "var(--mod-reports-soft)",
  },
];

const steps = [
  {
    num: "01",
    title: "Configure",
    desc: "Set up your system based on how your business actually works, including roles and processes.",
  },
  {
    num: "02",
    title: "Integrate",
    desc: "Bring together products, suppliers, and data into one connected system.",
  },
  {
    num: "03",
    title: "Operate",
    desc: "Manage daily activities like inventory, orders, and production without switching tools.",
  },
  {
    num: "04",
    title: "Improve",
    desc: "Use insights from your data to refine processes and make better decisions over time.",
  },
];

const statItems = [
  {
    icon: <FiUsers />,
    val: "User Management",
    label: "Control who can access what, with clear roles for your team",
    color: "var(--mod-inventory)",
    dim: "var(--mod-inventory-soft)",
  },
  {
    icon: <FiServer />,
    val: "Centralized System",
    label: "Keep all your operations in one place instead of scattered tools",
    color: "var(--mod-sales)",
    dim: "var(--mod-sales-soft)",
  },
  {
    icon: <FiSettings />,
    val: "Process Control",
    label: "Maintain consistency across workflows and daily operations",
    color: "var(--mod-production)",
    dim: "var(--mod-production-soft)",
  },
  {
    icon: <FiBarChart2 />,
    val: "Data Insights",
    label: "Understand what’s working and where improvements are needed",
    color: "var(--mod-reports)",
    dim: "var(--mod-reports-soft)",
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

const slideIn = {
  hidden: { opacity: 0, x: 16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <motion.span
          className={styles.eyebrow}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          About ERP System
        </motion.span>

        <motion.h1
          className={styles.heroTitle}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Built to make everyday
          <br />
          <span>business operations easier</span>
        </motion.h1>

        <motion.p
          className={styles.heroDesc}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Managing inventory, production, sales, and reports separately can get
          overwhelming. This system brings everything together so you can work
          in a more organized way, reduce manual effort, and stay in control of
          your operations.
        </motion.p>
      </section>

      <section>
        <div className={styles.whatSection}>
          <motion.div
            className={styles.whatLeft}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <span className={styles.sectionLabel}>What is ERP?</span>
            <h2 className={styles.sectionTitle}>
              One system instead of many disconnected tools
            </h2>
            <p className={styles.sectionText}>
              ERP (Enterprise Resource Planning) helps you manage different
              parts of your business in one place. Instead of switching between
              spreadsheets and separate tools, everything stays connected and
              easier to manage.
            </p>
          </motion.div>

          <motion.div
            className={styles.whatRight}
            variants={container}
            initial="hidden"
            whileInView="show"
          >
            {statItems.map((s) => (
              <motion.div
                key={s.label}
                className={styles.statBox}
                variants={slideIn}
              >
                <div
                  className={styles.statBoxIcon}
                  style={{ background: s.dim, color: s.color }}
                >
                  {s.icon}
                </div>
                <div>
                  <div className={styles.statBoxVal}>{s.val}</div>
                  <div className={styles.statBoxLabel}>{s.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className={styles.modulesSection}>
        <div className={styles.modulesInner}>
          <motion.div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Core Modules</span>
            <h2 className={styles.sectionTitle}>
              Built around how businesses actually work
            </h2>
          </motion.div>

          <motion.div
            className={styles.moduleGrid}
            variants={container}
            initial="hidden"
            whileInView="show"
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className={styles.workflowSection}>
        <motion.div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Workflow</span>
          <h2 className={styles.sectionTitle}>
            A simple flow from setup to improvement
          </h2>
        </motion.div>

        <motion.div
          className={styles.stepsGrid}
          variants={container}
          initial="hidden"
          whileInView="show"
        >
          {steps.map((s) => (
            <motion.div key={s.num} className={styles.step} variants={fadeUp}>
              <div className={styles.stepNum}>{s.num}</div>
              <div className={styles.stepTitle}>{s.title}</div>
              <div className={styles.stepDesc}>{s.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className={styles.ctaSection}>
        <motion.div className={styles.ctaBox}>
          <h2 className={styles.ctaTitle}>
            Start organizing your business in a better way
          </h2>

          <div className={styles.ctaActions}>
            <motion.button
              className={styles.btnPrimary}
              onClick={() => navigate("/register")}
            >
              Get Started <FiArrowRight />
            </motion.button>

            <motion.button
              className={styles.btnSecondary}
              onClick={() => navigate("/contact")}
            >
              Contact Us
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default AboutPage;
