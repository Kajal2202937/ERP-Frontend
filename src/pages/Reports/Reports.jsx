import {
  FiShoppingCart,
  FiTrendingUp,
  FiRefreshCw,
  FiZap,
} from "react-icons/fi";
import { TbCurrencyRupee } from "react-icons/tb";
import { useEffect, useState, useCallback } from "react";
import styles from "./Reports.module.css";
import { motion, AnimatePresence } from "framer-motion";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  getSalesSummary,
  getSalesTrend,
  getInsights,
} from "../../services/ReportService";

// ─────────────────────────────
// Utils
// ─────────────────────────────
const formatINR = (num) => Number(num || 0).toLocaleString("en-IN");

// ✅ NEW: format date (fix 000000 issue)
const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d)) return date; // fallback if already formatted
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

// ✅ NEW: compact currency
const formatCompactINR = (value) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

// ✅ UPDATED TOOLTIP
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className={styles.tooltip}>
      <p>{formatDate(label)}</p>
      <span>
        <TbCurrencyRupee size={12} />
        {formatINR(payload?.[0]?.value)}
      </span>
    </div>
  );
};

// ─────────────────────────────
// COMPONENT
// ─────────────────────────────
const Reports = () => {
  const [data, setData] = useState({
    summary: {},
    trend: [],
    insight: "",
  });

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const [ui, setUI] = useState({
    loading: false,
    error: null,
    activeCard: null,
  });

  // ─────────────────────────────
  // Fallback Insight
  // ─────────────────────────────
  const generateFallbackInsight = (summary = {}) => {
    const revenue = summary.totalRevenue || 0;
    const orders = summary.totalOrders || 0;

    if (!orders && !revenue) {
      return "No sufficient data available for insights.";
    }

    let msg = `You generated ₹${formatINR(revenue)} from ${orders} orders. `;

    if (orders > 50) msg += "Strong order volume detected.";
    else if (orders > 0) msg += "Moderate activity detected.";

    if (revenue > 100000) msg += " Revenue performance is strong.";

    return msg.split(". ").join(".\n");
  };

  // ─────────────────────────────
  // FETCH DATA
  // ─────────────────────────────
  const fetchReports = useCallback(async () => {
    setUI((p) => ({ ...p, loading: true, error: null }));

    try {
      const [summaryRes, trendRes, insightRes] = await Promise.allSettled([
        getSalesSummary(filters),
        getSalesTrend(filters),
        getInsights(),
      ]);

      const summary =
        summaryRes.status === "fulfilled" ? summaryRes.value.data : {};
      const trend = trendRes.status === "fulfilled" ? trendRes.value.data : [];
      const rawInsight =
        insightRes.status === "fulfilled"
          ? (insightRes.value?.data ?? insightRes.value)
          : null;

      const insight =
        typeof rawInsight === "string"
          ? rawInsight
          : generateFallbackInsight(summary);

      setData({
        summary,
        trend,
        insight,
      });
    } catch (err) {
      console.error(err);
      setUI((p) => ({
        ...p,
        error: "Unable to load reports",
      }));
    } finally {
      setUI((p) => ({ ...p, loading: false }));
    }
  }, [filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // ─────────────────────────────
  // KPI CARDS
  // ─────────────────────────────
  const cards = [
    {
      key: "orders",
      label: "Orders",
      value: data.summary?.totalOrders || 0,
      icon: <FiShoppingCart />,
      color: "#6366f1",
    },
    {
      key: "revenue",
      label: "Revenue",
      value: `₹${formatINR(data.summary?.totalRevenue)}`,
      icon: <TbCurrencyRupee />,
      color: "#f59e0b",
    },
    {
      key: "profit",
      label: "Profit",
      value: `₹${formatINR(data.summary?.profit || 0)}`,
      icon: <FiTrendingUp />,
      color: "#22c55e",
    },
    {
      key: "margin",
      label: "Profit Margin",
      value: `${(data.summary?.profitMargin || 0).toFixed(1)}%`,
      icon: <FiTrendingUp />,
      color: "#10b981",
    },
  ];

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h2>Reports Dashboard</h2>
          <p>Analytics & performance overview</p>
        </div>

        <div className={styles.actions}>
          <div className={styles.filters}>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((p) => ({ ...p, startDate: e.target.value }))
              }
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((p) => ({ ...p, endDate: e.target.value }))
              }
            />
          </div>

          <button onClick={fetchReports}>
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* ERROR */}
      <AnimatePresence>
        {ui.error && (
          <motion.div
            className={styles.error}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {ui.error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI */}
      <div className={styles.kpiGrid}>
        {cards.map((card) => {
          const active = ui.activeCard === card.key;

          return (
            <motion.div
              key={card.key}
              className={`${styles.card} ${active ? styles.active : ""}`}
              onClick={() =>
                setUI((p) => ({
                  ...p,
                  activeCard: active ? null : card.key,
                }))
              }
              whileHover={{ scale: 1.04 }}
            >
              <div className={styles.cardTop}>
                <span style={{ color: card.color }}>{card.icon}</span>
                <p>{card.label}</p>
              </div>

              <h3>{ui.loading ? "..." : card.value}</h3>
            </motion.div>
          );
        })}
      </div>

      {/* CHART */}
      <div className={styles.chartBox}>
        <h3>Sales Trend</h3>

        {ui.loading ? (
          <div className={styles.loader} />
        ) : data.trend.length === 0 ? (
          <div className={styles.empty}>No Data Available</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.trend}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />

              {/* ✅ FIXED X AXIS */}
              <XAxis dataKey="date" tickFormatter={formatDate} />

              {/* ✅ CLEAN Y AXIS */}
              <YAxis tickFormatter={formatCompactINR} />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="total"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#grad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* INSIGHTS */}
      <div className={styles.insight}>
        <div className={styles.insightHeader}>
          <FiZap />
          <h4>Insights</h4>
        </div>

        {/* ✅ UPDATED */}
        <p className={styles.insightText}>
          <FiTrendingUp className={styles.insightIcon} />
          <span className={styles.insightContent}>{data.insight}</span>
        </p>
      </div>
    </div>
  );
};

export default Reports;
