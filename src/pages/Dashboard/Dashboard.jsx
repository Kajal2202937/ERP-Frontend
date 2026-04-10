import { useEffect, useState } from "react";
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
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis,
  Tooltip, ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* ─── Constants ─────────────────────────────────────────── */
const PALETTE = ["#f0a500", "#378ADD", "#1D9E75", "#D85A30", "#7F77DD"];

const formatCurrency = (num = 0) => {
  if (!num) return "₹ 0";
  if (num >= 10_000_000) return "₹ " + (num / 10_000_000).toFixed(1) + " Cr";
  if (num >= 100_000)    return "₹ " + (num / 100_000).toFixed(1) + " L";
  return "₹ " + num.toLocaleString("en-IN");
};

/* ─── Custom Tooltip ─────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, currency = false }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface)",
      border: "0.5px solid var(--border-hover)",
      borderRadius: 10,
      padding: "10px 14px",
      boxShadow: "var(--shadow-md)",
    }}>
      <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 13, fontWeight: 500, color: p.color || "var(--accent)" }}>
          {currency ? formatCurrency(p.value) : p.value.toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
};

/* ─── Stat Card ──────────────────────────────────────────── */
const StatCard = ({ title, value, trend, trendLabel, sub, variant }) => (
  <div className={`${styles.card} ${
    variant === "danger"  ? styles.cardDanger  :
    variant === "success" ? styles.cardSuccess : ""
  }`}>
    <h3>{title}</h3>
    <p>{typeof value === "number" ? value.toLocaleString("en-IN") : value}</p>
    {trend != null && (
      <span className={`${styles.trend} ${
        trend > 0 ? styles.trendUp : trend < 0 ? styles.trendDown : styles.trendNeutral
      }`}>
        {trend > 0 ? "↑" : trend < 0 ? "↓" : "—"} {Math.abs(trend)}%
        {trendLabel && <span style={{ fontWeight: 400, opacity: 0.75 }}> {trendLabel}</span>}
      </span>
    )}
    {sub && <small>{sub}</small>}
  </div>
);

/* ─── Skeleton Loader ────────────────────────────────────── */
const Skeleton = () => (
  <>
    <div className={styles.skeletonGrid}>
      {[...Array(5)].map((_, i) => <div key={i} className={styles.skeletonCard} />)}
    </div>
    <div className={styles.skeletonChart} />
    <div className={styles.skeletonChart} />
  </>
);

/* ─── Dashboard ──────────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats,          setStats]          = useState({ totalOrders: 0, totalQuantity: 0 });
  const [inventoryStats, setInventoryStats] = useState({ totalStock: 0, lowStock: 0, activeItems: 0 });
  const [topProducts,    setTopProducts]    = useState([]);
  const [salesTrend,     setSalesTrend]     = useState([]);
  const [topSuppliers,   setTopSuppliers]   = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [salesRes, topRes, trendRes, inventoryRes, productsRes] = await Promise.all([
          getSalesSummary(),
          getTopProducts(),
          getSalesTrend(),
          API.get("/inventory"),
          API.get("/products"),
        ]);

        /* Sales summary */
        setStats(salesRes?.data?.data || { totalOrders: 0, totalQuantity: 0 });

        /* Top products */
        const topData = topRes?.data?.data || topRes?.data || [];
        setTopProducts(
          topData.map((item) => ({
            name: item?.productDetails?.name || item?.product?.name || item?.name || "Unknown",
            sold: item?.totalSold || item?.sold || item?.quantity || 0,
          }))
        );

        /* Sales trend */
        const rawTrend = trendRes?.data?.data || [];
        setSalesTrend(
          rawTrend.map((item) => ({
            date:  item?.date || "",
            total: item?.total || item?.totalSales || item?.value || item?.revenue || 0,
          }))
        );

        /* Inventory */
        const inventory = inventoryRes?.data?.data || [];
        setInventoryStats({
          totalStock:  inventory.reduce((acc, i) => acc + (i.quantity || 0), 0),
          lowStock:    inventory.filter((i) => (i.quantity || 0) < 10).length,
          activeItems: inventory.filter((i) => i.isActive !== false).length,
        });

        /* Suppliers (derived from products) */
        const products = productsRes?.data?.data || [];
        const map = {};
        products.forEach((p) => {
          const s = p?.supplier;
          if (!s?._id) return;
          if (!map[s._id]) map[s._id] = { name: s.name || "Unknown", value: 0, quantity: 0 };
          map[s._id].quantity += p.quantity || 0;
          map[s._id].value    += (p.price || 0) * (p.quantity || 0);
        });
        setTopSuppliers(Object.values(map).sort((a, b) => b.value - a.value).slice(0, 5));

        setError("");
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const cleanProducts = topProducts.filter((p) => p.sold > 0);
  const cleanTrend    = salesTrend.filter((d) => d.total > 0);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  /* ── axis / grid shared props ── */
  const axisStyle = { fontSize: 11, fill: "var(--text-secondary)" };
  const gridProps = { strokeDasharray: "3 3", stroke: "var(--border)" };

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
        <span className={styles.headerBadge}>Live</span>
      </div>

      {/* ── States ── */}
      {error && <div className={styles.error}>{error}</div>}
      {loading && <Skeleton />}

      {!loading && !error && (
        <>
          {/* ── KPI cards ── */}
          <p className={styles.sectionTitle}>Overview</p>
          <div className={styles.cards}>
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              trend={12.4}
              trendLabel="this month"
            />
            <StatCard
              title="Total Sold"
              value={stats.totalQuantity}
              trend={8.1}
              trendLabel="this month"
            />
            <StatCard
              title="Total Stock"
              value={inventoryStats.totalStock}
              trend={0}
              trendLabel="stable"
            />
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
              sub="Currently active"
            />
          </div>

          {/* ── Supplier cards ── */}
          {topSuppliers.length > 0 && (
            <>
              <p className={styles.sectionTitle}>Top Suppliers</p>
              <div className={styles.cards}>
                {topSuppliers.map((s, i) => (
                  <div
                    key={i}
                    className={styles.card}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/products?supplier=${s.name}`)}
                  >
                    <h3>#{i + 1} {s.name}</h3>
                    <p style={{ fontSize: "22px", letterSpacing: "-0.5px" }}>
                      {formatCurrency(s.value)}
                    </p>
                    <small>{s.quantity.toLocaleString("en-IN")} items</small>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Area chart + Donut ── */}
          <div className={styles.chartsRow}>

            {/* Sales Trend */}
            <div className={styles.chartBox}>
              <h3>Sales Trend</h3>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={cleanTrend}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}    />
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
                    cursor={{ stroke: "var(--accent)", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    fill="url(#areaGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "var(--accent)", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Product Distribution (Donut) */}
            <div className={styles.chartBox}>
              <h3>Product Distribution</h3>
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
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
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
            </div>
          </div>

          {/* ── Top Products (horizontal bar) ── */}
          <div className={styles.chartBox}>
            <h3>Top Products by Units Sold</h3>
            <ResponsiveContainer width="100%" height={Math.max(200, cleanProducts.length * 44 + 60)}>
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
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Supplier value breakdown ── */}
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
                    fill="#378ADD"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;