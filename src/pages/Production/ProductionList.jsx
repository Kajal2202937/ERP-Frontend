import { useState } from "react";
import { updateProduction, deleteProduction } from "../../services/ProductionService";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ProductionList.module.css";

import { FiEdit2, FiTrash2, FiSave, FiX } from "react-icons/fi";

const STATUS_META = {
  "started":     { label: "Started",     cls: "started"    },
  "in-progress": { label: "In Progress", cls: "inprogress" },
  "completed":   { label: "Completed",   cls: "completed"  },
};

const ProductionList = ({ data, refresh }) => {
  const [editId, setEditId] = useState(null);
  const [status, setStatus] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleUpdate = async (id) => {
    if (!status) return toast.warning("Select a status");
    try {
      await updateProduction(id, { status });
      toast.success("Status updated");
      setEditId(null);
      refresh();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduction(id);
      toast.success("Production deleted");
      setDeleteConfirm(null);
      refresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  if (!data.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🏭</div>
        <p className={styles.emptyTitle}>No production runs</p>
        <p className={styles.emptyDesc}>Create a new run to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty Produced</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {data.map((p, i) => {
                const isEditing = editId === p._id;
                const meta = STATUS_META[p.status] || STATUS_META["started"];
                return (
                  <motion.tr
                    key={p._id}
                    className={`${styles.row} ${isEditing ? styles.editingRow : ""}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                  >
                    <td>
                      <span className={styles.productName}>{p.product?.name || "—"}</span>
                    </td>

                    <td>
                      <span className={styles.qty}>{p.quantityProduced.toLocaleString()}</span>
                    </td>

                    <td>
                      {isEditing ? (
                        <select
                          className={styles.inlineSelect}
                          defaultValue={p.status}
                          onChange={(e) => setStatus(e.target.value)}
                        >
                          <option value="started">Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <span className={`${styles.badge} ${styles[meta.cls]}`}>
                          {meta.label}
                        </span>
                      )}
                    </td>

                    <td>
                      <div className={styles.actions}>
                        {isEditing ? (
                          <>
                            <motion.button
                              className={`${styles.actionBtn} ${styles.saveBtn}`}
                              onClick={() => handleUpdate(p._id)}
                              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              title="Save"
                            >
                              <FiSave size={13} />
                            </motion.button>
                            <motion.button
                              className={`${styles.actionBtn} ${styles.cancelBtn}`}
                              onClick={() => setEditId(null)}
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
                              onClick={() => { setEditId(p._id); setStatus(p.status); }}
                              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              title="Edit"
                            >
                              <FiEdit2 size={13} />
                            </motion.button>
                            <motion.button
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              onClick={() => setDeleteConfirm(p._id)}
                              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              title="Delete"
                            >
                              <FiTrash2 size={13} />
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

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div className={styles.confirmOverlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirm(null)}>
            <motion.div className={styles.confirmBox}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}>
              <div className={styles.confirmIcon}><FiTrash2 size={20} /></div>
              <h4 className={styles.confirmTitle}>Delete Production Run?</h4>
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

export default ProductionList;