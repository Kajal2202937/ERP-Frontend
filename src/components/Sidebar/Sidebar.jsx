import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Users,
  Factory,
  BarChart3,
  ChevronLeft,
  X,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Sidebar.module.css";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getLinkClass = ({ isActive }) =>
    isActive ? `${styles.link} ${styles.active}` : styles.link;

  const menuItems = [
    {
      to: "/dashboard",
      icon: <LayoutDashboard size={16} />,
      label: "Dashboard",
    },
    ...(user?.role === "admin" || user?.role === "manager"
      ? [
          { to: "/products", icon: <Package size={16} />, label: "Products" },
          { to: "/orders", icon: <ShoppingCart size={16} />, label: "Orders" },
          { to: "/inventory", icon: <Boxes size={16} />, label: "Inventory" },
        ]
      : []),
    ...(user?.role === "admin"
      ? [
          { to: "/suppliers", icon: <Users size={16} />, label: "Suppliers" },
          {
            to: "/production",
            icon: <Factory size={16} />,
            label: "Production",
          },
          { to: "/reports", icon: <BarChart3 size={16} />, label: "Reports" },
          { to: "/contacts", icon: <Mail size={16} />, label: "Messages" },
        ]
      : []),
  ];

  const SidebarContent = ({ mobile = false }) => (
    <div
      className={`${styles.sidebar} ${collapsed && !mobile ? styles.collapsed : ""} ${mobile ? styles.mobile : ""}`}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>
            <span>E</span>
          </div>
          <AnimatePresence>
            {(!collapsed || mobile) && (
              <motion.div
                className={styles.brandText}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className={styles.brandName}>ERP</span>
                <span className={styles.brandSub}>System</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {mobile ? (
          <button
            className={styles.closeBtn}
            onClick={() => setMobileOpen(false)}
          >
            <X size={14} />
          </button>
        ) : (
          <motion.button
            className={styles.collapseBtn}
            onClick={() => setCollapsed((p) => !p)}
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Toggle sidebar"
          >
            <ChevronLeft size={14} />
          </motion.button>
        )}
      </div>

      {/* Menu */}
      <nav className={styles.nav}>
        <ul className={styles.menu}>
          {menuItems.map((item, index) => (
            <motion.li
              key={item.to}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, duration: 0.25 }}
            >
              <NavLink to={item.to} className={getLinkClass}>
                <span className={styles.linkIcon}>{item.icon}</span>
                <AnimatePresence>
                  {(!collapsed || mobile) && (
                    <motion.span
                      className={styles.linkLabel}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {collapsed && !mobile && (
                  <div className={styles.tooltip}>{item.label}</div>
                )}
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        {(!collapsed || mobile) && (
          <p className={styles.footerText}>v2.4.1 · Enterprise</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.desktopWrapper}>
        <SidebarContent />
      </div>

      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <span />
        <span />
        <span />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className={styles.mobileDrawer}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <SidebarContent mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
