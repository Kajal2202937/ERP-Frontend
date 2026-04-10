import { useState } from "react";
import {
  updateStock, disableInventory, enableInventory,
} from "../../services/inventoryService";
import styles from "./InventoryList.module.css";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

import {
  FiEdit2, FiSave, FiX, FiToggleLeft, FiToggleRight,
} from "react-icons/fi";

const STATE_META = {
  normal:   { label: "Normal",   cls: "normal"   },
  low:      { label: "Low",      cls: "low"      },
  critical: { label: "Critical", cls: "critical" },
  out:      { label: "Out",      cls: "out"      },
};

const getState = (item) => {
  if (item.quantity === 0) return "out";
  if (item.quantity <= item.lowStockLimit / 2) return "critical";
  if (item.quantity <= item.lowStockLimit) return "low";
  return "normal";
};

const InventoryList = ({ data = [], refresh }) => {
  const [editId, setEditId]     = useState(null);
  const [editData, setEditData] = useState({});
  const [savingId, setSavingId]     = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const handleUpdate = async (item) => {
    const value = editData[item._id];
    if (value === "" || value === undefined || Number(value) < 0)
      return toast.error("Invalid quantity");

    try {
      setSavingId(item._id);
      await updateStock({ productId: item.product._id, quantity: Number(value) });
      toast.success("Stock updated");
      setEditId(null);
      setEditData((prev) => { const u = { ...prev }; delete u[item._id]; return u; });
      refresh();
    } catch {
      toast.error("Update failed");
    } finally {
      setSavingId(null);
    }
  };

  const handleDisable = async (item) => {
    if (!item.isActive) return;
    try {
      setTogglingId(item.product._id);
      await disableInventory(item.product._id);
      toast.info("Inventory disabled");
      refresh();
    } catch {
      toast.error("Disable failed");
    } finally {
      setTogglingId(null);
    }
  };

  const handleEnable = async (item) => {
    if (item.isActive) return;
    try {
      setTogglingId(item.product._id);
      await enableInventory(item.product._id);
      toast.success("Inventory enabled");
      refresh();
    } catch {
      toast.error("Enable failed");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Stock Status</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {data.map((item, i) => {
              const state      = getState(item);
              const meta       = STATE_META[state];
              const isSaving   = savingId   === item._id;
              const isToggling = togglingId === item.product._id;
              const isEditing  = editId     === item._id;

              return (
                <motion.tr
                  key={item._id}
                  className={`${styles.row} ${!item.isActive ? styles.disabledRow : ""} ${isEditing ? styles.editingRow : ""}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                >
                  {/* Product */}
                  <td>
                    <div className={styles.productCell}>
                      <div className={styles.productDot} style={{ background: item.isActive ? "#4ade80" : "#6b7280" }} />
                      <span className={styles.productName}>{item.product?.name || "—"}</span>
                    </div>
                  </td>

                  {/* Quantity */}
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        className={styles.qtyInput}
                        value={editData[item._id] ?? ""}
                        onChange={(e) =>
                          setEditData((prev) => ({ ...prev, [item._id]: e.target.value }))
                        }
                        autoFocus
                      />
                    ) : (
                      <span className={`${styles.qtyValue} ${state === "out" || state === "critical" ? styles.qtyAlert : ""}`}>
                        {item.quantity.toLocaleString()}
                      </span>
                    )}
                  </td>

                  {/* Status badge */}
                  <td>
                    <span className={`${styles.badge} ${styles[meta.cls]}`}>
                      {meta.label}
                    </span>
                  </td>

                  {/* Active */}
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

                  {/* Actions */}
                  <td>
                    <div className={styles.actions}>
                      {isEditing ? (
                        <>
                          <motion.button
                            className={`${styles.actionBtn} ${styles.saveBtn}`}
                            onClick={() => handleUpdate(item)}
                            disabled={isSaving}
                            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                            title="Save"
                          >
                            {isSaving ? <span className={styles.spinner} /> : <FiSave size={13} />}
                          </motion.button>
                          <motion.button
                            className={`${styles.actionBtn} ${styles.cancelBtn}`}
                            disabled={isSaving}
                            onClick={() => {
                              setEditId(null);
                              setEditData((prev) => { const u = { ...prev }; delete u[item._id]; return u; });
                            }}
                            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                            title="Cancel"
                          >
                            <FiX size={13} />
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            disabled={isToggling}
                            onClick={() => {
                              setEditId(item._id);
                              setEditData((prev) => ({ ...prev, [item._id]: item.quantity }));
                            }}
                            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                            title="Edit quantity"
                          >
                            <FiEdit2 size={13} />
                          </motion.button>

                          {item.isActive ? (
                            <motion.button
                              className={`${styles.actionBtn} ${styles.toggleOnBtn}`}
                              onClick={() => handleDisable(item)}
                              disabled={isToggling}
                              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              title="Disable inventory"
                            >
                              {isToggling
                                ? <span className={styles.spinnerSm} />
                                : <FiToggleRight size={16} />
                              }
                            </motion.button>
                          ) : (
                            <motion.button
                              className={`${styles.actionBtn} ${styles.toggleOffBtn}`}
                              onClick={() => handleEnable(item)}
                              disabled={isToggling}
                              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              title="Enable inventory"
                            >
                              {isToggling
                                ? <span className={styles.spinnerSm} />
                                : <FiToggleLeft size={16} />
                              }
                            </motion.button>
                          )}
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