import { useEffect, useState } from "react";
import { updateOrderStatus } from "../../services/OrderService";
import { getInventory } from "../../services/inventoryService";
import styles from "./OrderList.module.css";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

import {
  FiPackage,
  FiAlertTriangle,
  FiUser,
  FiHash,
  FiLock,
} from "react-icons/fi";
import { TbCurrencyRupee } from "react-icons/tb";

const STATUS_COLORS = {
  pending: { label: "Pending", cls: "pending" },
  completed: { label: "Completed", cls: "completed" },
  cancelled: { label: "Cancelled", cls: "cancelled" },
};

const OrderList = ({ orders = [], refresh, loading }) => {
  const [disabledProductIds, setDisabledProductIds] = useState(new Set());

  useEffect(() => {
    getInventory()
      .then((res) => {
        const disabled = new Set(
          (res.data?.data || [])
            .filter((inv) => inv?.isActive === false && inv?.product?._id)
            .map((inv) => inv.product._id),
        );
        setDisabledProductIds(disabled);
      })
      .catch(() => {});
  }, [orders]);

  const handleStatusChange = async (id, status, productId) => {
    if (!productId) return toast.error("Invalid product reference");
    if (disabledProductIds.has(productId))
      return toast.error("Cannot update — inventory is disabled");
    try {
      await updateOrderStatus(id, status);
      toast.success("Status updated");
      refresh?.();
    } catch {
      toast.error("Update failed");
    }
  };

  if (loading) {
    return (
      <div className={styles.grid}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
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
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🛒</div>
        <p className={styles.emptyTitle}>No orders found</p>
        <p className={styles.emptyDesc}>
          Create your first order to get started.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      <AnimatePresence>
        {orders.map((o, i) => {
          const productId = o?.product?._id;
          const isDisabled = disabledProductIds.has(productId);
          const statusMeta = STATUS_COLORS[o.status] || STATUS_COLORS.pending;

          return (
            <motion.div
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
            >
              <AnimatePresence>
                {isDisabled && (
                  <motion.div
                    className={styles.disabledBanner}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <FiAlertTriangle size={12} />
                    <span>Inventory disabled — status locked</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div
                className={`${styles.cardAccent} ${styles[`accent_${statusMeta.cls}`]}`}
              />
              <div className={styles.cardHeader}>
                <div className={styles.productInfo}>
                  <div className={styles.productIconWrap}>
                    <FiPackage size={14} />
                  </div>
                  <div>
                    <p className={styles.productName}>
                      {o.product?.name || "Product"}
                    </p>
                    <p className={styles.supplierName}>
                      <FiUser size={10} />
                      {o.product?.supplier?.name || "No Supplier"}
                    </p>
                  </div>
                </div>
                <div
                  className={`${styles.statusPill} ${styles[statusMeta.cls]}`}
                >
                  {statusMeta.label}
                </div>
              </div>
              <div className={styles.statsRow}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total</span>
                  <span className={styles.statValue}>
                    <TbCurrencyRupee size={13} />
                    {Number(o.totalPrice).toLocaleString()}
                  </span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Qty</span>
                  <span className={styles.statValue}>
                    <FiHash size={11} />
                    {o.quantity}
                  </span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Order ID</span>
                  <span className={styles.statId}>
                    #{o._id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className={styles.cardFooter}>
                {isDisabled ? (
                  <div className={styles.lockedRow}>
                    <FiLock size={12} />
                    <span>Enable inventory to change status</span>
                  </div>
                ) : (
                  <select
                    id={`order-status-${o._id}`}
                    name="orderStatus"
                    className={`${styles.statusSelect} ${styles[`select_${statusMeta.cls}`]}`}
                    value={o.status}
                    onChange={(e) =>
                      handleStatusChange(o._id, e.target.value, productId)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default OrderList;
