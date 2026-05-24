import { useState, useEffect } from "react";
import { deleteProduct, updateProduct } from "../../services/ProductService";
import { getInventory } from "../../services/inventoryService";
import API from "../../services/api";
import styles from "./ProductList.module.css";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
  FiAlertTriangle,
} from "react-icons/fi";

const EMPTY_FORM = {
  name: "",
  price: "",
  costPrice: "",
  category: "",
  quantity: "",
  supplier: "",
};

const ProductList = ({
  products = [],
  refresh,
  setEditData,
  setShowForm,
  loading,
}) => {
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [inventoryMap, setInventoryMap] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    getInventory()
      .then((res) => {
        const map = {};
        (res.data?.data || []).forEach((inv) => {
          if (inv.product?._id) {
            map[inv.product._id] = {
              isActive: inv.isActive,
              quantity: inv.quantity ?? 0,
            };
          }
        });
        setInventoryMap(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    API.get("/suppliers")
      .then((res) => {
        const list = res?.data?.data?.data || [];
        setSuppliers(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        setSuppliers([]);
      });
  }, []);

  const isInventoryDisabled = (id) =>
    id in inventoryMap && inventoryMap[id].isActive === false;

  const handleEdit = (p) => {
    setEditId(p._id);
    setForm({
      name: p.name || "",
      price: p.price ?? "",
      costPrice: p.costPrice ?? 0,
      category: p.category || "",
      quantity: inventoryMap[p._id]?.quantity ?? 0,
      supplier: p.supplier?._id || "",
    });
  };

  const handleUpdate = async (id) => {
    try {
      setSavingId(id);
      await updateProduct(id, {
        ...form,
        price: Number(form.price) || 0,
        costPrice: Number(form.costPrice) || 0,
        quantity: Number(form.quantity) || 0,
        supplier: form.supplier || null,
      });
      toast.success("Product updated");
      setEditId(null);
      setForm(EMPTY_FORM);
      refresh();
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      setDeleteConfirm(null);
      refresh();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {[
                "Name",
                "Price",
                "Cost",
                "Category",
                "Qty",
                "Supplier",
                "Status",
                "",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className={styles.skeletonRow}>
                {[...Array(8)].map((_, j) => (
                  <td key={j}>
                    <div
                      className={styles.skeleton}
                      style={{ width: j === 7 ? 60 : `${55 + j * 8}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📦</div>
        <p className={styles.emptyTitle}>No products found</p>
        <p className={styles.emptyDesc}>
          Try adjusting your search or add a new product.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Cost</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {products.map((p, i) => {
                const disabled = isInventoryDisabled(p._id);
                const isEditing = editId === p._id;
                const isSaving = savingId === p._id;

                return (
                  <motion.tr
                    key={p._id}
                    className={`${styles.row} ${disabled ? styles.disabledRow : ""} ${isEditing ? styles.editingRow : ""}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                  >
                    {isEditing ? (
                      <>
                        <td>
                          <input
                            className={styles.inlineInput}
                            value={form.name}
                            onChange={(e) =>
                              setForm({ ...form, name: e.target.value })
                            }
                            autoFocus
                          />
                        </td>
                        <td>
                          <input
                            className={styles.inlineInput}
                            type="number"
                            value={form.price}
                            onChange={(e) =>
                              setForm({ ...form, price: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <input
                            className={styles.inlineInput}
                            type="number"
                            value={form.costPrice}
                            onChange={(e) =>
                              setForm({ ...form, costPrice: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <input
                            className={styles.inlineInput}
                            value={form.category}
                            onChange={(e) =>
                              setForm({ ...form, category: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <input
                            className={styles.inlineInput}
                            type="number"
                            value={form.quantity}
                            onChange={(e) =>
                              setForm({ ...form, quantity: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <select
                            className={styles.inlineSelect}
                            value={form.supplier}
                            onChange={(e) =>
                              setForm({ ...form, supplier: e.target.value })
                            }
                          >
                            <option value="">Select…</option>
                            {suppliers.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>—</td>
                        <td>
                          <div className={styles.actions}>
                            <motion.button
                              className={`${styles.actionBtn} ${styles.saveBtn}`}
                              onClick={() => handleUpdate(p._id)}
                              disabled={isSaving}
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.92 }}
                            >
                              {isSaving ? (
                                <span className={styles.spinnerSm} />
                              ) : (
                                <FiSave size={13} />
                              )}
                            </motion.button>
                            <motion.button
                              className={`${styles.actionBtn} ${styles.cancelBtn}`}
                              onClick={() => {
                                setEditId(null);
                                setForm(EMPTY_FORM);
                              }}
                              disabled={isSaving}
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.92 }}
                            >
                              <FiX size={13} />
                            </motion.button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <span className={styles.productName}>{p.name}</span>
                          {p.sku && (
                            <span className={styles.skuTag}>{p.sku}</span>
                          )}
                        </td>
                        <td>₹{p.price.toLocaleString("en-IN")}</td>
                        <td>₹{p.costPrice?.toLocaleString("en-IN") || 0}</td>
                        <td>{p.category}</td>
                        <td>
                          <span
                            className={`${styles.qty} ${(inventoryMap[p._id]?.quantity ?? 0) <= 5 ? styles.lowQty : ""}`}
                          >
                            {(inventoryMap[p._id]?.quantity ?? 0) <= 5 && (
                              <FiAlertTriangle size={11} />
                            )}
                            {(
                              inventoryMap[p._id]?.quantity ?? 0
                            ).toLocaleString()}
                          </span>
                        </td>
                        <td>{p.supplier?.name || "—"}</td>
                        <td>
                          {disabled ? (
                            <span className={styles.badgeDisabled}>
                              Inv. Off
                            </span>
                          ) : (
                            <span className={styles.badgeActive}>
                              Available
                            </span>
                          )}
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <motion.button
                              className={`${styles.actionBtn} ${styles.editBtn}`}
                              disabled={disabled}
                              onClick={() => {
                                if (disabled) return;
                                handleEdit(p);
                                setEditData(p);
                              }}
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.92 }}
                            >
                              <FiEdit2 size={13} />
                            </motion.button>
                            <motion.button
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              onClick={() => setDeleteConfirm(p._id)}
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.92 }}
                            >
                              <FiTrash2 size={13} />
                            </motion.button>
                          </div>
                        </td>
                      </>
                    )}
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* ✅ Fixed: delete confirm now uses proper CSS classes */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className={styles.confirmOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              className={styles.confirmBox}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.confirmIcon}>
                <FiTrash2 size={20} />
              </div>
              <h4 className={styles.confirmTitle}>Delete Product?</h4>
              <p className={styles.confirmDesc}>
                This action cannot be undone.
              </p>
              <div className={styles.confirmActions}>
                <button
                  className={styles.confirmCancel}
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmDelete}
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductList;
