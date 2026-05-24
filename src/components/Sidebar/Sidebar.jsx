import { useMemo, useCallback } from "react";
import useAuth from "../../hooks/useAuth";
import { NavLink, useLocation } from "react-router-dom";
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
  TicketCheck,
  Settings,
  UserCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Sidebar.module.css";

const NAV_GROUPS = [
  {
    id: "main",
    label: "Main",
    items: [
      {
        to: "/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        roles: ["admin", "manager", "staff", "employee"],
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      {
        to: "/products",
        icon: Package,
        label: "Products",
        roles: ["admin", "manager"],
      },
      {
        to: "/orders",
        icon: ShoppingCart,
        label: "Orders",
        roles: ["admin", "manager"],
      },
      {
        to: "/inventory",
        icon: Boxes,
        label: "Inventory",
        roles: ["admin", "manager", "staff", "employee"],
      },
      {
        to: "/suppliers",
        icon: Users,
        label: "Suppliers",
        roles: ["admin", "manager"],
      },
      {
        to: "/production",
        icon: Factory,
        label: "Production",
        roles: ["admin", "manager"],
      },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    items: [
      {
        to: "/reports",
        icon: BarChart3,
        label: "Reports",
        roles: ["admin"],
      },
      {
        to: "/tickets",
        icon: TicketCheck,
        label: "Support",
        roles: ["admin"],
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      {
        to: "/profile",
        icon: UserCircle,
        label: "Profile",
        roles: ["admin", "manager", "staff", "employee"],
      },
    ],
  },
];

const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    color: "#f87171",
    bg: "rgba(248,113,113,0.1)",
    border: "rgba(248,113,113,0.2)",
  },
  manager: {
    label: "Manager",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.2)",
  },
  staff: {
    label: "Staff",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)",
    border: "rgba(96,165,250,0.2)",
  },
  employee: {
    label: "Employee",
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
    border: "rgba(52,211,153,0.2)",
  },
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

const NavItem = ({ item, collapsed, mobile }) => {
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          `${styles.link} ${isActive ? styles.linkActive : ""}`
        }
        end={item.to === "/dashboard"}
      >
        <span className={styles.linkIcon}>
          <Icon size={15} strokeWidth={1.75} />
        </span>

        <AnimatePresence initial={false}>
          {(!collapsed || mobile) && (
            <motion.span
              className={styles.linkLabel}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Tooltip shown only when collapsed on desktop */}
        {collapsed && !mobile && (
          <span className={styles.tooltip} role="tooltip">
            {item.label}
          </span>
        )}
      </NavLink>
    </li>
  );
};

const NavGroup = ({ group, collapsed, mobile }) => {
  if (group.items.length === 0) return null;

  return (
    <div className={styles.group}>
      <AnimatePresence initial={false}>
        {(!collapsed || mobile) && (
          <motion.p
            className={styles.groupLabel}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
          >
            {group.label}
          </motion.p>
        )}
      </AnimatePresence>

      <ul className={styles.groupList}>
        {group.items.map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.035, duration: 0.22 }}
          >
            <NavItem item={item} collapsed={collapsed} mobile={mobile} />
          </motion.div>
        ))}
      </ul>
    </div>
  );
};

const SidebarShell = ({
  collapsed,
  setCollapsed,
  mobile,
  setMobileOpen,
  groups,
  user,
}) => {
  const roleCfg = ROLE_CONFIG[user?.role] || ROLE_CONFIG.employee;

  const handleCollapse = useCallback(() => {
    setCollapsed((p) => !p);
  }, [setCollapsed]);

  return (
    <aside
      className={`${styles.sidebar} ${collapsed && !mobile ? styles.collapsed : ""} ${mobile ? styles.mobile : ""}`}
      aria-label="Main navigation"
    >
      {/* ── Logo / Brand ── */}
      <div className={styles.brand}>
        <div className={styles.brandMark}>
          <span>E</span>
        </div>

        <AnimatePresence initial={false}>
          {(!collapsed || mobile) && (
            <motion.div
              className={styles.brandText}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className={styles.brandName}>ERP</span>
              <span className={styles.brandVersion}>v2.4.1</span>
            </motion.div>
          )}
        </AnimatePresence>

        {mobile ? (
          <button
            className={styles.iconBtn}
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={14} />
          </button>
        ) : (
          <motion.button
            className={styles.iconBtn}
            onClick={handleCollapse}
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft size={14} />
          </motion.button>
        )}
      </div>

      {/* ── User card ── */}
      <div className={styles.userCard}>
        <div
          className={styles.userAvatar}
          style={{
            background: `${roleCfg.color}22`,
            borderColor: `${roleCfg.color}33`,
          }}
        >
          <span style={{ color: roleCfg.color }}>
            {getInitials(user?.name)}
          </span>
        </div>

        <AnimatePresence initial={false}>
          {(!collapsed || mobile) && (
            <motion.div
              className={styles.userInfo}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className={styles.userName}>{user?.name || "User"}</p>
              <span
                className={styles.userRole}
                style={{
                  color: roleCfg.color,
                  background: roleCfg.bg,
                  borderColor: roleCfg.border,
                }}
              >
                {roleCfg.label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Divider ── */}
      <div className={styles.divider} />

      {/* ── Nav groups ── */}
      <nav className={styles.nav}>
        {groups.map((group) => (
          <NavGroup
            key={group.id}
            group={group}
            collapsed={collapsed}
            mobile={mobile}
          />
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className={styles.sidebarFooter}>
        <AnimatePresence initial={false}>
          {(!collapsed || mobile) && (
            <motion.p
              className={styles.footerText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              Enterprise Edition · {new Date().getFullYear()}
            </motion.p>
          )}
        </AnimatePresence>
        {collapsed && !mobile && (
          <div className={styles.footerDot} title="Enterprise Edition" />
        )}
      </div>
    </aside>
  );
};

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { user } = useAuth();

  const filteredGroups = useMemo(() => {
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(user?.role)),
    })).filter((group) => group.items.length > 0);
  }, [user?.role]);

  const sharedProps = {
    collapsed,
    setCollapsed,
    groups: filteredGroups,
    user,
  };

  return (
    <>
      {/* Desktop */}
      <div className={styles.desktopWrapper}>
        <SidebarShell
          {...sharedProps}
          mobile={false}
          setMobileOpen={setMobileOpen}
        />
      </div>

      {/* Mobile drawer */}
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
              aria-hidden="true"
            />
            <motion.div
              className={styles.mobileDrawer}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <SidebarShell
                {...sharedProps}
                mobile
                setMobileOpen={setMobileOpen}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
