import {
  FiShoppingCart, FiTrendingUp, FiRefreshCw, FiCalendar, FiZap,
} from "react-icons/fi";
import { TbCurrencyRupee } from "react-icons/tb";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Reports.module.css";
import { motion, AnimatePresence } from "framer-motion";

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Area, AreaChart,
} from "recharts";

import {
  getSalesSummary, getSalesTrend, getInsights,
} from "../../services/ReportService";

// ─── helpers ──────────────────────────────────────────────────────────────

const fmtINR = (n) =>
  Number(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>
        <TbCurrencyRupee size={13} />
        {fmtINR(payload?.[0]?.value ?? 0)}
      </p>
    </div>
  );
};

// ─── component ────────────────────────────────────────────────────────────

const Reports = () => {
  const [summary, setSummary] = useState({
    totalOrders: 0, totalRevenue: 0, totalQuantity: 0, profit: 0,
  });
  const [trend, setTrend] = useState([]);
  const [insight, setInsight] = useState("");
  const [activeCard, setActiveCard] = useState(null);
  const [visibleCards, setVisibleCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });

  const filtersRef = useRef(filters);
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = filtersRef.current;
      const [s, t, i] = await Promise.all([
        getSalesSummary(params),
        getSalesTrend(params),
        getInsights(),
      ]);
      setSummary(s?.data?.data ?? {});
      setTrend(t?.data?.data ?? []);
      setInsight(i?.data?.data ?? "No insights available.");
    } catch {
      setError("Failed to load report data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const timers = ["orders", "revenue", "profit"].map((key, i) =>
      setTimeout(() => setVisibleCards((p) => [...p, key]), 200 + i * 150)
    );
    return () => timers.forEach(clearTimeout);
  }, [loadData]);

  const cards = [
    {
      key: "orders",
      icon: <FiShoppingCart size={17} />,
      label: "Total Orders",
      value: summary.totalOrders,
      display: summary.totalOrders,
      suffix: "orders",
      color: "#6378ff",
      colorDim: "rgba(99, 120, 255, 0.12)",
    },
    {
      key: "revenue",
      icon: <TbCurrencyRupee size={17} />,
      label: "Revenue",
      value: summary.totalRevenue,
      display: `₹${fmtINR(summary.totalRevenue)}`,
      suffix: "total revenue",
      color: "#f0a855",
      colorDim: "rgba(240, 168, 85, 0.12)",
    },
    {
      key: "profit",
      icon: <FiTrendingUp size={17} />,
      label: "Net Profit",
      value: summary.profit,
      display: `₹${fmtINR(summary.profit)}`,
      suffix: "net profit",
      color: "#4ade80",
      colorDim: "rgba(74, 222, 128, 0.12)",
    },
  ];

  return (
    <div className={styles.page}>

      {/* ── HEADER ── */}
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <div className={styles.titleIcon}>
            <FiTrendingUp size={19} />
          </div>
          <div>
            <h2 className={styles.title}>Reports</h2>
            <p className={styles.subtitle}>Sales performance overview</p>
          </div>
        </div>

        <div className={styles.headerRight}>
          {/* Date filters */}
          <div className={styles.filterRow}>
            <div className={styles.dateField}>
              <FiCalendar size={12} className={styles.dateIcon} />
              <input
                type="date"
                className={styles.dateInput}
                value={filters.startDate}
                onChange={(e) => setFilters((p) => ({ ...p, startDate: e.target.value }))}
              />
            </div>
            <span className={styles.dateSep}>→</span>
            <div className={styles.dateField}>
              <FiCalendar size={12} className={styles.dateIcon} />
              <input
                type="date"
                className={styles.dateInput}
                value={filters.endDate}
                onChange={(e) => setFilters((p) => ({ ...p, endDate: e.target.value }))}
              />
            </div>
            <motion.button
              className={styles.applyBtn}
              onClick={loadData}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {isLoading ? "Loading…" : "Apply"}
            </motion.button>
          </div>

          {/* Refresh */}
          <motion.button
            className={styles.refreshBtn}
            onClick={loadData}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRefreshCw size={14} className={isLoading ? styles.spin : ""} />
          </motion.button>
        </div>
      </div>

      {/* ── ERROR ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            className={styles.errorBanner}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── KPI CARDS ── */}
      <div className={styles.kpiRow}>
        {cards.map((card, i) => {
          const isActive = activeCard === card.key;
          const visible = visibleCards.includes(card.key);
          return (
            <motion.button
              key={card.key}
              className={`${styles.kpiCard} ${isActive ? styles.kpiActive : ""}`}
              onClick={() => setActiveCard(isActive ? null : card.key)}
              initial={{ opacity: 0, y: 16 }}
              animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ delay: i * 0.1, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2 }}
              style={{ "--card-color": card.color, "--card-color-dim": card.colorDim }}
            >
              <div className={styles.kpiTop}>
                <div className={styles.kpiIconWrap} style={{ background: card.colorDim, border: `1px solid ${card.color}30` }}>
                  <span style={{ color: card.color }}>{card.icon}</span>
                </div>
                <span className={styles.kpiLabel}>{card.label}</span>
              </div>
              <div className={styles.kpiValue}>
                {isLoading ? (
                  <div className={styles.skeleton} style={{ width: "70%", height: 26 }} />
                ) : (
                  card.display
                )}
              </div>
              <div className={styles.kpiFooter}>
                <span className={styles.kpiSuffix}>{card.suffix}</span>
                <div className={styles.kpiBar}>
                  <div className={styles.kpiFill} style={{ background: card.color, width: isActive ? "100%" : "60%" }} />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ── CHART ── */}
      <motion.div
        className={styles.chartCard}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>Sales Trend</h3>
            <p className={styles.chartSub}>Revenue over time</p>
          </div>
          <div className={styles.legendDot}>
            <span className={styles.dotGold} />
            <span className={styles.legendLabel}>Revenue</span>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.skeleton} style={{ height: 300, borderRadius: 10 }} />
        ) : trend.length === 0 ? (
          <div className={styles.emptyChart}>
            <span className={styles.emptyIcon}>📊</span>
            <p>No data for selected period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f0a855" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#f0a855" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "rgba(238,240,247,0.35)", fontFamily: "DM Sans" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `₹${fmtINR(v)}`}
                tick={{ fontSize: 10.5, fill: "rgba(238,240,247,0.3)", fontFamily: "DM Sans" }}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(240,168,85,0.2)", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="totalSales"
                stroke="#f0a855"
                strokeWidth={2.5}
                fill="url(#goldGrad)"
                dot={false}
                activeDot={{ r: 5, fill: "#f0a855", stroke: "#0b0d14", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* ── AI INSIGHTS ── */}
      <motion.div
        className={styles.insightCard}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.insightHeader}>
          <div className={styles.insightIconWrap}>
            <FiZap size={14} />
          </div>
          <div>
            <h3 className={styles.insightTitle}>AI Insights</h3>
            <p className={styles.insightSub}>Powered by analysis</p>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.insightSkeleton}>
            <div className={styles.skeleton} style={{ height: 13, width: "90%" }} />
            <div className={styles.skeleton} style={{ height: 13, width: "75%", marginTop: 8 }} />
            <div className={styles.skeleton} style={{ height: 13, width: "55%", marginTop: 8 }} />
          </div>
        ) : (
          <p className={styles.insightText}>{insight}</p>
        )}
      </motion.div>

    </div>
  );
};

export default Reports;