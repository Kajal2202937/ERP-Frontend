import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  Component,
} from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import styles from "./Dashboard.module.css";
import { getDashboardSummary } from "../../services/ReportService";
import { formatCurrency, formatPercent, getDelta } from "../../../utils/format";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import InsightsPanel from "../../components/AI/InsightsPanel";
import AIChat from "../../components/AI/AIChat";
import DateRangePicker from "../../components/common/DateRangePicker";
import { AnimatePresence, motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Cpu,
  ShoppingCart,
  Package,
  BarChart2,
  AlertTriangle,
  Ticket,
} from "lucide-react";

import { initSocket } from "../../services/socket";
import { ORDER_EVENTS } from "../../services/socketEvents";

const PALETTE = ["#6c74f0", "#3ecf8e", "#f0a855", "#f87171", "#4da8f5"];
const AUTO_REFRESH_MS = 60_000;
const REFRESH_COOLDOWN_MS = 30_000;

const INITIAL_SALES = {
  totalOrders: 0,
  totalQuantity: 0,
  totalRevenue: 0,
  profit: 0,
  profitMargin: 0,
};
const INITIAL_INVENTORY = { totalStock: 0, lowStock: 0, activeItems: 0 };

class ChartErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("[ChartErrorBoundary]", error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.chartError} role="alert">
          Chart unavailable — data may be invalid
        </div>
      );
    }
    return this.props.children;
  }
}

const CustomTooltip = ({ active, payload, label, currency = false }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((p, i) => (
        <p
          key={i}
          className={styles.tooltipValue}
          style={{ color: p.color || "var(--accent)" }}
        >
          {currency ? formatCurrency(p.value) : p.value.toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
};

const DeltaBadge = ({ delta }) => {
  if (!delta) return null;
  const Icon =
    delta.direction === "up"
      ? TrendingUp
      : delta.direction === "down"
        ? TrendingDown
        : Minus;
  return (
    <span
      className={`${styles.delta} ${delta.isPositive ? styles.deltaUp : styles.deltaDown}`}
      aria-label={`${delta.isPositive ? "Up" : "Down"} ${Math.abs(delta.pct).toFixed(1)}% vs previous period`}
    >
      <Icon size={10} aria-hidden="true" strokeWidth={2.5} />
      {delta.label}
    </span>
  );
};

const StatCard = ({ title, value, sub, variant, icon: Icon, delta }) => (
  <div
    className={[
      styles.card,
      variant === "danger" ? styles.cardDanger : "",
      variant === "success" ? styles.cardSuccess : "",
    ]
      .filter(Boolean)
      .join(" ")}
    role="region"
    aria-label={`${title}: ${typeof value === "number" ? value.toLocaleString("en-IN") : value}`}
  >
    <div className={styles.cardHeader}>
      <h3 className={styles.cardTitle}>{title}</h3>
      {Icon && (
        <span className={styles.cardIcon} aria-hidden="true">
          <Icon size={13} strokeWidth={1.8} />
        </span>
      )}
    </div>
    <p className={styles.cardValue}>
      {typeof value === "number" ? value.toLocaleString("en-IN") : value}
    </p>
    <div className={styles.cardFooter}>
      {sub && <small className={styles.cardSub}>{sub}</small>}
      <DeltaBadge delta={delta} />
    </div>
  </div>
);

const Skeleton = () => (
  <>
    <div className={styles.skeletonGrid}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard} aria-hidden="true" />
      ))}
    </div>
    <div className={styles.skeletonChart} aria-hidden="true" />
    <div className={styles.skeletonChart} aria-hidden="true" />
  </>
);

const axisStyle = {
  fontSize: 11,
  fill: "var(--text3)",
  fontFamily: "var(--font-mono)",
};
const gridProps = { strokeDasharray: "3 3", stroke: "var(--border)" };

const Dashboard = () => {
  const { user, socketReady } = useAuth();
  const navigate = useNavigate();

  const [aiOpen, setAiOpen] = useState(false);
  const [range, setRange] = useState({ from: null, to: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(true);
  const [error, setError] = useState(null);

  const [dashData, setDashData] = useState({
    sales: INITIAL_SALES,
    prevSales: null,
    trend: [],
    topProducts: [],
    inventory: INITIAL_INVENTORY,
    topSuppliers: [],
    openTickets: 0,
  });

  const abortRef = useRef(null);
  const cooldownRef = useRef(null);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const fetchDashboard = useCallback(
    async (isManual = false) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      isManual ? setRefreshing(true) : setLoading(true);
      setError(null);

      try {
        const params = {};
        if (range.from) params.from = range.from;
        if (range.to) params.to = range.to;

        const res = await getDashboardSummary(params);
        if (abortRef.current.signal.aborted) return;

        if (!res.success || !res.data) {
          setError("Failed to load dashboard data");
          return;
        }

        const d = res.data;
        setDashData({
          sales: d.sales || INITIAL_SALES,
          prevSales: d.prevSales || null,
          trend: (d.trend || []).filter((t) => t.total > 0),
          topProducts: (d.topProducts || [])
            .map((p) => ({ name: p.name, sold: p.totalSold || 0 }))
            .filter((p) => p.sold > 0),
          inventory: d.inventory || INITIAL_INVENTORY,
          topSuppliers: (d.topSuppliers || []).sort(
            (a, b) => b.value - a.value,
          ),
          openTickets: d.openTickets || 0,
        });
      } catch (err) {
        if (err?.name === "AbortError" || err?.name === "CanceledError") return;
        setError("Failed to load dashboard data");
      } finally {
        if (!abortRef.current.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [range],
  );

  useEffect(() => {
    fetchDashboard();
    return () => abortRef.current?.abort();
  }, [fetchDashboard]);

  useEffect(() => {
    const id = setInterval(() => fetchDashboard(), AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchDashboard]);

  useEffect(() => {
    if (!socketReady) return;

    const socket = initSocket();
    if (!socket) return;

    const handleOrderChange = () => {
      fetchDashboard(false);
    };

    socket.on(ORDER_EVENTS.ORDER_CREATED, handleOrderChange);
    socket.on(ORDER_EVENTS.ORDER_UPDATED, handleOrderChange);
    socket.on(ORDER_EVENTS.ORDER_DELETED, handleOrderChange);

    return () => {
      socket.off(ORDER_EVENTS.ORDER_CREATED, handleOrderChange);
      socket.off(ORDER_EVENTS.ORDER_UPDATED, handleOrderChange);
      socket.off(ORDER_EVENTS.ORDER_DELETED, handleOrderChange);
    };
  }, [fetchDashboard, socketReady]);

  const handleManualRefresh = useCallback(() => {
    if (!canRefresh) return;
    setCanRefresh(false);
    fetchDashboard(true);
    cooldownRef.current = setTimeout(
      () => setCanRefresh(true),
      REFRESH_COOLDOWN_MS,
    );
  }, [canRefresh, fetchDashboard]);

  useEffect(() => () => clearTimeout(cooldownRef.current), []);

  const deltas = useMemo(() => {
    if (!dashData.prevSales) return {};
    return {
      revenue: getDelta(
        dashData.sales.totalRevenue,
        dashData.prevSales.totalRevenue,
      ),
      orders: getDelta(
        dashData.sales.totalOrders,
        dashData.prevSales.totalOrders,
      ),
      profit: getDelta(dashData.sales.profit, dashData.prevSales.profit),
    };
  }, [dashData.sales, dashData.prevSales]);

  const aiContext = useMemo(
    () => ({
      page: "dashboard",
      totalRevenue: dashData.sales.totalRevenue,
      totalOrders: dashData.sales.totalOrders,
      profit: dashData.sales.profit,
      profitMargin: dashData.sales.profitMargin,
      lowStock: dashData.inventory.lowStock,
      openTickets: dashData.openTickets,
      dateRange: range,
    }),
    [dashData.sales, dashData.inventory.lowStock, dashData.openTickets, range],
  );

  const totalUnitsSold = useMemo(
    () => dashData.topProducts.reduce((s, p) => s + p.sold, 0),
    [dashData.topProducts],
  );

  return (
    <div className={styles.content}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome back, <span>{user?.name || "User"}</span> — {today}
          </p>
        </div>

        <div className={styles.headerActions}>
          <DateRangePicker value={range} onChange={setRange} />
          <button
            type="button"
            className={`${styles.refreshBtn} ${!canRefresh ? styles.refreshBtnDisabled : ""}`}
            onClick={handleManualRefresh}
            disabled={!canRefresh || refreshing}
            aria-label="Refresh dashboard data"
            title={
              !canRefresh ? "Please wait 30s between refreshes" : "Refresh"
            }
          >
            <RefreshCw
              size={13}
              className={refreshing ? styles.spinning : ""}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error} role="alert">
          <AlertTriangle size={14} aria-hidden="true" />
          {error}
        </div>
      )}

      {loading && <Skeleton />}

      {!loading && (
        <>
          {/* ── KPI cards ── */}
          <p className={styles.sectionTitle}>Overview</p>
          <div className={styles.cards}>
            <StatCard
              title="Total Orders"
              value={dashData.sales.totalOrders}
              icon={ShoppingCart}
              delta={deltas.orders}
            />
            <StatCard
              title="Units Sold"
              value={dashData.sales.totalQuantity}
              icon={Package}
            />
            <StatCard
              title="Revenue"
              value={formatCurrency(dashData.sales.totalRevenue)}
              icon={BarChart2}
              delta={deltas.revenue}
            />
            <StatCard
              title="Profit"
              value={formatCurrency(dashData.sales.profit)}
              variant={dashData.sales.profit >= 0 ? "success" : "danger"}
              sub={`${Number(dashData.sales.profitMargin ?? 0).toFixed(2)}% margin`}
              delta={deltas.profit}
            />
            <StatCard
              title="Total Stock"
              value={dashData.inventory.totalStock}
              icon={Package}
            />
            <StatCard
              title="Low Stock"
              value={dashData.inventory.lowStock}
              variant="danger"
              sub="Items below threshold"
              icon={AlertTriangle}
            />
            <StatCard
              title="Active Items"
              value={dashData.inventory.activeItems}
              variant="success"
            />
            <StatCard
              title="Open Tickets"
              value={dashData.openTickets}
              icon={Ticket}
              sub={
                dashData.openTickets === 0
                  ? "All resolved"
                  : "Awaiting resolution"
              }
              variant={dashData.openTickets > 0 ? "danger" : "success"}
            />
          </div>

          <InsightsPanel analyticsData={aiContext} />

          {/* ── Top Suppliers ── */}
          {dashData.topSuppliers.length > 0 && (
            <>
              <p className={styles.sectionTitle}>Top Suppliers</p>
              <div className={styles.cards}>
                {dashData.topSuppliers.map((s, i) => (
                  <div
                    key={s.name}
                    className={styles.card}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(
                        `/products?supplier=${encodeURIComponent(s.name)}`,
                      )
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      navigate(
                        `/products?supplier=${encodeURIComponent(s.name)}`,
                      )
                    }
                    aria-label={`Supplier ${s.name}: ${formatCurrency(s.value)}`}
                  >
                    <h3 className={styles.cardTitle}>
                      #{i + 1} {s.name}
                    </h3>
                    <p className={styles.cardValue}>
                      {formatCurrency(s.value)}
                    </p>
                    <small className={styles.cardSub}>
                      {s.quantity.toLocaleString("en-IN")} items
                    </small>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Charts row ── */}
          <div className={styles.chartsRow}>
            {/* Sales Trend */}
            <div className={styles.chartBox}>
              <div className={styles.chartHeader}>
                <h3>Sales Trend</h3>
              </div>
              {dashData.trend.length === 0 ? (
                <p className={styles.noData}>No sales data for this period</p>
              ) : (
                <ChartErrorBoundary>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={dashData.trend}>
                      <defs>
                        <linearGradient
                          id="areaGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--accent)"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--accent)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid {...gridProps} />
                      <XAxis
                        dataKey="date"
                        tick={axisStyle}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={axisStyle}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={formatCurrency}
                        width={72}
                      />
                      <Tooltip
                        content={<CustomTooltip currency />}
                        cursor={{
                          stroke: "var(--accent)",
                          strokeWidth: 1,
                          strokeDasharray: "4 4",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="var(--accent)"
                        strokeWidth={2}
                        fill="url(#areaGrad)"
                        dot={false}
                        activeDot={{
                          r: 4,
                          fill: "var(--accent)",
                          strokeWidth: 0,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartErrorBoundary>
              )}
            </div>

            {/* Product Distribution */}
            <div className={styles.chartBox}>
              <div className={styles.chartHeader}>
                <h3>Product Distribution</h3>
              </div>
              {dashData.topProducts.length === 0 ? (
                <p className={styles.noData}>No product data for this period</p>
              ) : (
                <ChartErrorBoundary>
                  <div className={styles.pieWrap}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={dashData.topProducts}
                          dataKey="sold"
                          nameKey="name"
                          innerRadius={52}
                          outerRadius={88}
                          paddingAngle={2}
                        >
                          {dashData.topProducts.map((_, i) => (
                            <Cell
                              key={i}
                              fill={PALETTE[i % PALETTE.length]}
                              strokeWidth={0}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className={styles.pieCenter} aria-hidden="true">
                      <span className={styles.pieCenterValue}>
                        {totalUnitsSold.toLocaleString("en-IN")}
                      </span>
                      <span className={styles.pieCenterLabel}>units</span>
                    </div>
                  </div>
                  <div className={styles.pieLegend}>
                    {dashData.topProducts.slice(0, 5).map((p, i) => (
                      <span key={i} className={styles.pieLegendItem}>
                        <span
                          className={styles.pieLegendDot}
                          style={{ background: PALETTE[i % PALETTE.length] }}
                        />
                        {p.name}
                      </span>
                    ))}
                  </div>
                </ChartErrorBoundary>
              )}
            </div>
          </div>

          {/* ── Top Products bar ── */}
          {dashData.topProducts.length > 0 && (
            <div className={styles.chartBox}>
              <div className={styles.chartHeader}>
                <h3>Top Products by Units Sold</h3>
              </div>
              <ChartErrorBoundary>
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(200, dashData.topProducts.length * 44 + 60)}
                >
                  <BarChart data={dashData.topProducts} layout="vertical">
                    <CartesianGrid {...gridProps} horizontal={false} />
                    <XAxis
                      type="number"
                      tick={axisStyle}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={axisStyle}
                      axisLine={false}
                      tickLine={false}
                      width={130}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "var(--accent-soft)" }}
                    />
                    <Bar
                      dataKey="sold"
                      fill="var(--accent)"
                      radius={[0, 6, 6, 0]}
                      maxBarSize={22}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartErrorBoundary>
            </div>
          )}

          {/* ── Supplier Value Breakdown ── */}
          {dashData.topSuppliers.length > 0 && (
            <div className={styles.chartBox}>
              <div className={styles.chartHeader}>
                <h3>Supplier Value Breakdown</h3>
              </div>
              <ChartErrorBoundary>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={dashData.topSuppliers}>
                    <CartesianGrid {...gridProps} />
                    <XAxis
                      dataKey="name"
                      tick={axisStyle}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={axisStyle}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={formatCurrency}
                      width={72}
                    />
                    <Tooltip
                      content={<CustomTooltip currency />}
                      cursor={{ fill: "var(--accent-soft)" }}
                    />
                    <Bar
                      dataKey="value"
                      fill="var(--blue)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartErrorBoundary>
            </div>
          )}
        </>
      )}

      {/* ── AI Float Button ── */}
      <button
        type="button"
        className={styles.aiFloatBtn}
        onClick={() => setAiOpen((o) => !o)}
        aria-label={aiOpen ? "Close AI Assistant" : "Open AI Assistant"}
        aria-expanded={aiOpen}
      >
        <Cpu size={18} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {aiOpen && (
          <motion.div
            className={styles.aiDrawer}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="AI Assistant"
            aria-modal="true"
          >
            <AIChat context={aiContext} onClose={() => setAiOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
