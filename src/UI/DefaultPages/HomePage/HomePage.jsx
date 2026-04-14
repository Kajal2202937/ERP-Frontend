import styles from "./HomePage.module.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBox, FiSettings, FiShoppingCart, FiBarChart2, FiArrowRight, FiCheck } from "react-icons/fi";

const modules = [
  { icon: <FiBox />,         name: "Inventory",  desc: "Track stock levels, manage warehouses, and maintain accurate inventory records across operations.", path: "/inventory/info",  color: "var(--mod-inventory)",  dim: "var(--mod-inventory-soft)"  },
  { icon: <FiSettings />,    name: "Production", desc: "Plan and manage production workflows while monitoring progress and resource utilization.",           path: "/production/info", color: "var(--mod-production)", dim: "var(--mod-production-soft)" },
  { icon: <FiShoppingCart />,name: "Sales",      desc: "Handle order processing, customer interactions, and sales lifecycle management in one place.",       path: "/sales",           color: "var(--mod-sales)",      dim: "var(--mod-sales-soft)"      },
  { icon: <FiBarChart2 />,   name: "Reports",    desc: "Analyze operational data through structured reports and visual insights for better decisions.",       path: "/reports/info",    color: "var(--mod-reports)",    dim: "var(--mod-reports-soft)"    },
];

const steps = [
  { num: "01", title: "Plan",     desc: "Define your business structure, workflows, and processes based on operational needs."      },
  { num: "02", title: "Manage",   desc: "Centralize inventory, orders, and production activities within a unified system."          },
  { num: "03", title: "Track",    desc: "Monitor processes, stock movements, and operational performance continuously."              },
  { num: "04", title: "Optimize", desc: "Improve efficiency by analyzing workflows and refining business operations over time."     },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp    = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section>
        <div className={styles.hero}>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />

          <motion.div className={styles.heroLeft}
            initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <div className={styles.badge}>Enterprise Resource Planning</div>
            <h1 className={styles.heroTitle}>
              Manage Your Business<br />
              <span>With One Unified System</span>
            </h1>
            <p className={styles.heroDesc}>
              A centralized platform to handle inventory, production, sales, and reporting —
              designed to simplify operations and improve visibility across your business.
            </p>
            <div className={styles.heroActions}>
              <motion.button className={styles.btnPrimary} onClick={() => navigate("/login")}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                Get Started <FiArrowRight />
              </motion.button>
              <motion.button className={styles.btnSecondary} onClick={() => navigate("/about")}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                Learn More
              </motion.button>
            </div>
            <div className={styles.heroTrust}>
              {["Centralized data management", "Modular system design", "Scalable for growing businesses"].map((t) => (
                <span key={t} className={styles.trustItem}><FiCheck />{t}</span>
              ))}
            </div>
          </motion.div>

          <motion.div className={styles.heroRight}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
            <div className={styles.dashPreview}>
              <div className={styles.previewBar}>
                {["#f87171","#f0a855","#3ecf8e"].map((c,i)=><div key={i} className={styles.dot} style={{background:c}}/>)}
              </div>
              <div className={styles.previewBody}>
                <div className={styles.previewKpis}>
                  {[
                    { label: "Orders",      val: "Managed",   trend: "Active",   tColor: "var(--green)"   },
                    { label: "Inventory",   val: "Tracked",   trend: "Updated",  tColor: "var(--green)"   },
                    { label: "Stock Alerts",val: "Monitored", trend: "Live",     tColor: "var(--amber)"   },
                    { label: "Products",    val: "Organized", trend: "Stable",   tColor: "var(--text-secondary)" },
                  ].map((k) => (
                    <div key={k.label} className={styles.kpiMini}>
                      <span className={styles.kpiLabel}>{k.label}</span>
                      <span className={styles.kpiVal}>{k.val}</span>
                      <span className={styles.kpiTrend} style={{ color: k.tColor }}>{k.trend}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.previewChart}>
                  <span className={styles.chartLabel}>Operational Activity Overview</span>
                  <div className={styles.chartBars}>
                    {[30,50,38,65,45,72,88].map((h,i)=>(
                      <motion.div key={i} className={styles.bar}
                        initial={{ height: 0 }} animate={{ height: `${h}%` }}
                        transition={{ delay: 0.4 + i * 0.06, duration: 0.5, ease: [0.22,1,0.36,1] }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Strip ── */}
      <div className={styles.statsStrip}>
        <div className={styles.statsInner}>
          {["Centralized Operations","Modular Architecture","Real-time Monitoring","Scalable System Design"].map((text,i)=>(
            <motion.div key={text} className={styles.statItem}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}>
              <span className={styles.statVal}>{text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Modules ── */}
      <section className={styles.modulesSection}>
        <motion.div className={styles.sectionHeader}
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}>
          <span className={styles.eyebrow}>Core Modules</span>
          <h2 className={styles.sectionTitle}>Integrated business functionalities</h2>
          <p className={styles.sectionSub}>Each module handles a specific part of your business while staying connected in one system.</p>
        </motion.div>

        <motion.div className={styles.moduleGrid} variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {modules.map((m) => (
            <motion.div key={m.name} className={styles.moduleCard} style={{ "--c": m.color }}
              variants={fadeUp} onClick={() => navigate(m.path)}>
              <div className={styles.moduleIconWrap} style={{ background: m.dim, color: m.color }}>
                {m.icon}
              </div>
              <div className={styles.moduleName}>{m.name}</div>
              <div className={styles.moduleDesc}>{m.desc}</div>
              <div className={styles.moduleArrow}>Explore <FiArrowRight /></div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── How it works ── */}
      <section className={styles.howSection}>
        <div className={styles.howInner}>
          <motion.div className={styles.sectionHeader} style={{ textAlign: "left", alignItems: "flex-start" }}
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}>
            <span className={styles.eyebrow}>Workflow</span>
            <h2 className={styles.sectionTitle}>Structured business process</h2>
            <p className={styles.sectionSub}>A simplified approach to managing operations from planning to optimization.</p>
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

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <motion.div className={styles.ctaInner}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}>
          <div className={styles.ctaBox}>
            <h2 className={styles.ctaTitle}>Start managing your operations efficiently</h2>
            <p className={styles.ctaDesc}>Use a structured ERP system to organize workflows, monitor processes, and improve overall efficiency.</p>
            <div className={styles.ctaActions}>
              <motion.button className={styles.btnPrimary} onClick={() => navigate("/login")}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                Get Started <FiArrowRight />
              </motion.button>
              <motion.button className={styles.btnSecondary} onClick={() => navigate("/contact")}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
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