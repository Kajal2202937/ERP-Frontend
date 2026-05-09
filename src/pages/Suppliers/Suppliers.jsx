import { useEffect, useState, useCallback } from "react";
import {
  getSuppliers,
  bulkDeleteSuppliers,
  getSupplierAnalytics,
} from "../../services/SupplierService";
import AddSupplier from "./AddSupplier";
import SupplierList from "./SupplierList";
import SupplierAnalytics from "./SupplierAnalytics";
import styles from "./Suppliers.module.css";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiPlus,
  FiTrash2,
  FiSearch,
  FiX,
  FiUsers,
  FiCheckCircle,
  FiPackage,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { TbCurrencyRupee } from "react-icons/tb";
import { toast } from "react-toastify";

const Suppliers = () => {
  const [data, setData] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    products: 0,
    value: 0,
  });
  const [show, setShow] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [bulkConfirm, setBulkConfirm] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSuppliers({ page, limit: 8, search });

      const result = res?.data?.data ?? res?.data ?? {};
      setData(result?.data || []);
      setTotalPages(result?.totalPages || 1);
      setTotal(result?.total || 0);
      setStats({
        total: result?.total || 0,
        active: result?.activeCount || 0,
        products: result?.productCount || 0,
        value: result?.stockValue || 0,
      });
    } catch {
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await getSupplierAnalytics();
      setAnalytics(res?.data?.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    fetchAnalytics();
    return () => clearTimeout(t);
  }, [fetchData, fetchAnalytics]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteSuppliers(selected);
      toast.success(`${selected.length} supplier(s) deleted`);
      setSelected([]);
      setBulkConfirm(false);
      fetchData();
      fetchAnalytics();
    } catch {
      toast.error("Bulk delete failed");
    }
  };

  const getPaginationRange = () => {
    const delta = 1,
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

  const fmtVal = (v) => {
    if (!v) return "₹0";
    if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(1)}Cr`;
    if (v >= 100_000) return `₹${(v / 100_000).toFixed(1)}L`;
    if (v >= 1_000) return `₹${(v / 1_000).toFixed(1)}K`;
    return `₹${v}`;
  };

  const kpiCards = [
    {
      icon: <FiUsers size={15} />,
      label: "Total suppliers",
      value: stats.total,
      color: "#6c74f0",
      dim: "rgba(108,116,240,0.12)",
    },
    {
      icon: <FiCheckCircle size={15} />,
      label: "Active",
      value: stats.active,
      color: "#3ecf8e",
      dim: "rgba(62,207,142,0.12)",
    },
    {
      icon: <FiPackage size={15} />,
      label: "Products linked",
      value: stats.products,
      color: "#f0a855",
      dim: "rgba(240,168,85,0.12)",
    },
    {
      icon: <TbCurrencyRupee size={16} />,
      label: "Stock value",
      value: fmtVal(stats.value),
      color: "#4da8f5",
      dim: "rgba(77,168,245,0.12)",
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <div className={styles.titleIcon}>
            <FiUsers size={18} />
          </div>
          <div>
            <h2 className={styles.title}>Suppliers</h2>
            <p className={styles.subtitle}>Manage all vendor records</p>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchWrapper}>
            <FiSearch className={styles.searchIcon} size={13} />
            <input
              className={styles.searchInput}
              placeholder="Search suppliers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  className={styles.clearBtn}
                  onClick={() => setSearch("")}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                >
                  <FiX size={11} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {selected.length > 0 && (
              <motion.button
                className={styles.bulkDeleteBtn}
                onClick={() => setBulkConfirm(true)}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
              >
                <FiTrash2 size={13} /> Delete ({selected.length})
              </motion.button>
            )}
          </AnimatePresence>

          <motion.button
            className={styles.addBtn}
            onClick={() => setShow(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <FiPlus size={14} /> Add supplier
          </motion.button>
        </div>
      </div>

      <motion.div
        className={styles.kpiRow}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.07 } },
        }}
        initial="hidden"
        animate="show"
      >
        {kpiCards.map((k) => (
          <motion.div
            key={k.label}
            className={styles.kpiCard}
            variants={{
              hidden: { opacity: 0, y: 14 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
              },
            }}
            whileHover={{ y: -2 }}
          >
            <div className={styles.kpiTop}>
              <div
                className={styles.kpiIconBox}
                style={{
                  background: k.dim,
                  border: `1px solid ${k.color}28`,
                  color: k.color,
                }}
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
            <div className={styles.kpiAccent} style={{ background: k.color }} />
          </motion.div>
        ))}
      </motion.div>
      {analytics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <SupplierAnalytics data={analytics} />
        </motion.div>
      )}
      <AnimatePresence>
        {show && (
          <AddSupplier
            refresh={() => {
              fetchData();
              fetchAnalytics();
              setShow(false);
            }}
            close={() => setShow(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {bulkConfirm && (
          <motion.div
            className={styles.confirmOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBulkConfirm(false)}
          >
            <motion.div
              className={styles.confirmBox}
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.confirmIcon}>
                <FiTrash2 size={18} />
              </div>
              <h4 className={styles.confirmTitle}>
                Delete {selected.length} supplier
                {selected.length > 1 ? "s" : ""}?
              </h4>
              <p className={styles.confirmDesc}>
                This action cannot be undone.
              </p>
              <div className={styles.confirmActions}>
                <button
                  className={styles.confirmCancel}
                  onClick={() => setBulkConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmDelete}
                  onClick={handleBulkDelete}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SupplierList
          data={data}
          refresh={() => {
            fetchData();
            fetchAnalytics();
          }}
          loading={loading}
          selected={selected}
          setSelected={setSelected}
        />
      </motion.div>
      <AnimatePresence>
        {!loading && totalPages > 1 && (
          <motion.div
            className={styles.pagination}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className={styles.pageInfo}>
              <strong>{total}</strong> supplier{total !== 1 ? "s" : ""}
              <span className={styles.pageDot}>·</span>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className={styles.pageControls}>
              <button
                className={styles.pageArrow}
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <FiChevronLeft size={13} />
              </button>
              {getPaginationRange().map((p, i) =>
                p === "..." ? (
                  <span key={i} className={styles.ellipsis}>
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${page === p ? styles.activeBtn : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                className={styles.pageArrow}
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <FiChevronRight size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Suppliers;
