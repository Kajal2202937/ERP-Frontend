import styles from "./Footer.module.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiFacebook,
  FiTwitter,
  FiLinkedin,
  FiGithub,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
  },
};

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        {/* ── Brand ── */}
        <motion.div
          className={styles.brand}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <div
            className={styles.brandLogo}
            onClick={() => navigate("/")}
            role="link"
            tabIndex={0}
            aria-label="ERP System — go to homepage"
            onKeyDown={(e) => e.key === "Enter" && navigate("/")}
          >
            <div className={styles.brandMark} aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M2 20h20M6 20V10l6-6 6 6v10M10 20v-5h4v5" />
              </svg>
            </div>
            <span className={styles.brandName}>ERP System</span>
          </div>

          <p className={styles.brandDesc}>
            Manage inventory, production, sales, and reports in one place with a
            simple, structured system built for growing businesses.
          </p>

          <div className={styles.statusRow} role="status" aria-live="polite">
            <span className={styles.statusDot} aria-hidden="true" />
            <span className={styles.statusText}>All systems operational</span>
          </div>

          <div className={styles.socials} aria-label="Social media links">
            {[
              { Icon: FiFacebook, label: "Facebook" },
              { Icon: FiTwitter, label: "Twitter / X" },
              { Icon: FiLinkedin, label: "LinkedIn" },
              { Icon: FiGithub, label: "GitHub" },
            ].map(({ Icon, label }) => (
              <motion.button
                key={label}
                className={styles.socialBtn}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                aria-label={label}
              >
                <Icon aria-hidden="true" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Company links ── */}
        <motion.nav
          className={styles.col}
          aria-label="Company navigation"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ delay: 0.06 }}
        >
          <h4 className={styles.colTitle}>Company</h4>
          {[
            ["Home", "/"],
            ["About", "/about"],
            ["Contact", "/contact"],
          ].map(([label, path]) => (
            <button
              key={label}
              className={styles.colLink}
              onClick={() => navigate(path)}
            >
              {label}
            </button>
          ))}
        </motion.nav>

        {/* ── Module links ── */}
        <motion.nav
          className={styles.col}
          aria-label="Module navigation"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ delay: 0.12 }}
        >
          <h4 className={styles.colTitle}>Modules</h4>
          {[
            ["Inventory", "/inventory/info"],
            ["Production", "/production/info"],
            ["Sales", "/sales"],
            ["Reports", "/reports/info"],
          ].map(([label, path]) => (
            <button
              key={label}
              className={styles.colLink}
              onClick={() => navigate(path)}
            >
              {label}
            </button>
          ))}
        </motion.nav>

        {/* ── Contact ── */}
        <motion.address
          className={styles.col}
          style={{ fontStyle: "normal" }}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ delay: 0.18 }}
        >
          <h4 className={styles.colTitle}>Contact</h4>
          {[
            {
              Icon: FiMail,
              val: "support@example.com",
              label: "Email support",
            },
            { Icon: FiPhone, val: "+91 XXXXX XXXXX", label: "Phone" },
            { Icon: FiMapPin, val: "India", label: "Location" },
          ].map(({ Icon, val, label }) => (
            <div key={val} className={styles.contactItem} aria-label={label}>
              <span className={styles.contactIcon} aria-hidden="true">
                <Icon />
              </span>
              {val}
            </div>
          ))}
          <span
            className={styles.versionBadge}
            aria-label="Version 2.4.1 Enterprise"
          >
            v2.4.1 · Enterprise
          </span>
        </motion.address>
      </div>

      {/* ── Bottom bar ── */}
      <div className={styles.bottom}>
        <p className={styles.bottomLeft}>
          © {new Date().getFullYear()} ERP System. All rights reserved.
        </p>
        <nav className={styles.bottomRight} aria-label="Legal navigation">
          {["Privacy", "Terms", "Security"].map((label) => (
            <button key={label} className={styles.bottomLink}>
              {label}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
