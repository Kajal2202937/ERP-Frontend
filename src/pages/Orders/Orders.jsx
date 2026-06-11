import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { getOrders } from "../../services/OrderService";
import { getInventory } from "../../services/inventoryService";

import { initSocket } from "../../services/socket";
import { ORDER_EVENTS } from "../../services/socketEvents";
import CreateOrder from "./CreateOrder";
import OrderList from "./OrderList";
import styles from "./Orders.module.css";
import { toast } from "../../../utils/toast";
import { useDebounce } from "../../hooks/useDebounce";
import useAuth from "../../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  IndianRupee,
  BarChart2,
} from "lucide-react";
import ExportButton from "../../components/common/ExportButton";
import ImportButton from "../../components/common/ImportButton";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const LIMIT_OPTIONS = [6, 10, 20, 50];

const Orders = () => {
  const { user } = useAuth();
  const canManage = ["admin", "manager"].includes(user?.role);

  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(6);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [inventoryData, setInventoryData] = useState([]);
  const [disabledProductIds, setDisabledProductIds] = useState(new Set());
  const [dialog, setDialog] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  const [socketSignal, setSocketSignal] = useState(0);
  const fetchOrdersRef = useRef(null);

  const fetchInventory = useCallback(() => {
    getInventory({ mode: "dropdown" })
      .then((res) => {
        const inv = res.data?.data || [];
        setInventoryData(inv);
        setDisabledProductIds(
          new Set(
            inv
              .filter((i) => i.isActive === false && i.product?._id)
              .map((i) => i.product._id),
          ),
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getOrders({
        page,
        limit,
        search: debouncedSearch,
        status,
      });
      setOrders(res?.data?.data || []);
      setPages(res?.data?.pages || 1);
      setTotal(res?.data?.total || 0);
    } catch {
      toast.error("Failed to load orders");
      setOrders([]);
      setPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, status]);

  fetchOrdersRef.current = fetchOrders;

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, limit]);

  useEffect(() => {
    if (socketSignal === 0) return;
    fetchOrdersRef.current?.();
  }, [socketSignal]);

  useEffect(() => {
    if (!canManage) return;

    const socket = initSocket();
    if (!socket) return;

    const joinManagerRoom = () => {
      socket.emit(ORDER_EVENTS.JOIN_MANAGER);
    };

    if (socket.connected) {
      joinManagerRoom();
    } else {
      socket.once("connect", joinManagerRoom);
    }

    const onCreated = ({ order }) => {
      toast.info(
        `New order ${order.orderNumber || ""} — ${order.product?.name || ""} (₹${Number(order.totalPrice).toLocaleString()})`,
        { duration: 6000 },
      );
      setSocketSignal((n) => n + 1);
    };

    const onUpdated = ({ orderNumber, oldStatus, newStatus, changedBy }) => {
      toast.info(
        `Order ${orderNumber}: ${oldStatus} → ${newStatus}${changedBy ? ` by ${changedBy}` : ""}`,
        { duration: 4000 },
      );
      setSocketSignal((n) => n + 1);
    };

    const onDeleted = ({ orderNumber }) => {
      toast.warning(`Order ${orderNumber} was deleted`, { duration: 4000 });
      setSocketSignal((n) => n + 1);
    };

    socket.on(ORDER_EVENTS.ORDER_CREATED, onCreated);
    socket.on(ORDER_EVENTS.ORDER_UPDATED, onUpdated);
    socket.on(ORDER_EVENTS.ORDER_DELETED, onDeleted);

    return () => {
      socket.off("connect", joinManagerRoom);
      socket.off(ORDER_EVENTS.ORDER_CREATED, onCreated);
      socket.off(ORDER_EVENTS.ORDER_UPDATED, onUpdated);
      socket.off(ORDER_EVENTS.ORDER_DELETED, onDeleted);
    };
  }, [canManage]);

  const handlePageChange = (p) => {
    if (p >= 1 && p <= pages) setPage(p);
  };

  const handleOpenForm = useCallback(() => {
    fetchInventory();
    setShowForm(true);
  }, [fetchInventory]);

  const paginationRange = useMemo(() => {
    if (pages <= 1) return [];
    const delta = 2;
    const left = Math.max(2, page - delta);
    const right = Math.min(pages - 1, page + delta);
    const items = [{ type: "page", value: 1, key: "page-1" }];
    if (left > 2)
      items.push({ type: "ellipsis", value: "...", key: "ellipsis-start" });
    for (let i = left; i <= right; i++)
      items.push({ type: "page", value: i, key: `page-${i}` });
    if (right < pages - 1)
      items.push({ type: "ellipsis", value: "...", key: "ellipsis-end" });
    items.push({ type: "page", value: pages, key: `page-${pages}` });
    const seen = new Set();
    return items.filter(({ key }) => {
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [page, pages]);

  const pageStats = useMemo(
    () => ({
      revenue: orders.reduce((s, o) => s + (o.totalPrice || 0), 0),
      profit: orders.reduce(
        (s, o) => s + (o.profit ?? (o.price - o.costPrice) * o.quantity),
        0,
      ),
      pending: orders.filter((o) => o.status === "pending").length,
    }),
    [orders],
  );

  return (
    <div className={styles.page}>
      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <div className={styles.titleIcon} aria-hidden="true">
            <ShoppingCart size={18} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className={styles.title}>Orders</h2>
            <div className={styles.subtitle}>
              <span className={styles.statChip}>{total} total</span>
              {pageStats.pending > 0 && (
                <span className={`${styles.statChip} ${styles.pendingChip}`}>
                  {pageStats.pending} pending
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchWrapper}>
            <Search
              className={styles.searchIcon}
              size={13}
              aria-hidden="true"
            />
            <input
              className={styles.searchInput}
              placeholder="Search orders, customers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search orders"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                >
                  <X size={11} aria-hidden="true" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <select
            className={styles.filterSelect}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            className={styles.filterSelect}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            aria-label="Rows per page"
          >
            {LIMIT_OPTIONS.map((l) => (
              <option key={l} value={l}>
                {l} / page
              </option>
            ))}
          </select>

          <ExportButton entity="orders" disablePDF />
          <ImportButton entity="orders" onSuccess={fetchOrders} />

          <motion.button
            type="button"
            className={styles.btnPrimary}
            onClick={handleOpenForm}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={14} aria-hidden="true" /> New Order
          </motion.button>
        </div>
      </div>

      {/* ── Summary bar ── */}
      {!loading && orders.length > 0 && (
        <div
          className={styles.summaryBar}
          role="region"
          aria-label="Orders summary"
        >
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Page Revenue</span>
            <span className={styles.summaryValue}>
              <IndianRupee size={13} aria-hidden="true" />
              {pageStats.revenue.toLocaleString("en-IN")}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Page Profit</span>
            <span
              className={`${styles.summaryValue} ${pageStats.profit >= 0 ? styles.profitPos : styles.profitNeg}`}
            >
              <IndianRupee size={13} aria-hidden="true" />
              {Math.abs(pageStats.profit).toLocaleString("en-IN")}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Showing</span>
            <span className={styles.summaryValue}>
              <BarChart2 size={13} aria-hidden="true" />
              {orders.length} of {total}
            </span>
          </div>
        </div>
      )}

      <OrderList
        orders={orders}
        refresh={fetchOrders}
        loading={loading}
        disabledProductIds={disabledProductIds}
        onConfirm={setDialog}
      />

      {/* ── Pagination ── */}
      <AnimatePresence>
        {!loading && pages > 1 && (
          <motion.nav
            className={styles.pagination}
            aria-label="Pagination"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className={styles.pageInfo}>
              Page <strong>{page}</strong> of <strong>{pages}</strong> · {total}{" "}
              total
            </span>
            <div className={styles.pageControls}>
              <button
                type="button"
                className={styles.pageArrow}
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft size={13} aria-hidden="true" />
              </button>
              {paginationRange.map(({ type, value, key }) =>
                type === "ellipsis" ? (
                  <span key={key} className={styles.ellipsis}>
                    …
                  </span>
                ) : (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.pageBtn} ${page === value ? styles.activeBtn : ""}`}
                    onClick={() => handlePageChange(value)}
                    aria-label={`Page ${value}`}
                    aria-current={page === value ? "page" : undefined}
                  >
                    {value}
                  </button>
                ),
              )}
              <button
                type="button"
                className={styles.pageArrow}
                disabled={page === pages}
                onClick={() => handlePageChange(page + 1)}
                aria-label="Next page"
              >
                <ChevronRight size={13} aria-hidden="true" />
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <CreateOrder
            refresh={fetchOrders}
            onClose={() => setShowForm(false)}
            inventoryData={inventoryData}
            disabledProductIds={disabledProductIds}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog config={dialog} onClose={() => setDialog(null)} />
    </div>
  );
};

export default Orders;
