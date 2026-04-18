import styles from "./Navbar.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import useTheme from "../../../hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Sun, Moon } from "lucide-react";
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiBox,
  FiSettings,
  FiShoppingCart,
  FiBarChart2,
} from "react-icons/fi";

const modules = [
  {
    path: "/inventory/info",
    icon: <FiBox />,
    label: "Inventory",
    sub: "Stock & warehouse control",
    color: "var(--mod-inventory)",
    dim: "var(--mod-inventory-soft)",
  },
  {
    path: "/production/info",
    icon: <FiSettings />,
    label: "Production",
    sub: "Manufacturing workflows",
    color: "var(--mod-production)",
    dim: "var(--mod-production-soft)",
  },
  {
    path: "/sales",
    icon: <FiShoppingCart />,
    label: "Sales",
    sub: "Orders & transactions",
    color: "var(--mod-sales)",
    dim: "var(--mod-sales-soft)",
  },
  {
    path: "/reports/info",
    icon: <FiBarChart2 />,
    label: "Reports",
    sub: "Analytics & insights",
    color: "var(--mod-reports)",
    dim: "var(--mod-reports-soft)",
  },
];

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  const dropdownRef = useRef(null);

  const goTo = (path) => {
    navigate(path);
    setMenuOpen(false);
    setDropdown(false);
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={styles.navbar}>
      <div className={styles.logo} onClick={() => goTo("/")}>
        <div className={styles.logoMark}>
          <svg viewBox="0 0 24 24">
            <path d="M2 20h20M6 20V10l6-6 6 6v10M10 20v-5h4v5" />
          </svg>
        </div>
        <div>
          <span className={styles.logoText}>ERP System</span>{" "}
          <span className={styles.logoSub}>Enterprise</span>
        </div>
      </div>

      <nav className={styles.links}>
        {["/", "/about", "/contact"].map((path, i) => (
          <motion.button
            key={path}
            className={`${styles.navBtn} ${isActive(path) ? styles.active : ""}`}
            onClick={() => goTo(path)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {["Home", "About", "Contact"][i]}
          </motion.button>
        ))}
        <div className={styles.dropdownWrap} ref={dropdownRef}>
          <button
            className={`${styles.dropdownBtn} ${dropdown ? styles.open : ""}`}
            onClick={() => setDropdown((prev) => !prev)}
          >
            Modules
            <FiChevronDown
              className={`${styles.chevron} ${dropdown ? styles.rotated : ""}`}
            />
          </button>

          <div
            className={`${styles.dropdownMenu} ${dropdown ? styles.show : ""}`}
          >
            {modules.map((m) => (
              <div
                key={m.path}
                className={styles.dropItem}
                onClick={() => goTo(m.path)}
              >
                <div
                  className={styles.dropItemIcon}
                  style={{
                    background: m.dim,
                    color: m.color,
                    border: `1px solid color-mix(in srgb, ${m.color} 20%, transparent)`,
                  }}
                >
                  {m.icon}
                </div>
                <div>
                  <div className={styles.dropItemText}>{m.label}</div>
                  <div className={styles.dropItemSub}>{m.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </nav>
      <div className={styles.actions}>
        <motion.button
          className={styles.iconBtn}
          onClick={toggleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 30, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        <motion.button
          className={styles.btnOutline}
          onClick={() => goTo("/login")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Sign in
        </motion.button>
      </div>
      <motion.div
        className={styles.menuIcon}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <FiX /> : <FiMenu />}
      </motion.div>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ""}`}>
        {["/", "/about", "/contact"].map((path, i) => (
          <button
            key={path}
            className={styles.mobileNavBtn}
            onClick={() => goTo(path)}
          >
            {["Home", "About", "Contact"][i]}
          </button>
        ))}
      </div>
    </header>
  );
};

export default Navbar;
