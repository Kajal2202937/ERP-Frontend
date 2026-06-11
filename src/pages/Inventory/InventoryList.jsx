import { useState, useRef, useEffect } from "react";
import {
  updateStock,
  disableInventory,
  enableInventory,
} from "../../services/inventoryService";
import styles from "./InventoryList.module.css";
import { toast } from "../../../utils/toast";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Save, X, ToggleLeft, ToggleRight } from "lucide-react";

const STATE_META = {
  normal: { label: "Normal", cls: "normal" },
  low: { label: "Low", cls: "low" },
  critical: { label: "Critical", cls: "critical" },
  out: { label: "Out", cls: "out" },
};

const getState = (item) => {
  if (item.quantity === 0) return "out";
  const limit = item.lowStockLimit ?? 10;
  if (item.quantity <= Math.floor(limit / 2)) return "critical";
  if (item.quantity <= limit) return "low";
  return "normal";
};

const InventoryList = ({
  data = [],
  refresh,
  selected,
  toggleSelect,
  toggleSelectAll,
  onConfirm,
}) => {
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const qtyInputRef = useRef(null);

  const allSelected = data.length > 0 && selected?.size === data.length;
  const someSelected = selected?.size > 0 && selected.size < data.length;

  const selectAllRef = useRef(null);
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  useEffect(() => {
    if (editId && qtyInputRef.current) {
      qtyInputRef.current.focus();
    }
  }, [editId]);

  const startEdit = (item) => {
    setEditId(item._id);
    setEditData((prev) => ({ ...prev, [item._id]: item.quantity }));
  };

  const cancelEdit = (item) => {
    setEditId(null);
    setEditData((prev) => {
      const u = { ...prev };
      delete u[item._id];
      delete u[item._id + "_limit"];
      return u;
    });
  };

  const handleUpdate = async (item) => {
    const value = editData[item._id];
    if (value === "" || value === undefined || Number(value) < 0)
      return toast.error("Invalid quantity — must be 0 or more");

    try {
      setSavingId(item._id);
      await updateStock({
        productId: item.product._id,
        quantity: Number(value),
        lowStockLimit:
          editData[item._id + "_limit"] !== undefined
            ? Number(editData[item._id + "_limit"])
            : item.lowStockLimit,
      });
      toast.success("Stock updated");
      setEditId(null);
      setEditData((prev) => {
        const u = { ...prev };
        delete u[item._id];
        delete u[item._id + "_limit"];
        return u;
      });
      refresh();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Update failed",
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleToggle = async (item) => {
    if (item.isActive && onConfirm) {
      onConfirm({
        title: `Disable ${item.product?.name}?`,
        message:
          "This item will be hidden from active inventory. You can re-enable it at any time.",
        variant: "warning",
        confirmLabel: "Disable",
        onConfirm: async () => {
          try {
            setTogglingId(item.product._id);
            await disableInventory(item.product._id);
            toast.info("Inventory disabled");
            refresh();
          } catch (err) {
            toast.error(err?.message || "Toggle failed");
          } finally {
            setTogglingId(null);
          }
        },
      });
      return;
    }

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
    } catch (err) {
      toast.error(err?.message || "Toggle failed");
    } finally {
      setTogglingId(null);
    }
  };

  if (data.length === 0) return null;

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table} aria-label="Inventory items">
        <thead>
          <tr>
            <th scope="col" style={{ width: 36 }}>
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                aria-label={allSelected ? "Deselect all items" : "Select all items"}
                style={{ cursor: "pointer" }}
              />
            </th>
            <th scope="col">Product</th>
            <th scope="col">Quantity</th>
            <th scope="col">Low Stock Limit</th>
            <th scope="col">Status</th>
            <th scope="col">Active</th>
            <th scope="col">Actions</th>
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
              const isSelected = selected?.has(item._id);

              return (
                <motion.tr
                  key={item._id}
                  className={[
                    styles.row,
                    !item.isActive ? styles.disabledRow : "",
                    isEditing ? styles.editingRow : "",
                    isSelected ? styles.selectedRow : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  onKeyDown={(e) => {
                    if (isEditing && e.key === "Escape") cancelEdit(item);
                    if (isEditing && e.key === "Enter") handleUpdate(item);
                  }}
                >
                  {/* Checkbox */}
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected || false}
                      onChange={() => toggleSelect(item._id)}
                      aria-label={`Select ${item.product?.name}`}
                      style={{ cursor: "pointer" }}
                    />
                  </td>

                  {/* Product name */}
                  <td>
                    <div className={styles.productCell}>
                      <div
                        className={styles.productDot}
                        style={{
                          background: item.isActive ? "var(--green)" : "var(--text3)",
                        }}
                        aria-hidden="true"
                      />
                      <span className={styles.productName}>
                        {item.product?.name || "—"}
                      </span>
                    </div>
                  </td>

                  {/* Quantity */}
                  <td>
                    {isEditing ? (
                      <input
                        ref={qtyInputRef}
                        type="number"
                        min="0"
                        className={styles.qtyInput}
                        value={editData[item._id] ?? ""}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            [item._id]: e.target.value,
                          }))
                        }
                        aria-label={`Quantity for ${item.product?.name}`}
                      />
                    ) : (
                      <span
                        className={`${styles.qtyValue} ${state === "out" || state === "critical" ? styles.qtyAlert : ""}`}
                      >
                        {item.quantity.toLocaleString()}
                      </span>
                    )}
                  </td>

                  {/* Low stock limit */}
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        className={styles.qtyInput}
                        value={editData[item._id + "_limit"] ?? item.lowStockLimit ?? 10}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            [item._id + "_limit"]: e.target.value,
                          }))
                        }
                        aria-label={`Low stock threshold for ${item.product?.name}`}
                      />
                    ) : (
                      <span className={styles.qtyValue}>
                        {item.lowStockLimit ?? 10}
                      </span>
                    )}
                  </td>

                  {/* Status badge */}
                  <td>
                    <span
                      className={`${styles.badge} ${styles[meta.cls]}`}
                      role="status"
                    >
                      {meta.label}
                    </span>
                  </td>

                  {/* Active pill */}
                  <td>
                    {item.isActive ? (
                      <span className={styles.activePill}>
                        <span className={styles.activeDot} aria-hidden="true" />
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
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.saveBtn}`}
                            onClick={() => handleUpdate(item)}
                            disabled={isSaving}
                            aria-label="Save changes"
                          >
                            {isSaving ? (
                              <span className={styles.spinnerSm} aria-hidden="true" />
                            ) : (
                              <Save size={12} aria-hidden="true" />
                            )}
                          </button>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.cancelBtn}`}
                            disabled={isSaving}
                            onClick={() => cancelEdit(item)}
                            aria-label="Cancel editing"
                          >
                            <X size={12} aria-hidden="true" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            disabled={isToggling}
                            onClick={() => startEdit(item)}
                            aria-label={`Edit ${item.product?.name}`}
                          >
                            <Edit2 size={12} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${item.isActive ? styles.toggleOnBtn : styles.toggleOffBtn}`}
                            onClick={() => handleToggle(item)}
                            disabled={isToggling}
                            aria-label={
                              item.isActive
                                ? `Disable ${item.product?.name}`
                                : `Enable ${item.product?.name}`
                            }
                            aria-pressed={item.isActive}
                          >
                            {isToggling ? (
                              <span className={styles.spinnerSm} aria-hidden="true" />
                            ) : item.isActive ? (
                              <ToggleRight size={14} aria-hidden="true" />
                            ) : (
                              <ToggleLeft size={14} aria-hidden="true" />
                            )}
                          </button>
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