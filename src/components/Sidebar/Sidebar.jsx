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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import styles from "./Sidebar.module.css";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getLinkClass = ({ isActive }) =>
    isActive ? `${styles.link} ${styles.active}` : styles.link;

  const menuItems = [
    { to: "/dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },

    ...(user?.role === "admin" || user?.role === "manager"
      ? [
          { to: "/products", icon: <Package size={18} />, label: "Products" },
          { to: "/orders", icon: <ShoppingCart size={18} />, label: "Orders" },
          { to: "/inventory", icon: <Boxes size={18} />, label: "Inventory" },
        ]
      : []),

    ...(user?.role === "admin"
      ? [
          { to: "/suppliers", icon: <Users size={18} />, label: "Suppliers" },
          { to: "/production", icon: <Factory size={18} />, label: "Production" },
          { to: "/reports", icon: <BarChart3 size={18} />, label: "Reports" },
        ]
      : []),
  ];

  const SidebarContent = ({ mobile = false }) => (
    <div className={`${styles.sidebar} ${collapsed && !mobile ? styles.collapsed : ""} ${mobile ? styles.mobile : ""}`}>
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
          <button className={styles.closeBtn} onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        ) : (
          <motion.button
            className={styles.collapseBtn}
            onClick={() => setCollapsed((p) => !p)}
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Toggle sidebar"
          >
            <ChevronLeft size={16} />
          </motion.button>
        )}
      </div>

      {/* User tag */}
      <div className={`${styles.userTag} ${collapsed && !mobile ? styles.userTagCollapsed : ""}`}>
        <div className={styles.userAvatar}>
          {user?.name?.[0]?.toUpperCase() ?? "U"}
        </div>
        <AnimatePresence>
          {(!collapsed || mobile) && (
            <motion.div
              className={styles.userMeta}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <span className={styles.userTagName}>{user?.name}</span>
              <span className={styles.userTagRole}>{user?.role}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Separator label */}
      {(!collapsed || mobile) && (
        <div className={styles.sectionLabel}>Navigation</div>
      )}

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
                {(collapsed && !mobile) && (
                  <div className={styles.tooltip}>{item.label}</div>
                )}
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        {(!collapsed || mobile) && (
          <p className={styles.footerText}>v2.4.1 — Enterprise</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={styles.desktopWrapper}>
        <SidebarContent />
      </div>

      {/* Mobile Toggle Button */}
      <button className={styles.mobileToggle} onClick={() => setMobileOpen(true)} aria-label="Open menu">
        <span /><span /><span />
      </button>

      {/* Mobile Overlay + Drawer */}
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