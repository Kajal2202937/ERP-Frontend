import { useEffect, useState, useMemo } from "react";
import { getProductions } from "../../services/ProductionService";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

import CreateProduction from "./CreateProduction";
import ProductionList from "./ProductionList";
import styles from "./Production.module.css";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid,
} from "recharts";

import {
  FiSearch, FiX, FiPlus, FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { MdPrecisionManufacturing } from "react-icons/md";
import { TbPackages } from "react-icons/tb";

// ─── Custom Tooltip ──────────────────────────────────────

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>{payload[0].value}</p>
    </div>
  );
};

const BAR_COLORS = {
  Started: "#6378ff",
  "In Progress": "#f0a855",
  Completed: "#4ade80",
};

const KPI_META = {
  total:      { label: "Total",       color: "#a78bfa", dim: "rgba(167,139,250,0.12)", icon: "⚙️" },
  completed:  { label: "Completed",   color: "#4ade80", dim: "rgba(74,222,128,0.12)",  icon: "✅" },
  inProgress: { label: "In Progress", color: "#f0a855", dim: "rgba(240,168,85,0.12)",  icon: "🔄" },
  started:    { label: "Started",     color: "#6378ff", dim: "rgba(99,120,255,0.12)",  icon: "🚀" },
  totalQty:   { label: "Total Qty",   color: "#38bdf8", dim: "rgba(56,189,248,0.12)",  icon: "📦" },
};

// ─── Component ───────────────────────────────────────────

const Production = () => {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 5;

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getProductions();
      setData(res.data.data);
    } catch {
      toast.error("Failed to load production data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const kpis = useMemo(() => ({
    total:      data.length,
    completed:  data.filter((p) => p.status === "completed").length,
    inProgress: data.filter((p) => p.status === "in-progress").length,
    started:    data.filter((p) => p.status === "started").length,
    totalQty:   data.reduce((a, b) => a + b.quantityProduced, 0),
  }), [data]);

  const filtered = useMemo(() =>
    data
      .filter((p) => p.product?.name?.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => statusFilter === "all" ? true : p.status === statusFilter),
    [data, search, statusFilter]
  );

  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));

  const chartData = [
    { name: "Started",     value: kpis.started    },
    { name: "In Progress", value: kpis.inProgress },
    { name: "Completed",   value: kpis.completed  },
  ];

  return (
    <div className={styles.page}>

      {/* ── HEADER ── */}
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <div className={styles.titleIcon}><MdPrecisionManufacturing size={20} /></div>
          <div>
            <h2 className={styles.title}>Production</h2>
            <p className={styles.subtitle}>Manufacturing dashboard</p>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.searchWrapper}>
            <FiSearch size={13} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search product…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <AnimatePresence>
              {search && (
                <motion.button className={styles.clearBtn} onClick={() => { setSearch(""); setPage(1); }}
                  initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}>
                  <FiX size={12} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className={styles.filterWrap}>
            <select className={styles.filterSelect} value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">All Status</option>
              <option value="started">Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <motion.button
            className={styles.btnPrimary}
            onClick={() => setShow((p) => !p)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          >
            <AnimatePresence mode="wait">
              <motion.span key={show ? "close" : "open"} className={styles.btnInner}
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}>
                {show ? <FiX size={14} /> : <FiPlus size={14} />}
                {show ? "Cancel" : "New Production"}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className={styles.kpiGrid}>
        {loading
          ? [...Array(5)].map((_, i) => <div key={i} className={styles.kpiSkeleton} />)
          : Object.entries(kpis).map(([key, val], i) => {
              const meta = KPI_META[key];
              return (
                <motion.div key={key} className={styles.kpiCard}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -2 }}
                  style={{ "--kc": meta.color, "--kc-dim": meta.dim }}
                >
                  <div className={styles.kpiTop}>
                    <div className={styles.kpiIconBox} style={{ background: meta.dim, border: `1px solid ${meta.color}30` }}>
                      <span>{meta.icon}</span>
                    </div>
                    <span className={styles.kpiLabel}>{meta.label}</span>
                  </div>
                  <div className={styles.kpiValue}>{val}</div>
                  <div className={styles.kpiAccent} style={{ background: meta.color }} />
                </motion.div>
              );
            })}
      </div>

      {/* ── CREATE FORM ── */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <CreateProduction refresh={fetchData} onClose={() => setShow(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CHART + LIST ROW ── */}
      <div className={styles.mainGrid}>
        {/* Chart */}
        <motion.div className={styles.chartCard}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Status Breakdown</h3>
            <p className={styles.cardSub}>Production by stage</p>
          </div>

          {loading ? (
            <div className={styles.skeleton} style={{ height: 220, borderRadius: 10 }} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={32} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name"
                  tick={{ fontSize: 11, fill: "rgba(238,240,247,0.35)", fontFamily: "DM Sans" }}
                  axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10.5, fill: "rgba(238,240,247,0.3)", fontFamily: "DM Sans" }}
                  axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={BAR_COLORS[entry.name] || "#f0a855"} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Stats mini */}
        <div className={styles.statsCol}>
          {[
            { label: "Completion Rate", value: kpis.total ? Math.round((kpis.completed / kpis.total) * 100) : 0, unit: "%", color: "#4ade80" },
            { label: "In Progress Rate", value: kpis.total ? Math.round((kpis.inProgress / kpis.total) * 100) : 0, unit: "%", color: "#f0a855" },
          ].map((s) => (
            <motion.div key={s.label} className={styles.statCard}
              initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.28 }}>
              <p className={styles.statLabel}>{s.label}</p>
              <p className={styles.statValue} style={{ color: s.color }}>{s.value}{s.unit}</p>
              <div className={styles.statBar}>
                <motion.div className={styles.statFill}
                  style={{ background: s.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value}%` }}
                  transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          ))}

          <motion.div className={styles.statCard}
            initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.28 }}>
            <p className={styles.statLabel}>Total Units Produced</p>
            <p className={styles.statValue} style={{ color: "#38bdf8" }}>
              <TbPackages size={16} style={{ display: "inline", marginRight: 4, verticalAlign: "text-top" }} />
              {kpis.totalQty.toLocaleString()}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── TABLE ── */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className={styles.tableCard}
        >
          <ProductionList data={paginated} refresh={fetchData} />
        </motion.div>
      )}

      {/* ── PAGINATION ── */}
      {!loading && totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <div className={styles.pageControls}>
            <button className={styles.pageArrow} disabled={page === 1} onClick={() => setPage(page - 1)}>
              <FiChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p}
                className={`${styles.pageBtn} ${page === p ? styles.activeBtn : ""}`}
                onClick={() => setPage(p)}
              >{p}</button>
            ))}
            <button className={styles.pageArrow} disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Production;