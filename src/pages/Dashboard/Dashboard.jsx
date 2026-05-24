import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import API from "../../services/api";
import styles from "./Dashboard.module.css";
import {
  getSalesSummary,
  getSalesTrend,
  getTopProducts,
} from "../../services/ReportService";
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
import { FiCpu } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

const PALETTE = ["#6c74f0", "#3ecf8e", "#f0a855", "#f87171", "#4da8f5"];

const INITIAL_STATS = {
  totalOrders: 0,
  totalQuantity: 0,
  totalRevenue: 0,
  profit: 0,
  profitMargin: 0,
};

const INITIAL_INVENTORY = { totalStock: 0, lowStock: 0, activeItems: 0 };
const INITIAL_TICKETS = { total: 0, open: 0 };

const formatCurrency = (num = 0) => {
  if (!num) return "₹ 0";
  if (num >= 10_000_000) return `₹ ${(num / 10_000_000).toFixed(1)} Cr`;
  if (num >= 100_000) return `₹ ${(num / 100_000).toFixed(1)} L`;
  return `₹ ${num.toLocaleString("en-IN")}`;
};

const CustomTooltip = ({ active, payload, label, currency = false }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--surface2)",
        border: "1px solid var(--border2)",
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6 }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <p
          key={i}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: p.color || "var(--accent)",
          }}
        >
          {currency ? formatCurrency(p.value) : p.value.toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ title, value, sub, variant }) => (
  <div
    className={[
      styles.card,
      variant === "danger" ? styles.cardDanger : "",
      variant === "success" ? styles.cardSuccess : "",
    ]
      .filter(Boolean)
      .join(" ")}
  >
    <h3>{title}</h3>
    <p>{typeof value === "number" ? value.toLocaleString("en-IN") : value}</p>
    {sub && <small>{sub}</small>}
  </div>
);

const Skeleton = () => (
  <>
    <div className={styles.skeletonGrid}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard} />
      ))}
    </div>
    <div className={styles.skeletonChart} />
    <div className={styles.skeletonChart} />
  </>
);

const axisStyle = {
  fontSize: 11,
  fill: "var(--text3)",
  fontFamily: "var(--font-mono)",
};
const gridProps = { strokeDasharray: "3 3", stroke: "var(--border)" };

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(false);

  const [stats, setStats] = useState(INITIAL_STATS);
  const [inventoryStats, setInventory] = useState(INITIAL_INVENTORY);
  const [ticketStats, setTicketStats] = useState(INITIAL_TICKETS);
  const [topProducts, setTopProducts] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [topSuppliers, setTopSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const abortRef = useRef(null);

  const fetchDashboard = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);

    const [salesRes, topRes, trendRes, inventoryRes, productsRes, ticketRes] =
      await Promise.allSettled([
        getSalesSummary(),
        getTopProducts(),
        getSalesTrend(),
        API.get("/inventory"),
        API.get("/products"),
        API.get("/tickets"),
      ]);

    if (abortRef.current.signal.aborted) return;

    const errs = {};

    if (salesRes.status === "fulfilled" && salesRes.value?.data) {
      setStats(salesRes.value.data);
    } else {
      errs.sales = "Failed to load sales summary";
    }

    if (topRes.status === "fulfilled" && topRes.value?.data) {
      setTopProducts(
        topRes.value.data.map((item) => ({
          name: item.name,
          sold: item.totalSold || item.sold || item.quantity || 0,
        })),
      );
    }

    if (trendRes.status === "fulfilled" && trendRes.value?.data) {
      setSalesTrend(
        trendRes.value.data.map((item) => ({
          date: item.date || "",
          total: item.total || item.totalSales || item.revenue || 0,
        })),
      );
    }

    if (inventoryRes.status === "fulfilled") {
      const inv = inventoryRes.value.data?.data || [];
      setInventory({
        totalStock: inv.reduce((a, i) => a + (i.quantity || 0), 0),
        lowStock: inv.filter((i) => (i.quantity || 0) < 10).length,
        activeItems: inv.filter((i) => i.isActive !== false).length,
      });
    }

    if (productsRes.status === "fulfilled") {
      const products = productsRes.value.data?.data || [];
      const map = {};
      products.forEach((p) => {
        const s = p?.supplier;
        if (!s?._id) return;
        if (!map[s._id])
          map[s._id] = { name: s.name || "Unknown", value: 0, quantity: 0 };
        map[s._id].quantity += p.quantity || 0;
        map[s._id].value += (p.price || 0) * (p.quantity || 0);
      });
      setTopSuppliers(
        Object.values(map)
          .sort((a, b) => b.value - a.value)
          .slice(0, 5),
      );
    }

    if (ticketRes.status === "fulfilled") {
      const tickets = ticketRes.value.data?.data || [];
      setTicketStats({
        total: tickets.length,
        open: tickets.filter(
          (t) => t.status === "open" || t.status === "in_progress",
        ).length,
      });
    }

    setErrors(errs);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboard();
    return () => abortRef.current?.abort();
  }, [fetchDashboard]);

  const cleanProducts = useMemo(
    () => topProducts.filter((p) => p.sold > 0),
    [topProducts],
  );

  const cleanTrend = useMemo(
    () => salesTrend.filter((d) => d.total > 0),
    [salesTrend],
  );

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  const aiContext = useMemo(
    () => ({
      page: "dashboard",
      totalRevenue: stats.totalRevenue,
      totalOrders: stats.totalOrders,
      profit: stats.profit,
      profitMargin: stats.profitMargin,
      lowStock: inventoryStats.lowStock,
      openTickets: ticketStats.open,
    }),
    [stats, inventoryStats.lowStock, ticketStats.open],
  );

  return (
    <div className={styles.content}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome back, <span>{user?.name || "User"}</span> — {today}
          </p>
        </div>
      </div>

      {Object.values(errors).map((msg, i) => (
        <div key={i} className={styles.error}>
          {msg}
        </div>
      ))}

      {loading && <Skeleton />}

      {!loading && (
        <>
          {/* ── Overview stats ── */}
          <p className={styles.sectionTitle}>Overview</p>
          <div className={styles.cards}>
            <StatCard title="Total Orders" value={stats.totalOrders} />
            <StatCard title="Total Sold" value={stats.totalQuantity} />
            <StatCard
              title="Revenue"
              value={formatCurrency(stats.totalRevenue)}
            />
            {/* FIX 6: variant is now conditional on sign; profitMargin uses
                        toFixed(2) so floats like -178.9734… are displayed cleanly. */}
            <StatCard
              title="Profit"
              value={formatCurrency(stats.profit)}
              variant={stats.profit >= 0 ? "success" : "danger"}
              sub={`${Number(stats.profitMargin ?? 0).toFixed(2)}% margin`}
            />
            <StatCard title="Total Stock" value={inventoryStats.totalStock} />
            <StatCard
              title="Low Stock"
              value={inventoryStats.lowStock}
              variant="danger"
              sub="Items below threshold"
            />
            <StatCard
              title="Active Items"
              value={inventoryStats.activeItems}
              variant="success"
            />
            <StatCard
              title="Support Tickets"
              value={ticketStats.total}
              sub={
                ticketStats.open > 0
                  ? `${ticketStats.open} open`
                  : "All resolved"
              }
            />
          </div>

          {/* ── AI Insights ── */}
          <InsightsPanel analyticsData={aiContext} />

          {/* ── Top Suppliers ── */}
          {topSuppliers.length > 0 && (
            <>
              <p className={styles.sectionTitle}>Top Suppliers</p>
              <div className={styles.cards}>
                {topSuppliers.map((s, i) => (
                  <div
                    key={s.name}
                    className={styles.card}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/products?supplier=${s.name}`)}
                  >
                    <h3>
                      #{i + 1} {s.name}
                    </h3>
                    <p style={{ fontSize: "20px" }}>
                      {formatCurrency(s.value)}
                    </p>
                    <small>{s.quantity.toLocaleString("en-IN")} items</small>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Charts ── */}
          <div className={styles.chartsRow}>
            {/* Sales Trend */}
            <div className={styles.chartBox}>
              <h3>Sales Trend</h3>
              {cleanTrend.length === 0 ? (
                <p className={styles.noData}>No sales data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={cleanTrend}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
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
              )}
            </div>

            {/* Product Distribution */}
            <div className={styles.chartBox}>
              <h3>Product Distribution</h3>
              {cleanProducts.length === 0 ? (
                <p className={styles.noData}>No product data yet</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={cleanProducts}
                        dataKey="sold"
                        nameKey="name"
                        innerRadius={52}
                        outerRadius={88}
                        paddingAngle={2}
                      >
                        {cleanProducts.map((_, i) => (
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
                  <div className={styles.pieLegend}>
                    {cleanProducts.slice(0, 5).map((p, i) => (
                      <span key={i} className={styles.pieLegendItem}>
                        <span
                          className={styles.pieLegendDot}
                          style={{ background: PALETTE[i % PALETTE.length] }}
                        />
                        {p.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Top Products Bar */}
          {cleanProducts.length > 0 && (
            <div className={styles.chartBox}>
              <h3>Top Products by Units Sold</h3>
              <ResponsiveContainer
                width="100%"
                height={Math.max(200, cleanProducts.length * 44 + 60)}
              >
                <BarChart data={cleanProducts} layout="vertical">
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
            </div>
          )}

          {/* Supplier Value Bar */}
          {topSuppliers.length > 0 && (
            <div className={styles.chartBox}>
              <h3>Supplier Value Breakdown</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topSuppliers}>
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
            </div>
          )}
        </>
      )}

      {/* ── Floating AI Chat Button ── */}
      <button
        className={styles.aiFloatBtn}
        onClick={() => setAiOpen((o) => !o)}
        aria-label="Open AI Assistant"
      >
        <FiCpu size={18} />
      </button>

      {/* ── AI Chat Drawer ── */}
      <AnimatePresence>
        {aiOpen && (
          <motion.div
            className={styles.aiDrawer}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <AIChat context={aiContext} onClose={() => setAiOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
