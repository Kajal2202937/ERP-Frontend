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

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <motion.div
          className={styles.brand}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.brandLogo} onClick={() => navigate("/")}>
            <div className={styles.brandMark}>
              <svg viewBox="0 0 24 24">
                <path d="M2 20h20M6 20V10l6-6 6 6v10M10 20v-5h4v5" />
              </svg>
            </div>
            <span className={styles.brandName}>ERP System</span>
          </div>
          <p className={styles.brandDesc}>
            Manage inventory, production, sales, and reports in one place with a
            simple, structured system.
          </p>
          <div className={styles.statusRow}>
            <span className={styles.statusDot} />
            <span className={styles.statusText}>All systems operational</span>
          </div>
          <div className={styles.socials}>
            {[FiFacebook, FiTwitter, FiLinkedin, FiGithub].map((Icon, i) => (
              <motion.button
                key={i}
                className={styles.socialBtn}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
              >
                <Icon />
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          className={styles.col}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
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
        </motion.div>
        <motion.div
          className={styles.col}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
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
        </motion.div>
        <motion.div
          className={styles.col}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <h4 className={styles.colTitle}>Contact</h4>
          {[
            { icon: <FiMail />, val: "support@example.com" },
            { icon: <FiPhone />, val: "+91 XXXXX XXXXX" },
            { icon: <FiMapPin />, val: "India" },
          ].map((item) => (
            <div key={item.val} className={styles.contactItem}>
              <span className={styles.contactIcon}>{item.icon}</span>
              {item.val}
            </div>
          ))}
          <span className={styles.versionBadge}>v2.4.1 · Enterprise</span>
        </motion.div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.bottomLeft}>
          © {new Date().getFullYear()} ERP System. All rights reserved.
        </p>
        <div className={styles.bottomRight}>
          {["Privacy", "Terms", "Security"].map((label) => (
            <button key={label} className={styles.bottomLink}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
