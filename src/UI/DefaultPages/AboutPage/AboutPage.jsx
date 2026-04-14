import styles from "./AboutPage.module.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBox, FiSettings, FiShoppingCart, FiBarChart2, FiArrowRight, FiUsers, FiServer } from "react-icons/fi";

const modules = [
  { icon: <FiBox />,         name: "Inventory",  desc: "Manage stock levels, warehouse operations, and inventory movements across your business.", path: "/inventory/info",  color: "var(--mod-inventory)",  dim: "var(--mod-inventory-soft)"  },
  { icon: <FiSettings />,    name: "Production", desc: "Plan and control manufacturing workflows with better visibility into resources and output.",path: "/production/info", color: "var(--mod-production)", dim: "var(--mod-production-soft)" },
  { icon: <FiShoppingCart />,name: "Sales",      desc: "Handle customer orders, manage transactions, and streamline the sales lifecycle.",          path: "/sales",           color: "var(--mod-sales)",      dim: "var(--mod-sales-soft)"      },
  { icon: <FiBarChart2 />,   name: "Reports",    desc: "Generate structured reports and gain insights into business performance.",                   path: "/reports/info",    color: "var(--mod-reports)",    dim: "var(--mod-reports-soft)"    },
];

const steps = [
  { num: "01", title: "Configure", desc: "Set up system structure, roles, and modules based on your business processes." },
  { num: "02", title: "Integrate", desc: "Organize products, suppliers, and operational data within a unified system."   },
  { num: "03", title: "Operate",   desc: "Manage daily activities such as inventory, orders, and production workflows."  },
  { num: "04", title: "Improve",   desc: "Analyze performance and refine processes to enhance operational efficiency."   },
];

const statItems = [
  { icon: <FiUsers />,    val: "User Management",    label: "Structured roles and permissions for teams",            color: "var(--mod-inventory)",  dim: "var(--mod-inventory-soft)"  },
  { icon: <FiServer />,   val: "Centralized System", label: "All operations managed from a single platform",          color: "var(--mod-sales)",      dim: "var(--mod-sales-soft)"      },
  { icon: <FiSettings />, val: "Process Control",    label: "Standardized workflows across modules",                  color: "var(--mod-production)", dim: "var(--mod-production-soft)" },
  { icon: <FiBarChart2 />,val: "Data Insights",      label: "Reports to support informed decision-making",            color: "var(--mod-reports)",    dim: "var(--mod-reports-soft)"    },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp    = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22,1,0.36,1] } } };
const slideIn   = { hidden: { opacity: 0, x: 16 }, show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22,1,0.36,1] } } };

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <motion.span className={styles.eyebrow} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          About ERP System
        </motion.span>
        <motion.h1 className={styles.heroTitle} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08, ease: [0.22,1,0.36,1] }}>
          Designed to simplify<br /><span>complex business operations</span>
        </motion.h1>
        <motion.p className={styles.heroDesc} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.14, ease: [0.22,1,0.36,1] }}>
          A centralized system that connects inventory, production, sales, and reporting —
          helping businesses manage operations efficiently without disconnected tools.
        </motion.p>
      </section>

      {/* What is ERP */}
      <section>
        <div className={styles.whatSection}>
          <motion.div className={styles.whatLeft} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}>
            <span className={styles.sectionLabel}>What is ERP?</span>
            <h2 className={styles.sectionTitle}>A unified system for business operations</h2>
            <p className={styles.sectionText}>
              Enterprise Resource Planning (ERP) integrates core business processes into a single system.
              It ensures data flows consistently across departments, reducing manual work and improving coordination.
            </p>
            <div className={styles.checkList}>
              {["Centralized data across all business functions","Role-based access for structured operations","Automated process tracking and alerts","Improved visibility into workflows and performance"].map((item) => (
                <div key={item} className={styles.checkItem}>
                  <div className={styles.checkIcon}><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg></div>
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className={styles.whatRight} variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {statItems.map((s) => (
              <motion.div key={s.label} className={styles.statBox} variants={slideIn}>
                <div className={styles.statBoxIcon} style={{ background: s.dim, color: s.color }}>{s.icon}</div>
                <div>
                  <div className={styles.statBoxVal}>{s.val}</div>
                  <div className={styles.statBoxLabel}>{s.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modules */}
      <section className={styles.modulesSection}>
        <div className={styles.modulesInner}>
          <motion.div className={styles.sectionHeader} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}>
            <span className={styles.eyebrow}>Core Modules</span>
            <h2 className={styles.sectionTitle}>Integrated business functionalities</h2>
            <p style={{ fontSize: 14.5, color: "var(--text-muted)", maxWidth: 480 }}>
              Each module manages a specific function while remaining connected within the overall system.
            </p>
          </motion.div>
          <motion.div className={styles.moduleGrid} variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {modules.map((m) => (
              <motion.div key={m.name} className={styles.moduleCard} style={{ "--c": m.color }} variants={fadeUp} onClick={() => navigate(m.path)}>
                <div className={styles.moduleIconWrap} style={{ background: m.dim, color: m.color }}>{m.icon}</div>
                <div className={styles.moduleName}>{m.name}</div>
                <div className={styles.moduleDesc}>{m.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Workflow */}
      <section>
        <div className={styles.workflowSection}>
          <motion.div className={styles.sectionHeader} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}>
            <span className={styles.eyebrow}>Workflow</span>
            <h2 className={styles.sectionTitle}>Structured operational approach</h2>
          </motion.div>
          <motion.div className={styles.stepsGrid} variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
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

      {/* CTA */}
      <section className={styles.ctaSection}>
        <motion.div className={styles.ctaBox} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}>
          <h2 className={styles.ctaTitle}>Start managing your operations in a structured way</h2>
          <p className={styles.ctaDesc}>Implement an ERP system to organize workflows, improve coordination, and gain better visibility into your business processes.</p>
          <div className={styles.ctaActions}>
            <motion.button className={styles.btnPrimary} onClick={() => navigate("/register")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              Get Started <FiArrowRight />
            </motion.button>
            <motion.button className={styles.btnSecondary} onClick={() => navigate("/contact")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              Contact Us
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default AboutPage;