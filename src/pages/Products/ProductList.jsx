import { useState, useEffect } from "react";
import { deleteProduct, updateProduct } from "../../services/productService";
import { getInventory } from "../../services/inventoryService";
import API from "../../services/api";
import styles from "./ProductList.module.css";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit2, FiTrash2, FiSave, FiX, FiAlertTriangle } from "react-icons/fi";

const ProductList = ({ products = [], refresh, setEditData, setShowForm, loading }) => {
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [inventoryMap, setInventoryMap] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    getInventory()
      .then((res) => {
        const map = {};
        (res.data?.data || []).forEach((inv) => {
          if (inv.product?._id) map[inv.product._id] = inv.isActive;
        });
        setInventoryMap(map);
      })
      .catch(() => {});
  }, [products]);

  useEffect(() => {
    API.get("/suppliers")
      .then((res) => setSuppliers(res.data.data || []))
      .catch(() => {});
  }, []);

  const isInventoryDisabled = (id) => id in inventoryMap && inventoryMap[id] === false;

  const handleEdit = (p) => {
    setEditId(p._id);
    setForm({ name: p.name, price: p.price, category: p.category, quantity: p.quantity, supplier: p.supplier?._id || "" });
  };

  const handleUpdate = async (id) => {
    try {
      await updateProduct(id, { ...form, price: Number(form.price), quantity: Number(form.quantity) });
      toast.success("Product updated");
      setEditId(null);
      refresh();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      setDeleteConfirm(null);
      refresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ── SKELETON ── */
  if (loading) {
    return (
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {["Name", "Price", "Category", "Qty", "Supplier", "Status", ""].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className={styles.skeletonRow}>
                {[...Array(7)].map((_, j) => (
                  <td key={j}>
                    <div className={styles.skeleton} style={{ width: j === 6 ? 60 : "80%" }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  /* ── EMPTY ── */
  if (!products.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📦</div>
        <p className={styles.emptyTitle}>No products found</p>
        <p className={styles.emptyDesc}>Try adjusting your search or add a new product.</p>
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
                          <input className={styles.inlineInput} value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </td>
                        <td>
                          <input className={styles.inlineInput} type="number" value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })} />
                        </td>
                        <td>
                          <input className={styles.inlineInput} value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })} />
                        </td>
                        <td>
                          <input className={styles.inlineInput} type="number" value={form.quantity}
                            onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                        </td>
                        <td>
                          <select className={styles.inlineSelect} value={form.supplier}
                            onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
                            <option value="">Select</option>
                            {suppliers.map((s) => (
                              <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                          </select>
                        </td>
                        <td>—</td>
                        <td>
                          <div className={styles.actions}>
                            <motion.button
                              className={`${styles.actionBtn} ${styles.saveBtn}`}
                              onClick={() => handleUpdate(p._id)}
                              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              title="Save"
                            >
                              <FiSave size={14} />
                            </motion.button>
                            <motion.button
                              className={`${styles.actionBtn} ${styles.cancelBtn}`}
                              onClick={() => setEditId(null)}
                              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              title="Cancel"
                            >
                              <FiX size={14} />
                            </motion.button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <span className={styles.productName}>{p.name}</span>
                        </td>
                        <td>
                          <span className={styles.price}>₹{p.price.toLocaleString()}</span>
                        </td>
                        <td>
                          <span className={styles.categoryBadge}>{p.category}</span>
                        </td>
                        <td>
                          <span className={`${styles.qty} ${p.quantity <= 5 ? styles.lowQty : ""}`}>
                            {p.quantity <= 5 && <FiAlertTriangle size={12} />}
                            {p.quantity}
                          </span>
                        </td>
                        <td>
                          <span className={styles.supplierName}>{p.supplier?.name || "—"}</span>
                        </td>
                        <td>
                          {disabled ? (
                            <span className={styles.badgeDisabled}>Inv. Off</span>
                          ) : (
                            <span className={styles.badgeActive}>Available</span>
                          )}
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <motion.button
                              className={`${styles.actionBtn} ${styles.editBtn}`}
                              disabled={disabled}
                              onClick={() => { if (disabled) return; handleEdit(p); setEditData(p); setShowForm(true); }}
                              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              title="Edit"
                            >
                              <FiEdit2 size={14} />
                            </motion.button>
                            <motion.button
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              onClick={() => setDeleteConfirm(p._id)}
                              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              title="Delete"
                            >
                              <FiTrash2 size={14} />
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

      {/* ── DELETE CONFIRM ── */}
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
              <div className={styles.confirmIcon}><FiTrash2 size={20} /></div>
              <h4 className={styles.confirmTitle}>Delete Product?</h4>
              <p className={styles.confirmDesc}>This action cannot be undone.</p>
              <div className={styles.confirmActions}>
                <button className={styles.confirmCancel} onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className={styles.confirmDelete} onClick={() => handleDelete(deleteConfirm)}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductList;