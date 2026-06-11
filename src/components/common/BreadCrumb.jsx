import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import styles from "./Breadcrumb.module.css";

/**
 * Breadcrumb
 * ──────────
 * Auto-generates breadcrumbs from the current URL path.
 * Drop into MainLayout above <Outlet /> — it reads useLocation() itself.
 *
 * Route label overrides:
 *   /dashboard  → "Dashboard"
 *   /inventory  → "Inventory"
 *   etc.
 *
 * Dynamic segments:
 *   /orders/123  → Orders > #123
 *
 * Usage in MainLayout.jsx:
 *   import Breadcrumb from "../Breadcrumb/Breadcrumb";
 *   // Inside .content, above <Outlet />:
 *   <Breadcrumb />
 */

const ROUTE_LABELS = {
  dashboard:  "Dashboard",
  inventory:  "Inventory",
  orders:     "Orders",
  products:   "Products",
  suppliers:  "Suppliers",
  production: "Production",
  reports:    "Reports",
  tickets:    "Support",
  profile:    "My Profile",
};

const isMongoId = (str) => /^[a-f\d]{24}$/i.test(str);

const segmentLabel = (seg) => {
  if (isMongoId(seg)) return `#${seg.slice(-6).toUpperCase()}`;
  return ROUTE_LABELS[seg.toLowerCase()] ?? seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function Breadcrumb() {
  const { pathname } = useLocation();

  const crumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [];

    return segments.map((seg, i) => ({
      label: segmentLabel(seg),
      path:  "/" + segments.slice(0, i + 1).join("/"),
      isLast: i === segments.length - 1,
    }));
  }, [pathname]);

  /* Don't render on the homepage or if only one level deep */
  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={styles.nav}>
      <ol className={styles.list} role="list">
        {/* Home */}
        <li className={styles.item}>
          <Link to="/dashboard" className={styles.link} aria-label="Dashboard home">
            <Home size={11} aria-hidden="true" />
          </Link>
        </li>

        {crumbs.map((crumb) => (
          <li key={crumb.path} className={styles.item}>
            <ChevronRight size={10} className={styles.sep} aria-hidden="true" />
            {crumb.isLast ? (
              <span className={styles.current} aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.path} className={styles.link}>
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}