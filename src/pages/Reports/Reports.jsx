import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  ShoppingCart,
  TrendingUp,
  RefreshCw,
  Zap,
  FileText,
  IndianRupee,
  AlertTriangle,
} from "lucide-react";
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
import ExportButton from "../../components/common/ExportButton";
import InsightsPanel from "../../components/AI/InsightsPanel";
import DateRangePicker from "../../components/common/DateRangePicker";
import { formatCurrency } from "../../../utils/format";
import { useDebounce } from "../../hooks/useDebounce";
import useAuth from "../../hooks/useAuth";

import { initSocket } from "../../services/socket";
import { ORDER_EVENTS } from "../../services/socketEvents";

const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d)) return date;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const generateFallbackInsight = (summary = {}) => {
  const revenue = summary.totalRevenue || 0;
  const orders = summary.totalOrders || 0;
  if (!orders && !revenue) return "No sufficient data available for insights.";
  let msg = `You generated ${formatCurrency(revenue)} from ${orders} orders.`;
  if (orders > 50) msg += "\nStrong order volume detected.";
  else if (orders > 0) msg += "\nModerate activity detected.";
  if (revenue > 100000) msg += "\nRevenue performance is strong.";
  return msg;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p>{formatDate(label)}</p>
      <span>
        <IndianRupee size={12} aria-hidden="true" />
        {Number(payload?.[0]?.value || 0).toLocaleString("en-IN")}
      </span>
    </div>
  );
};

const Reports = () => {
  const { socketReady } = useAuth();
  const [data, setData] = useState({ summary: {}, trend: [], insight: "" });

  const [range, setRange] = useState({ from: "", to: "" });
  const [ui, setUI] = useState({
    loading: false,
    error: null,
    activeCard: null,
  });

  const debouncedRange = useDebounce(range, 500);
  const abortRef = useRef(null);

  const rangeRef = useRef(debouncedRange);
  useEffect(() => {
    rangeRef.current = debouncedRange;
  }, [debouncedRange]);

  const fetchReports = useCallback(async (rangeArg) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setUI((p) => ({ ...p, loading: true, error: null }));

    try {
      const filters = {
        startDate: rangeArg?.from || undefined,
        endDate: rangeArg?.to || undefined,
      };

      const [summaryRes, trendRes, insightRes] = await Promise.allSettled([
        getSalesSummary(filters),
        getSalesTrend(filters),
        getInsights(),
      ]);

      if (abortRef.current.signal.aborted) return;

      const summary =
        summaryRes.status === "fulfilled" ? (summaryRes.value?.data ?? {}) : {};
      const trend =
        trendRes.status === "fulfilled" ? (trendRes.value?.data ?? []) : [];
      const rawInsight =
        insightRes.status === "fulfilled"
          ? (insightRes.value?.data ?? insightRes.value ?? null)
          : null;
      const insight =
        typeof rawInsight === "string" && rawInsight.trim()
          ? rawInsight
          : generateFallbackInsight(summary);

      setData({ summary, trend, insight });
    } catch (err) {
      if (err?.name === "AbortError" || err?.name === "CanceledError") return;
      setUI((p) => ({ ...p, error: "Unable to load reports" }));
    } finally {
      if (!abortRef.current.signal.aborted) {
        setUI((p) => ({ ...p, loading: false }));
      }
    }
  }, []);

  useEffect(() => {
    fetchReports(debouncedRange);
    return () => abortRef.current?.abort();
  }, [debouncedRange, fetchReports]);

  useEffect(() => {
    if (!socketReady) return;

    const socket = initSocket();
    if (!socket) return;

    const handleOrderChange = () => {
      fetchReports(rangeRef.current);
    };

    socket.on(ORDER_EVENTS.ORDER_CREATED, handleOrderChange);
    socket.on(ORDER_EVENTS.ORDER_UPDATED, handleOrderChange);
    socket.on(ORDER_EVENTS.ORDER_DELETED, handleOrderChange);

    return () => {
      socket.off(ORDER_EVENTS.ORDER_CREATED, handleOrderChange);
      socket.off(ORDER_EVENTS.ORDER_UPDATED, handleOrderChange);
      socket.off(ORDER_EVENTS.ORDER_DELETED, handleOrderChange);
    };
  }, [fetchReports, socketReady]);

  const cards = useMemo(
    () => [
      {
        key: "orders",
        label: "Orders",
        value: data.summary?.totalOrders || 0,
        Icon: ShoppingCart,
        color: "var(--accent)",
      },
      {
        key: "revenue",
        label: "Revenue",
        value: formatCurrency(data.summary?.totalRevenue),
        Icon: IndianRupee,
        color: "var(--amber)",
      },
      {
        key: "profit",
        label: "Profit",
        value: formatCurrency(data.summary?.profit || 0),
        Icon: TrendingUp,
        color: (data.summary?.profit || 0) >= 0 ? "var(--green)" : "var(--red)",
      },
      {
        key: "margin",
        label: "Profit Margin",
        value: `${Number(data.summary?.profitMargin || 0).toFixed(2)}%`,
        Icon: TrendingUp,
        color:
          (data.summary?.profitMargin || 0) >= 0
            ? "var(--green)"
            : "var(--red)",
      },
    ],
    [data.summary],
  );

  const analyticsData = useMemo(
    () => ({
      totalRevenue: data.summary?.totalRevenue,
      totalOrders: data.summary?.totalOrders,
      profit: data.summary?.profit,
      profitMargin: data.summary?.profitMargin,
      startDate: range.from,
      endDate: range.to,
    }),
    [data.summary, range],
  );

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Reports</h2>
          <p className={styles.subtitle}>
            Analytics &amp; performance overview
          </p>
        </div>

        <div className={styles.actions}>
          <DateRangePicker value={range} onChange={setRange} />

          <div className={styles.exportWrapper}>
            <ExportButton
              reportType="sales-report"
              filters={{ startDate: range.from, endDate: range.to }}
              disableExcel
            />
          </div>

          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => fetchReports(range)}
            disabled={ui.loading}
            aria-label="Refresh reports"
          >
            <RefreshCw
              size={15}
              className={ui.loading ? styles.spinning : undefined}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {ui.error && (
          <motion.div
            className={styles.error}
            role="alert"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AlertTriangle size={14} aria-hidden="true" />
            {ui.error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── KPI Cards ── */}
      <div className={styles.kpiGrid} role="region" aria-label="KPI summary">
        {cards.map((card) => {
          const active = ui.activeCard === card.key;
          return (
            <motion.div
              key={card.key}
              className={`${styles.card} ${active ? styles.active : ""}`}
              onClick={() =>
                setUI((p) => ({ ...p, activeCard: active ? null : card.key }))
              }
              whileHover={{ scale: 1.03 }}
              role="button"
              tabIndex={0}
              aria-pressed={active}
              aria-label={`${card.label}: ${card.value}`}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                setUI((p) => ({ ...p, activeCard: active ? null : card.key }))
              }
            >
              <div className={styles.cardTop}>
                <card.Icon
                  size={16}
                  style={{ color: card.color }}
                  aria-hidden="true"
                />
                <p>{card.label}</p>
              </div>
              {ui.loading ? (
                <div className={styles.cardSkeleton} aria-hidden="true" />
              ) : (
                <h3 style={{ color: card.color }}>{card.value}</h3>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── Sales Trend Chart ── */}
      <div className={styles.chartBox}>
        <h3>Sales Trend</h3>
        {ui.loading ? (
          <div className={styles.loader} aria-hidden="true" />
        ) : data.trend.length === 0 ? (
          <div className={styles.empty} role="status">
            <FileText size={20} aria-hidden="true" />
            <span>No data for this period</span>
          </div>
        ) : (
          <div role="img" aria-label="Sales trend area chart">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={data.trend}
                margin={{ top: 10, right: 16, bottom: 0, left: 16 }}
              >
                <defs>
                  <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--amber)"
                      stopOpacity={0.28}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--amber)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  height={40}
                  tick={{
                    fontSize: 11,
                    fill: "var(--text3)",
                    fontFamily: "var(--font-mono)",
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={formatCurrency}
                  width={76}
                  tick={{
                    fontSize: 11,
                    fill: "var(--text3)",
                    fontFamily: "var(--font-mono)",
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: "var(--amber)",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="var(--amber)"
                  strokeWidth={2}
                  fill="url(#reportGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "var(--amber)", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── AI Insights ── */}
      <InsightsPanel analyticsData={analyticsData} />

      {/* ── Fallback Insight ── */}
      {data.insight && (
        <div className={styles.insight}>
          <div className={styles.insightHeader}>
            <Zap
              size={15}
              style={{ color: "var(--amber)" }}
              aria-hidden="true"
            />
            <h4>Quick Insight</h4>
          </div>
          <p className={styles.insightText}>
            <TrendingUp
              size={14}
              className={styles.insightIcon}
              aria-hidden="true"
            />
            <span className={styles.insightContent}>{data.insight}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
