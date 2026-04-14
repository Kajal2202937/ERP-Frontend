import { useEffect, useState, useCallback } from "react";
import { getOrders } from "../../services/OrderService";
import CreateOrder from "./CreateOrder";
import OrderList from "./OrderList";
import styles from "./Orders.module.css";
import { toast } from "react-toastify";
import { useDebounce } from "../../hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { TbShoppingCartPlus } from "react-icons/tb";

const Orders = () => {
  const [orders,   setOrders]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getOrders({ page, limit: 6, search: debouncedSearch, status });
      setOrders(res?.data?.data || []);
      setPages(res?.data?.pages || 1);
    } catch {
      toast.error("Failed to load orders");
      setOrders([]); setPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { setPage(1); }, [debouncedSearch, status]);

  const handlePageChange = (p) => { if (p >= 1 && p <= pages) setPage(p); };

  const getPaginationRange = () => {
    const delta = 2, range = [];
    const left  = Math.max(2, page - delta);
    const right = Math.min(pages - 1, page + delta);
    range.push(1);
    if (left > 2) range.push("...");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < pages - 1) range.push("...");
    if (pages > 1) range.push(pages);
    return range;
  };

  const totalOrders  = orders.length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className={styles.page}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <div className={styles.titleIcon}><TbShoppingCartPlus size={18} /></div>
          <div>
            <h2 className={styles.title}>Orders</h2>
            <div className={styles.subtitle}>
              <span className={styles.statChip}>{totalOrders} total</span>
              {pendingCount > 0 && (
                <span className={`${styles.statChip} ${styles.pendingChip}`}>{pendingCount} pending</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchWrapper}>
            <FiSearch className={styles.searchIcon} size={13} />
            <input
              className={styles.searchInput}
              placeholder="Search orders…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <AnimatePresence>
              {search && (
                <motion.button className={styles.clearBtn} onClick={() => setSearch("")}
                  initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}>
                  <FiX size={11} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className={styles.filterWrapper}>
            <select className={styles.filterSelect} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <motion.button className={styles.btnPrimary} onClick={() => setShowForm(true)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <FiPlus size={14} /> New Order
          </motion.button>
        </div>
      </div>

      <OrderList orders={orders} refresh={fetchOrders} loading={loading} />

      {/* Pagination */}
      <AnimatePresence>
        {!loading && pages > 1 && (
          <motion.div className={styles.pagination}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <span className={styles.pageInfo}>
              Page <strong>{page}</strong> of <strong>{pages}</strong>
            </span>
            <div className={styles.pageControls}>
              <button className={styles.pageArrow} disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
                <FiChevronLeft size={13} />
              </button>
              {getPaginationRange().map((p, i) =>
                p === "..." ? <span key={i} className={styles.ellipsis}>…</span> : (
                  <button key={p} className={`${styles.pageBtn} ${page === p ? styles.activeBtn : ""}`}
                    onClick={() => handlePageChange(p)}>{p}</button>
                )
              )}
              <button className={styles.pageArrow} disabled={page === pages} onClick={() => handlePageChange(page + 1)}>
                <FiChevronRight size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showForm && <CreateOrder refresh={fetchOrders} onClose={() => setShowForm(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Orders;