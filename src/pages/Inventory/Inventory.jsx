import { useEffect, useState, useCallback } from "react";
import { getInventory } from "../../services/inventoryService";
import AddInventory from "./AddInventory";
import InventoryList from "./InventoryList";
import styles from "./Inventory.module.css";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

import {
  FiPlus, FiSearch, FiX, FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { TbPackage, TbAlertTriangle, TbCircleCheck } from "react-icons/tb";
import { MdOutlineInventory2 } from "react-icons/md";

const LIMIT_OPTIONS = [5, 10, 20, 50];

const Inventory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getInventory({
        page, limit,
        search: debounced || undefined,
        stock: filter !== "all" ? filter : undefined,
      });
      const result = res?.data;
      setData(result?.data || []);
      setTotal(result?.total || 0);
      setTotalPages(result?.totalPages || 1);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debounced, filter]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [limit, filter]);
  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [show]);

  const handlePageChange = (p) => { if (p >= 1 && p <= totalPages) setPage(p); };

  const getPaginationRange = () => {
    const delta = 2, range = [];
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);
    if (totalPages >= 1) range.push(1);
    if (left > 2) range.push("...");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push("...");
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  const lowStockCount  = data.filter((i) => i.quantity > 0 && i.quantity <= 10).length;
  const criticalCount  = data.filter((i) => i.quantity > 0 && i.quantity <= 5).length;
  const activeCount    = data.filter((i) => i.isActive).length;
  const outOfStock     = data.filter((i) => i.quantity === 0).length;

  const kpis = [
    { label: "Total Items",   value: total,                     icon: <TbPackage size={18} />,        color: "#6378ff", dim: "rgba(99,120,255,0.12)"  },
    { label: "Low / Critical",value: lowStockCount + criticalCount, icon: <TbAlertTriangle size={18} />, color: "#fb923c", dim: "rgba(251,146,60,0.12)" },
    { label: "Out of Stock",  value: outOfStock,                icon: <FiX size={16} />,            color: "#f87171", dim: "rgba(248,113,113,0.12)" },
    { label: "Active",        value: activeCount,               icon: <TbCircleCheck size={18} />,  color: "#4ade80", dim: "rgba(74,222,128,0.12)"  },
  ];

  return (
    <div className={styles.page}>

      {/* ── HEADER ── */}
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <div className={styles.titleIcon}><MdOutlineInventory2 size={20} /></div>
          <div>
            <h2 className={styles.title}>Inventory</h2>
            <p className={styles.subtitle}>Stock management</p>
          </div>
        </div>

        <div className={styles.controls}>
          {/* Search */}
          <div className={styles.searchWrapper}>
            <FiSearch className={styles.searchIcon} size={13} />
            <input
              className={styles.searchInput}
              placeholder="Search product…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <AnimatePresence>
              {search && (
                <motion.button className={styles.clearBtn} onClick={() => setSearch("")}
                  initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}>
                  <FiX size={12} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Stock filter */}
          <select className={styles.filterSelect} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          {/* Per-page */}
          <select className={styles.filterSelect} value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            {LIMIT_OPTIONS.map((l) => <option key={l} value={l}>{l} / page</option>)}
          </select>

          {/* CTA */}
          <motion.button className={styles.btnPrimary} onClick={() => setShow(true)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <FiPlus size={15} />
            Add Stock
          </motion.button>
        </div>
      </div>

      {/* ── KPI ROW ── */}
      <div className={styles.kpiRow}>
        {kpis.map((k, i) => (
          <motion.div key={k.label} className={styles.kpiCard}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2 }}
            style={{ "--kc": k.color, "--kc-dim": k.dim }}>
            <div className={styles.kpiTop}>
              <div className={styles.kpiIconBox} style={{ background: k.dim, border: `1px solid ${k.color}30` }}>
                <span style={{ color: k.color }}>{k.icon}</span>
              </div>
              <span className={styles.kpiLabel}>{k.label}</span>
            </div>
            {loading
              ? <div className={styles.skeleton} style={{ height: 28, width: "55%", borderRadius: 6 }} />
              : <div className={styles.kpiValue}>{k.value}</div>}
            <div className={styles.kpiAccent} style={{ background: k.color }} />
          </motion.div>
        ))}
      </div>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {show && (
          <motion.div className={styles.modalOverlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShow(false)}>
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}>
              <AddInventory refresh={() => { fetchInventory(); setShow(false); }} onClose={() => setShow(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TABLE ── */}
      <motion.div className={styles.tableCard}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}>
        {loading ? (
          <div className={styles.skeletonTable}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={styles.skeletonRow}>
                {[...Array(5)].map((_, j) => (
                  <div key={j} className={styles.skeleton} style={{ height: 13, width: j === 4 ? 60 : "80%", borderRadius: 5 }} />
                ))}
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📦</div>
            <p className={styles.emptyTitle}>No inventory found</p>
            <p className={styles.emptyDesc}>Try adjusting your filters or add new stock.</p>
          </div>
        ) : (
          <InventoryList data={data} refresh={fetchInventory} />
        )}
      </motion.div>

      {/* ── PAGINATION ── */}
      <AnimatePresence>
        {!loading && totalPages > 1 && (
          <motion.div className={styles.pagination}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <span className={styles.pageInfo}>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              <span className={styles.totalCount}> · {total} items</span>
            </span>
            <div className={styles.pageControls}>
              <button className={styles.pageArrow} disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
                <FiChevronLeft size={14} />
              </button>
              {getPaginationRange().map((p, i) =>
                p === "..." ? <span key={i} className={styles.ellipsis}>…</span> : (
                  <button key={p} className={`${styles.pageBtn} ${page === p ? styles.activeBtn : ""}`}
                    onClick={() => handlePageChange(p)}>{p}</button>
                )
              )}
              <button className={styles.pageArrow} disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>
                <FiChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;