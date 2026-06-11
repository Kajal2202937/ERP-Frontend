import { useState } from "react";
import {
  updateOrderStatus,
  deleteOrder,
  resendInvoice,
} from "../../services/OrderService";
import styles from "./OrderList.module.css";
import { toast } from "../../../utils/toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  AlertTriangle,
  User,
  Hash,
  Lock,
  Trash2,
  Calendar,
  Send,
  Receipt,
  IndianRupee,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import EmptyState from "../../components/common/EmptyState";


const STATUS_META = {
  pending: { label: "Pending", cls: "pending" },
  completed: { label: "Completed", cls: "completed" },
  cancelled: { label: "Cancelled", cls: "cancelled" },
};

const OrderList = ({
  orders = [],
  refresh,
  loading,
  disabledProductIds = new Set(),
  onConfirm,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const canManage = ["admin", "manager"].includes(user?.role);

  const [sendingInvoice, setSendingInvoice] = useState(null);

  const handleStatusChange = async (
    id,
    newStatus,
    currentStatus,
    productId,
  ) => {
    if (disabledProductIds.has(productId)) {
      return toast.error("Cannot update — inventory is disabled");
    }

    if (newStatus === "cancelled" && currentStatus !== "cancelled") {
      onConfirm?.({
        title: "Cancel this order?",
        message:
          "Stock will be restored to inventory. This action cannot be reversed.",
        variant: "warning",
        confirmLabel: "Cancel Order",
        onConfirm: async () => {
          try {
            await updateOrderStatus(id, newStatus);
            toast.success("Order cancelled");
            refresh?.();
          } catch (err) {
            toast.error(
              err?.response?.data?.message || err?.message || "Update failed",
            );
          }
        },
      });
      return;
    }

    try {
      await updateOrderStatus(id, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      refresh?.();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Update failed",
      );
    }
  };

  const handleDelete = (id, orderNumber) => {
    onConfirm?.({
      title: `Delete order ${orderNumber || `#${id.slice(-6).toUpperCase()}`}?`,
      message:
        "This will permanently remove the order record. This cannot be undone.",
      variant: "danger",
      confirmLabel: "Delete Order",
      onConfirm: async () => {
        try {
          await deleteOrder(id);
          toast.success("Order deleted");
          refresh?.();
        } catch (err) {
          toast.error(
            err?.response?.data?.message || err?.message || "Delete failed",
          );
        }
      },
    });
  };

  const handleResendInvoice = async (id, orderNumber, customerEmail) => {
    if (!customerEmail) return toast.error("No customer email on this order");
    setSendingInvoice(id);
    try {
      await resendInvoice(id);
      toast.success(`Invoice sent to ${customerEmail}`);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send invoice",
      );
    } finally {
      setSendingInvoice(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.grid} aria-busy="true" aria-label="Loading orders">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={styles.skeletonCard} aria-hidden="true">
            <div
              className={styles.skelLine}
              style={{ width: "60%", height: 14 }}
            />
            <div
              className={styles.skelLine}
              style={{ width: "40%", height: 11, marginTop: 8 }}
            />
            <div
              className={styles.skelLine}
              style={{ width: "80%", height: 11, marginTop: 20 }}
            />
            <div
              className={styles.skelLine}
              style={{ width: "50%", height: 11, marginTop: 8 }}
            />
            <div
              className={styles.skelLine}
              style={{
                width: "100%",
                height: 34,
                marginTop: 20,
                borderRadius: 8,
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <EmptyState
        variant="default"
        title="No orders found"
        description="Create your first order to get started."
      />
    );
  }

  return (
    <div className={styles.grid}>
      <AnimatePresence>
        {orders.map((o, i) => {
          const productId = o?.product?._id;
          const isDisabled = disabledProductIds.has(productId);
          const statusMeta = STATUS_META[o.status] || STATUS_META.pending;
          const profit = o.profit ?? (o.price - o.costPrice) * o.quantity;
          const isProfit = profit >= 0;
          const hasEmail = !!o.customer?.email;

          return (
            <motion.article
              key={o._id}
              className={`${styles.card} ${isDisabled ? styles.disabledCard : ""}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{
                delay: i * 0.04,
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              aria-label={`Order ${o.orderNumber || o._id.slice(-6)}, ${statusMeta.label}`}
            >
              {/* Disabled inventory banner */}
              <AnimatePresence>
                {isDisabled && (
                  <motion.div
                    className={styles.disabledBanner}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <AlertTriangle size={12} aria-hidden="true" />
                    <span>Inventory disabled — status locked</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                className={`${styles.cardAccent} ${styles[`accent_${statusMeta.cls}`]}`}
                aria-hidden="true"
              />

              {/* Header */}
              <div className={styles.cardHeader}>
                <div className={styles.productInfo}>
                  <div className={styles.productIconWrap} aria-hidden="true">
                    <Package size={14} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className={styles.productName}>
                      {o.product?.name || "Product"}
                    </p>
                    <p className={styles.supplierName}>
                      <User size={10} aria-hidden="true" />
                      {o.product?.supplier?.name || "No Supplier"}
                    </p>
                  </div>
                </div>
                <div
                  className={`${styles.statusPill} ${styles[statusMeta.cls]}`}
                  role="status"
                >
                  {statusMeta.label}
                </div>
              </div>

              {/* Stats */}
              <div className={styles.statsRow}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total</span>
                  <span className={styles.statValue}>
                    <IndianRupee size={13} aria-hidden="true" />
                    {Number(o.totalPrice).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Qty</span>
                  <span className={styles.statValue}>
                    <Hash size={11} aria-hidden="true" />
                    {o.quantity}
                  </span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Profit</span>
                  <span
                    className={`${styles.statValue} ${isProfit ? styles.profitPos : styles.profitNeg}`}
                  >
                    <IndianRupee size={13} aria-hidden="true" />
                    {Math.abs(profit).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Meta row */}
              <div className={styles.metaRow}>
                <span className={styles.orderNum}>
                  <Receipt size={11} aria-hidden="true" />
                  {o.orderNumber || `#${o._id.slice(-6).toUpperCase()}`}
                </span>
                {o.createdBy?.name && (
                  <span className={styles.createdBy}>
                    <User size={10} aria-hidden="true" />
                    {o.createdBy.name}
                  </span>
                )}
                <span className={styles.orderDate}>
                  <Calendar size={10} aria-hidden="true" />
                  {new Date(o.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>

              {/* Customer info */}
              {o.customer?.name && (
                <div className={styles.customerRow}>
                  <User size={10} aria-hidden="true" />
                  <span>{o.customer.name}</span>
                  {o.customer.email && (
                    <a
                      href={`mailto:${o.customer.email}`}
                      className={styles.customerEmail}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {o.customer.email}
                    </a>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className={styles.cardFooter}>
                {isDisabled ? (
                  <div className={styles.lockedRow}>
                    <Lock size={12} aria-hidden="true" />
                    <span>Enable inventory to change status</span>
                  </div>
                ) : canManage ? (
                  <select
                    className={`${styles.statusSelect} ${styles[`select_${statusMeta.cls}`]}`}
                    value={o.status}
                    onChange={(e) =>
                      handleStatusChange(
                        o._id,
                        e.target.value,
                        o.status,
                        productId,
                      )
                    }
                    aria-label={`Change status for order ${o.orderNumber || o._id.slice(-6)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ) : (
                  <div
                    className={`${styles.statusReadonly} ${styles[statusMeta.cls]}`}
                    role="status"
                  >
                    {statusMeta.label}
                  </div>
                )}

                {canManage && (
                  <div className={styles.actionBtns}>
                    <motion.button
                      type="button"
                      className={`${styles.iconBtn} ${!hasEmail ? styles.iconBtnDisabled : ""}`}
                      onClick={() =>
                        handleResendInvoice(
                          o._id,
                          o.orderNumber,
                          o.customer?.email,
                        )
                      }
                      disabled={!hasEmail || sendingInvoice === o._id}
                      whileHover={hasEmail ? { scale: 1.1 } : {}}
                      whileTap={hasEmail ? { scale: 0.9 } : {}}
                      aria-label={
                        hasEmail
                          ? `Resend invoice to ${o.customer.email}`
                          : "No customer email"
                      }
                    >
                      {sendingInvoice === o._id ? (
                        <span
                          className={styles.miniSpinner}
                          aria-hidden="true"
                        />
                      ) : (
                        <Send size={12} aria-hidden="true" />
                      )}
                    </motion.button>

                    {isAdmin && (
                      <motion.button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(o._id, o.orderNumber)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Delete order ${o.orderNumber || o._id.slice(-6)}`}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </motion.article>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default OrderList;
