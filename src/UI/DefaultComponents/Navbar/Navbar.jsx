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
  FiArrowRight,
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
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef(null);

  const goTo = (path) => {
    navigate(path);
    setMenuOpen(false);
    setDropdown(false);
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}
      role="banner"
    >
      {/* ── Logo ── */}
      <div
        className={styles.logo}
        onClick={() => goTo("/")}
        role="link"
        tabIndex={0}
        aria-label="ERP System — go to homepage"
        onKeyDown={(e) => e.key === "Enter" && goTo("/")}
      >
        <div className={styles.logoMark} aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M2 20h20M6 20V10l6-6 6 6v10M10 20v-5h4v5" />
          </svg>
        </div>
        <div className={styles.logoTextGroup}>
          <span className={styles.logoText}>ERP System</span>
          <span className={styles.logoSub}>Enterprise</span>
        </div>
      </div>

      {/* ── Desktop nav ── */}
      <nav className={styles.links} aria-label="Main navigation">
        {[
          { path: "/", label: "Home" },
          { path: "/about", label: "About" },
          { path: "/contact", label: "Contact" },
        ].map(({ path, label }) => (
          <motion.button
            key={path}
            className={`${styles.navBtn} ${isActive(path) ? styles.active : ""}`}
            onClick={() => goTo(path)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            aria-current={isActive(path) ? "page" : undefined}
          >
            {label}
          </motion.button>
        ))}

        {/* Modules dropdown */}
        <div className={styles.dropdownWrap} ref={dropdownRef}>
          <button
            className={`${styles.dropdownBtn} ${dropdown ? styles.open : ""}`}
            onClick={() => setDropdown((prev) => !prev)}
            aria-expanded={dropdown}
            aria-haspopup="true"
          >
            Modules
            <FiChevronDown className={styles.chevron} aria-hidden="true" />
          </button>

          <div
            className={`${styles.dropdownMenu} ${dropdown ? styles.show : ""}`}
            role="menu"
          >
            {modules.map((m) => (
              <div
                key={m.path}
                className={styles.dropItem}
                onClick={() => goTo(m.path)}
                role="menuitem"
                tabIndex={dropdown ? 0 : -1}
                onKeyDown={(e) => e.key === "Enter" && goTo(m.path)}
              >
                <div
                  className={styles.dropItemIcon}
                  style={{
                    background: m.dim,
                    color: m.color,
                    border: `1px solid color-mix(in srgb, ${m.color} 18%, transparent)`,
                  }}
                  aria-hidden="true"
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

      {/* ── Desktop actions ── */}
      <div className={styles.actions}>
        <motion.button
          className={styles.iconBtn}
          onClick={toggleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 30, opacity: 0 }}
              transition={{ duration: 0.18 }}
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

      {/* ── Mobile hamburger ── */}
      <button
        className={styles.menuIcon}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={menuOpen ? "close" : "open"}
            initial={{ rotate: -20, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 20, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </motion.div>
        </AnimatePresence>
      </button>

      {/* ── Mobile drawer ── */}
      <nav
        id="mobile-menu"
        className={`${styles.mobileMenu} ${menuOpen ? styles.open : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <div className={styles.mobileSection}>
          <p className={styles.mobileSectionLabel}>Navigation</p>
          {[
            { path: "/", label: "Home" },
            { path: "/about", label: "About" },
            { path: "/contact", label: "Contact" },
          ].map(({ path, label }) => (
            <button
              key={path}
              className={`${styles.mobileNavBtn} ${isActive(path) ? styles.activeMobile : ""}`}
              onClick={() => goTo(path)}
              tabIndex={menuOpen ? 0 : -1}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.mobileDivider} />

        <div className={styles.mobileSection}>
          <p className={styles.mobileSectionLabel}>Modules</p>
          {modules.map((m) => (
            <div
              key={m.path}
              className={styles.mobileModuleItem}
              onClick={() => goTo(m.path)}
              role="button"
              tabIndex={menuOpen ? 0 : -1}
              onKeyDown={(e) => e.key === "Enter" && goTo(m.path)}
            >
              <div
                className={styles.mobileModuleIcon}
                style={{ background: m.dim, color: m.color }}
                aria-hidden="true"
              >
                {m.icon}
              </div>
              <div>
                <div className={styles.mobileModuleText}>{m.label}</div>
                <div className={styles.mobileModuleSub}>{m.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.mobileDivider} />

        <button
          className={styles.mobileThemeBtn}
          onClick={toggleTheme}
          tabIndex={menuOpen ? 0 : -1}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          <span>
            {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </span>
        </button>

        <div className={styles.mobileDivider} />

        <button
          className={styles.mobileLoginBtn}
          onClick={() => goTo("/login")}
          tabIndex={menuOpen ? 0 : -1}
        >
          Get Started
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
