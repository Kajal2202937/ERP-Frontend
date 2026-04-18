import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getSupplierAnalytics } from "../../services/SupplierService";
import styles from "./SupplierAnalytics.module.css";
import { FiTrendingUp, FiPieChart, FiAlertTriangle } from "react-icons/fi";

const COLORS = [
  "#6c74f0",
  "#3ecf8e",
  "#f0a855",
  "#f87171",
  "#4da8f5",
  "#a78bfa",
];


const fmtRupee = (val) => {
  if (val === undefined || val === null || isNaN(val)) return "₹0";
  const n = Number(val);
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n}`;
};


const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label || payload[0]?.name}</p>
      {payload.map((p, i) => (
        <p
          key={i}
          className={styles.tooltipVal}
          style={{ color: p.color || p.fill }}
        >
          {p.name === "profit" || p.name === "value"
            ? fmtRupee(p.value)
            : p.value?.toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
};


const RupeeTick = ({ x, y, payload }) => (
  <text
    x={x}
    y={y}
    dy={4}
    textAnchor="end"
    style={{
      fontSize: 11,
      fill: "var(--text3)",
      fontFamily: "var(--font-mono)",
    }}
  >
    {fmtRupee(payload.value)}
  </text>
);

const CountTick = ({ x, y, payload }) => (
  <text
    x={x}
    y={y}
    dy={4}
    textAnchor="end"
    style={{
      fontSize: 11,
      fill: "var(--text3)",
      fontFamily: "var(--font-mono)",
    }}
  >
    {Number.isInteger(payload.value) ? payload.value : ""}
  </text>
);

const SupplierAnalytics = ({ data: propData }) => {
  const [data, setData] = useState(propData || []);
  const [loading, setLoading] = useState(!propData);

  useEffect(() => {
    if (propData) {
      setData(propData);
      return;
    }
    getSupplierAnalytics()
      .then((res) => setData(res?.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [propData]);

  const topByProfit = [...data]
    .sort((a, b) => (b.profit || 0) - (a.profit || 0))
    .slice(0, 6);
  const topByValue = [...data]
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 6);

  const riskGroups = [
    {
      label: "High Risk",
      count: data.filter((s) => (s.lowStock || 0) > 5).length,
      color: "#f87171",
    },
    {
      label: "Medium Risk",
      count: data.filter((s) => (s.lowStock || 0) > 2 && (s.lowStock || 0) <= 5)
        .length,
      color: "#f0a855",
    },
    {
      label: "Healthy",
      count: data.filter((s) => (s.lowStock || 0) <= 2).length,
      color: "#3ecf8e",
    },
  ];

  const axisStyle = {
    fontSize: 11,
    fill: "var(--text3)",
    fontFamily: "var(--font-mono)",
  };
  const gridProps = {
    strokeDasharray: "3 3",
    stroke: "var(--border)",
    vertical: false,
  };

  if (loading) {
    return (
      <div className={styles.skeletonGrid}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </div>
    );
  }

  if (!data.length) return null;

  return (
    <div className={styles.grid}>
          <div className={styles.chartCard}>
        <div className={styles.cardHeader}>
          <div
            className={styles.cardIconWrap}
            style={{ background: "rgba(108,116,240,0.12)", color: "#8b91f5" }}
          >
            <FiTrendingUp size={14} />
          </div>
          <div>
            <h4 className={styles.cardTitle}>Supplier Profit</h4>
            <p className={styles.cardSub}>Top 6 by profit value</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={topByProfit}
            barSize={28}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid {...gridProps} />
            <XAxis
              dataKey="name"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v?.length > 10 ? v.slice(0, 9) + "…" : v)}
            />
            <YAxis
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtRupee}
              width={56}
             
              allowDecimals={false}
              tickCount={5}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(108,116,240,0.06)" }}
            />
            <Bar dataKey="profit" name="profit" radius={[5, 5, 0, 0]}>
              {topByProfit.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartCard}>
        <div className={styles.cardHeader}>
          <div
            className={styles.cardIconWrap}
            style={{ background: "rgba(77,168,245,0.12)", color: "#4da8f5" }}
          >
            <FiPieChart size={14} />
          </div>
          <div>
            <h4 className={styles.cardTitle}>Stock Distribution</h4>
            <p className={styles.cardSub}>By supplier value</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={topByValue}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={88}
              paddingAngle={2}
            >
              {topByValue.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                  strokeWidth={0}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(val) => [fmtRupee(val), "Value"]}
              contentStyle={{
                background: "var(--surface2)",
                border: "1px solid var(--border2)",
                borderRadius: 10,
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className={styles.pieLegend}>
          {topByValue.map((s, i) => (
            <span key={i} className={styles.pieLegendItem}>
              <span
                className={styles.pieDot}
                style={{ background: COLORS[i % COLORS.length] }}
              />
              {s.name?.length > 12 ? s.name.slice(0, 11) + "…" : s.name}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.chartCard}>
        <div className={styles.cardHeader}>
          <div
            className={styles.cardIconWrap}
            style={{ background: "rgba(248,113,113,0.12)", color: "#f87171" }}
          >
            <FiAlertTriangle size={14} />
          </div>
          <div>
            <h4 className={styles.cardTitle}>Low Stock Risk</h4>
            <p className={styles.cardSub}>By stock threshold</p>
          </div>
        </div>
        <div className={styles.riskSummary}>
          {riskGroups.map((r) => (
            <div
              key={r.label}
              className={styles.riskBadge}
              style={{
                color: r.color,
                background: `${r.color}14`,
                borderColor: `${r.color}28`,
              }}
            >
              <span className={styles.riskNum}>{r.count}</span>
              <span className={styles.riskLabel}>{r.label}</span>
            </div>
          ))}
        </div>
        <div className={styles.riskList}>
          {data
            .filter((s) => (s.lowStock || 0) > 0)
            .sort((a, b) => (b.lowStock || 0) - (a.lowStock || 0))
            .slice(0, 6)
            .map((s) => {
              const ls = s.lowStock || 0;
              const color = ls > 5 ? "#f87171" : ls > 2 ? "#f0a855" : "#3ecf8e";
              const pct = Math.min((ls / 10) * 100, 100);
              return (
                <div key={s._id} className={styles.riskRow}>
                  <span className={styles.riskName}>
                    {s.name?.length > 14
                      ? s.name.slice(0, 13) + "…"
                      : s.name || "Unknown"}
                  </span>
                  <div className={styles.riskBar}>
                    <div
                      className={styles.riskFill}
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                  <span className={styles.riskCount} style={{ color }}>
                    {ls}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default SupplierAnalytics;
