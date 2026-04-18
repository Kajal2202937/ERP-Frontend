import { useState } from "react";
import {
  updateStock,
  disableInventory,
  enableInventory,
} from "../../services/inventoryService";
import styles from "./InventoryList.module.css";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit2,
  FiSave,
  FiX,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";

const STATE_META = {
  normal: { label: "Normal", cls: "normal" },
  low: { label: "Low", cls: "low" },
  critical: { label: "Critical", cls: "critical" },
  out: { label: "Out", cls: "out" },
};

const getState = (item) => {
  if (item.quantity === 0) return "out";
  if (item.quantity <= (item.lowStockLimit ?? 5) / 2) return "critical";
  if (item.quantity <= (item.lowStockLimit ?? 10)) return "low";
  return "normal";
};

const InventoryList = ({ data = [], refresh }) => {
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const handleUpdate = async (item) => {
    const value = editData[item._id];
    if (value === "" || value === undefined || Number(value) < 0)
      return toast.error("Invalid quantity");

    try {
      setSavingId(item._id);
      await updateStock({
        productId: item.product._id,
        quantity: Number(value),
      });
      toast.success("Stock updated");
      setEditId(null);
      setEditData((prev) => {
        const u = { ...prev };
        delete u[item._id];
        return u;
      });
      refresh();
    } catch {
      toast.error("Update failed");
    } finally {
      setSavingId(null);
    }
  };

  const handleToggle = async (item) => {
    try {
      setTogglingId(item.product._id);
      if (item.isActive) {
        await disableInventory(item.product._id);
        toast.info("Inventory disabled");
      } else {
        await enableInventory(item.product._id);
        toast.success("Inventory enabled");
      }
      refresh();
    } catch {
      toast.error("Toggle failed");
    } finally {
      setTogglingId(null);
    }
  };

  if (data.length === 0) return null;

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <AnimatePresence>
            {data.map((item, i) => {
              const state = getState(item);
              const meta = STATE_META[state];
              const isSaving = savingId === item._id;
              const isToggling = togglingId === item.product._id;
              const isEditing = editId === item._id;

              return (
                <motion.tr
                  key={item._id}
                  className={`${styles.row}
                    ${!item.isActive ? styles.disabledRow : ""}
                    ${isEditing ? styles.editingRow : ""}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                >
                  <td>
                    <div className={styles.productCell}>
                      <div
                        className={styles.productDot}
                        style={{
                          background: item.isActive
                            ? "var(--green)"
                            : "var(--text3)",
                        }}
                      />
                      <span className={styles.productName}>
                        {item.product?.name || "—"}
                      </span>
                    </div>
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        id={`qty-${item._id}`}
                        name="quantity"
                        min="0"
                        className={styles.qtyInput}
                        value={editData[item._id] ?? ""}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            [item._id]: e.target.value,
                          }))
                        }
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`${styles.qtyValue}
                        ${
                          state === "out" || state === "critical"
                            ? styles.qtyAlert
                            : ""
                        }`}
                      >
                        {item.quantity.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[meta.cls]}`}>
                      {meta.label}
                    </span>
                  </td>
                  <td>
                    {item.isActive ? (
                      <span className={styles.activePill}>
                        <span className={styles.activeDot} />
                        Active
                      </span>
                    ) : (
                      <span className={styles.disabledPill}>Disabled</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {isEditing ? (
                        <>
                          <motion.button
                            className={`${styles.actionBtn} ${styles.saveBtn}`}
                            onClick={() => handleUpdate(item)}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <span className={styles.spinnerSm} />
                            ) : (
                              <FiSave size={12} />
                            )}
                          </motion.button>

                          <motion.button
                            className={`${styles.actionBtn} ${styles.cancelBtn}`}
                            disabled={isSaving}
                            onClick={() => {
                              setEditId(null);
                              setEditData((prev) => {
                                const u = { ...prev };
                                delete u[item._id];
                                return u;
                              });
                            }}
                          >
                            <FiX size={12} />
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            disabled={isToggling}
                            onClick={() => {
                              setEditId(item._id);
                              setEditData((prev) => ({
                                ...prev,
                                [item._id]: item.quantity,
                              }));
                            }}
                          >
                            <FiEdit2 size={12} />
                          </motion.button>

                          <motion.button
                            className={`${styles.actionBtn}
                              ${
                                item.isActive
                                  ? styles.toggleOnBtn
                                  : styles.toggleOffBtn
                              }`}
                            onClick={() => handleToggle(item)}
                            disabled={isToggling}
                          >
                            {isToggling ? (
                              <span className={styles.spinnerSm} />
                            ) : item.isActive ? (
                              <FiToggleRight size={14} />
                            ) : (
                              <FiToggleLeft size={14} />
                            )}
                          </motion.button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

export default InventoryList;
