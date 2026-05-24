import {
  FiShoppingCart,
  FiTrendingUp,
  FiRefreshCw,
  FiZap,
  FiFileText,
} from "react-icons/fi";
import { TbCurrencyRupee } from "react-icons/tb";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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

// ─── Formatters (module-level — never recreated) ──────────────────────────────

const formatINR = (num) => Number(num || 0).toLocaleString("en-IN");

const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d)) return date;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

// FIX 1: Removed the broken modulo checks. The old `value % 10000000 === 0`
//         was almost never true (e.g. 92106500 % 10000000 = 2106500 ≠ 0).
//         Use a simple threshold-based formatter with a consistent 1-decimal rule.
const formatCompactINR = (value) => {
  const n = Number(value) || 0;
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n}`;
};

// FIX 2: Moved out of the component so it isn't recreated on every render.
const generateFallbackInsight = (summary = {}) => {
  const revenue = summary.totalRevenue || 0;
  const orders = summary.totalOrders || 0;

  if (!orders && !revenue) return "No sufficient data available for insights.";

  let msg = `You generated ₹${formatINR(revenue)} from ${orders} orders. `;

  if (orders > 50) msg += "Strong order volume detected.";
  else if (orders > 0) msg += "Moderate activity detected.";
  if (revenue > 100000) msg += " Revenue performance is strong.";

  return msg.split(". ").join(".\n");
};

// FIX 3: Debounce helper — prevents an API call on every keystroke in the
//         date inputs. 500 ms feels instant but avoids mid-type fetches.
function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

const Reports = () => {
  const [data, setData] = useState({ summary: {}, trend: [], insight: "" });

  const [filters, setFilters] = useState({ startDate: "", endDate: "" });

  const [ui, setUI] = useState({
    loading: false,
    error: null,
    activeCard: null,
  });

  // FIX 4: Validate date range before accepting it. If endDate precedes
  //         startDate, set an error and skip the fetch.
  const [dateError, setDateError] = useState("");

  // FIX 5: Debounce filters so typing in a date field doesn't fire a new
  //         request on every character.
  const debouncedFilters = useDebounce(filters, 500);

  // FIX 6: Abort controller ref — cancels in-flight requests on unmount.
  const abortRef = useRef(null);

  const handleDateChange = (field, value) => {
    setFilters((prev) => {
      const next = { ...prev, [field]: value };

      // Validate: both dates present and start > end
      if (next.startDate && next.endDate && next.startDate > next.endDate) {
        setDateError("Start date must be before end date.");
      } else {
        setDateError("");
      }

      return next;
    });
  };

  const fetchReports = useCallback(
    async (filtersArg) => {
      // Skip if dates are invalid
      if (dateError) return;

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setUI((p) => ({ ...p, loading: true, error: null }));

      try {
        const [summaryRes, trendRes, insightRes] = await Promise.allSettled([
          getSalesSummary(filtersArg),
          getSalesTrend(filtersArg),
          getInsights(),
        ]);

        if (abortRef.current.signal.aborted) return;

        const summary =
          summaryRes.status === "fulfilled"
            ? (summaryRes.value?.data ?? {})
            : {};

        const trend =
          trendRes.status === "fulfilled" ? (trendRes.value?.data ?? []) : [];

        // FIX 7: Simplified insight resolution — no need to probe every sub-field.
        //         getInsights() resolves to either { data: string } or throws.
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
        console.error("[Reports] fetchReports error:", err);
        setUI((p) => ({ ...p, error: "Unable to load reports" }));
      } finally {
        if (!abortRef.current.signal.aborted) {
          setUI((p) => ({ ...p, loading: false }));
        }
      }
    },
    [dateError],
  );

  // Re-fetch when debounced filters change (not on every keystroke).
  useEffect(() => {
    fetchReports(debouncedFilters);
    return () => abortRef.current?.abort();
  }, [debouncedFilters, fetchReports]);

  // FIX 8: Memoize the cards array — it only changes when summary data changes.
  const cards = useMemo(
    () => [
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
        color: (data.summary?.profit || 0) >= 0 ? "#22c55e" : "#ef4444",
      },
      {
        key: "margin",
        label: "Profit Margin",
        // FIX 9: toFixed(2) for margin — prevents ugly floats like -178.9734…
        value: `${Number(data.summary?.profitMargin || 0).toFixed(2)}%`,
        icon: <FiTrendingUp />,
        color: (data.summary?.profitMargin || 0) >= 0 ? "#10b981" : "#ef4444",
      },
    ],
    [data.summary],
  );

  // FIX 10: Memoize analyticsData so InsightsPanel doesn't re-render when
  //          unrelated state (ui.activeCard, dateError, etc.) changes.
  const analyticsData = useMemo(
    () => ({
      totalRevenue: data.summary?.totalRevenue,
      totalOrders: data.summary?.totalOrders,
      profit: data.summary?.profit,
      profitMargin: data.summary?.profitMargin,
      startDate: filters.startDate,
      endDate: filters.endDate,
    }),
    [data.summary, filters.startDate, filters.endDate],
  );

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h2>Reports Dashboard</h2>
          <p>Analytics &amp; performance overview</p>
        </div>

        <div className={styles.actions}>
          <div className={styles.filters}>
            <input
              type="date"
              value={filters.startDate}
              max={filters.endDate || undefined}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
            />
            <input
              type="date"
              value={filters.endDate}
              min={filters.startDate || undefined}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
            />
          </div>

          {/* FIX 11: Show date validation error inline instead of silently
                       sending a bad request to the API. */}
          {dateError && (
            <p className={styles.dateError} role="alert">
              {dateError}
            </p>
          )}

          <div className={styles.exportWrapper}>
            <ExportButton
              reportType="sales-report"
              filters={filters}
              disableExcel
            />
          </div>

          <button
            className={styles.refreshBtn}
            onClick={() => fetchReports(filters)}
            disabled={ui.loading}
            aria-label="Refresh reports"
          >
            <FiRefreshCw className={ui.loading ? styles.spinning : undefined} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {ui.error && (
          <motion.div
            className={styles.error}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="alert"
          >
            {ui.error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI CARDS */}
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
              {/* FIX 12: Show a proper pulse skeleton div instead of bare "..." */}
              {ui.loading ? (
                <div className={styles.cardSkeleton} aria-hidden />
              ) : (
                <h3>{card.value}</h3>
              )}
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
              <XAxis dataKey="date" tickFormatter={formatDate} />
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

      {/* AI PANEL */}
      <InsightsPanel analyticsData={analyticsData} />

      {/* FALLBACK INSIGHT */}
      {data.insight && (
        <div className={styles.insight}>
          <div className={styles.insightHeader}>
            <FiZap />
            <h4>Quick Insight</h4>
          </div>
          <p className={styles.insightText}>
            <FiTrendingUp className={styles.insightIcon} />
            <span className={styles.insightContent}>{data.insight}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
