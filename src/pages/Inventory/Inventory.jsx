import { useEffect, useState, useCallback } from "react";
import { getInventory } from "../../services/inventoryService";
import AddInventory from "./AddInventory";
import InventoryList from "./InventoryList";
import styles from "./Inventory.module.css";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
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
        page,
        limit,
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

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [limit, filter]);

  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show]);

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  const getPaginationRange = () => {
    const delta = 2,
      range = [];
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    if (totalPages >= 1) range.push(1);
    if (left > 2) range.push("...");

    for (let i = left; i <= right; i++) range.push(i);

    if (right < totalPages - 1) range.push("...");
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  const lowStockCount = data.filter(
    (i) => i.quantity > 0 && i.quantity <= 10,
  ).length;
  const criticalCount = data.filter(
    (i) => i.quantity > 0 && i.quantity <= 5,
  ).length;
  const activeCount = data.filter((i) => i.isActive).length;
  const outOfStock = data.filter((i) => i.quantity === 0).length;

  const kpis = [
    {
      label: "Total Items",
      value: total,
      icon: <TbPackage size={16} />,
      color: "#6c74f0",
      dim: "rgba(108,116,240,0.12)",
    },
    {
      label: "Low / Critical",
      value: lowStockCount + criticalCount,
      icon: <TbAlertTriangle size={16} />,
      color: "#f0a855",
      dim: "rgba(240,168,85,0.12)",
    },
    {
      label: "Out of Stock",
      value: outOfStock,
      icon: <FiX size={14} />,
      color: "#f87171",
      dim: "rgba(248,113,113,0.12)",
    },
    {
      label: "Active",
      value: activeCount,
      icon: <TbCircleCheck size={16} />,
      color: "#3ecf8e",
      dim: "rgba(62,207,142,0.12)",
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <div className={styles.titleIcon}>
            <MdOutlineInventory2 size={18} />
          </div>
          <div>
            <h2 className={styles.title}>Inventory</h2>
            <p className={styles.subtitle}>Stock management</p>
          </div>
        </div>

        <div className={styles.controls}>
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
                <motion.button
                  className={styles.clearBtn}
                  onClick={() => setSearch("")}
                >
                  <FiX size={11} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <select
            className={styles.filterSelect}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          <select
            className={styles.filterSelect}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            {LIMIT_OPTIONS.map((l) => (
              <option key={l} value={l}>
                {l} / page
              </option>
            ))}
          </select>

          <motion.button
            className={styles.btnPrimary}
            onClick={() => setShow(true)}
          >
            <FiPlus size={14} /> Add Stock
          </motion.button>
        </div>
      </div>
      <motion.div className={styles.kpiRow} initial="hidden" animate="show">
        {kpis.map((k) => (
          <motion.div key={k.label} className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <div
                className={styles.kpiIconBox}
                style={{ background: k.dim, color: k.color }}
              >
                {k.icon}
              </div>
              <span className={styles.kpiLabel}>{k.label}</span>
            </div>

            {loading ? (
              <div className={styles.kpiSkeleton} />
            ) : (
              <div className={styles.kpiValue} style={{ color: k.color }}>
                {k.value}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
      <AnimatePresence>
        {show && (
          <div className={styles.modalOverlay} onClick={() => setShow(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <AddInventory
                refresh={() => {
                  fetchInventory();
                  setShow(false);
                }}
                onClose={() => setShow(false)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
      <div className={styles.tableCard}>
        {loading ? (
          <div>Loading...</div>
        ) : data.length === 0 ? (
          <div>No inventory found</div>
        ) : (
          <InventoryList data={data} refresh={fetchInventory} />
        )}
      </div>
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
            <FiChevronLeft />
          </button>

          {getPaginationRange().map((p, i) =>
            p === "..." ? (
              <span key={i}>…</span>
            ) : (
              <button key={p} onClick={() => handlePageChange(p)}>
                {p}
              </button>
            ),
          )}

          <button
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default Inventory;
