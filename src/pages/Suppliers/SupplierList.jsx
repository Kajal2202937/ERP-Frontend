import { useState, useEffect } from "react";
import {
  deleteSupplier,
  updateSupplier,
  toggleSupplierStatus,
} from "../../services/SupplierService";
import styles from "./SupplierList.module.css";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit2, FiTrash2, FiSave, FiX } from "react-icons/fi";
import API from "../../services/api";

/* ── Deterministic avatar color using CSS variables ── */
const AVATAR_PALETTE = [
  { bg: "rgba(108,116,240,0.12)", color: "#8b91f5" },
  { bg: "rgba(62,207,142,0.12)", color: "#3ecf8e" },
  { bg: "rgba(240,168,85,0.12)", color: "#f0a855" },
  { bg: "rgba(77,168,245,0.12)", color: "#4da8f5" },
  { bg: "rgba(248,113,113,0.12)", color: "#f87171" },
  { bg: "rgba(167,139,250,0.12)", color: "#a78bfa" },
];

const getAvatarStyle = (name = "") => {
  const idx =
    (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
};

const initials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const SupplierList = ({
  data = [],
  refresh,
  loading,
  selected,
  setSelected,
}) => {
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [productStats, setProductStats] = useState({});

  useEffect(() => {
    API.get("/products")
      .then((res) => {
        const map = {};

        (res?.data?.data || []).forEach((p) => {
          // ✅ ONLY FIX ADDED HERE
          const sid = p?.supplier?._id || p?.supplier;

          if (!sid) return;

          if (!map[sid]) {
            map[sid] = {
              count: 0,
              qty: 0,
              value: 0, // selling value
              costValue: 0, // inventory value
              profit: 0,
            };
          }

          const qty = Number(p.quantity) || 0;
          const price = Number(p.price) || 0;
          const cost = Number(p.costPrice) || 0;

          map[sid].count += 1;
          map[sid].qty += qty;

          // selling value
          map[sid].value += price * qty;

          // cost value
          map[sid].costValue += cost * qty;

          // profit
          map[sid].profit += (price - cost) * qty;
        });

        setProductStats(map);
      })
      .catch((err) => {
        console.error("Product stats error:", err);
      });
  }, [data]);

  const toggleAll = () =>
    setSelected(selected.length === data.length ? [] : data.map((d) => d._id));

  const toggleRow = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeletingId(deleteTarget);
      await deleteSupplier(deleteTarget);
      toast.success("Supplier deleted");
      setDeleteTarget(null);
      refresh();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdate = async (id) => {
    if (!editForm.name?.trim()) return toast.error("Name is required");
    if (!editForm.email?.trim()) return toast.error("Email is required");

    try {
      setSavingId(id);
      await updateSupplier(id, editForm);
      toast.success("Supplier updated");
      setEditId(null);
      setEditForm({});
      refresh();
    } catch {
      toast.error("Update failed");
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setTogglingId(id);
      await toggleSupplierStatus(id);
      toast.success("Status updated");
      refresh();
    } catch {
      toast.error("Status update failed");
    } finally {
      setTogglingId(null);
    }
  };

  const startEdit = (s) => {
    setEditId(s._id);
    setEditForm({
      name: s.name,
      company: s.company,
      email: s.email,
      phone: s.phone,
    });
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className={styles.skeletonWrap}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={styles.skeletonRow}>
            {[5, 18, 14, 18, 12, 8, 8, 10, 8, 8].map((w, j) => (
              <div
                key={j}
                className={styles.skeletonCell}
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  /* ── Empty ── */
  if (!data.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>👥</div>
        <p className={styles.emptyTitle}>No suppliers found</p>
        <p className={styles.emptyDesc}>
          Add your first supplier to get started.
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
              <th>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={selected.length === data.length && data.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th>Supplier</th>
              <th>Company</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Products</th>
              <th>Stock</th>
              <th>Value</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence>
              {data.map((s, i) => {
                const isEdit = editId === s._id;
                const isSaving = savingId === s._id;
                const isToggling = togglingId === s._id;
                const isSel = selected.includes(s._id);
                const av = getAvatarStyle(s.name);
                const pStats = productStats[s._id];

                return (
                  <motion.tr
                    key={s._id}
                    className={`${styles.row} ${
                      isSel ? styles.selectedRow : ""
                    } ${!s.active ? styles.inactiveRow : ""} ${
                      isEdit ? styles.editingRow : ""
                    }`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                  >
                    <td>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={isSel}
                        onChange={() => toggleRow(s._id)}
                      />
                    </td>

                    {isEdit ? (
                      <>
                        <td>
                          <input
                            className={styles.editInput}
                            value={editForm.name || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                name: e.target.value,
                              })
                            }
                            placeholder="Name"
                            autoFocus
                          />
                        </td>

                        <td>
                          <input
                            className={styles.editInput}
                            value={editForm.company || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                company: e.target.value,
                              })
                            }
                            placeholder="Company"
                          />
                        </td>

                        <td>
                          <input
                            className={styles.editInput}
                            value={editForm.email || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                email: e.target.value,
                              })
                            }
                            placeholder="Email"
                          />
                        </td>

                        <td>
                          <input
                            className={styles.editInput}
                            value={editForm.phone || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                phone: e.target.value,
                              })
                            }
                            placeholder="Phone"
                          />
                        </td>

                        <td colSpan={3} className={styles.editPlaceholder}>
                          —
                        </td>

                        <td />

                        <td>
                          <div className={styles.actions}>
                            <motion.button
                              className={`${styles.actionBtn} ${styles.saveBtn}`}
                              onClick={() => handleUpdate(s._id)}
                              disabled={isSaving}
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
                                setEditForm({});
                              }}
                              disabled={isSaving}
                            >
                              <FiX size={13} />
                            </motion.button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <div className={styles.nameCell}>
                            <div
                              className={styles.avatar}
                              style={{
                                background: av.bg,
                                color: av.color,
                              }}
                            >
                              {initials(s.name)}
                            </div>
                            <span className={styles.supplierName}>
                              {s.name}
                            </span>
                          </div>
                        </td>

                        <td>{s.company}</td>
                        <td>{s.email}</td>
                        <td>{s.phone}</td>

                        <td>{pStats?.count ?? 0}</td>
                        <td>{(pStats?.qty ?? 0).toLocaleString()}</td>

                        <td>
                          Cost: ₹
                          {(pStats?.costValue ?? 0).toLocaleString("en-IN")}
                          <br />
                          Sell: ₹{(pStats?.value ?? 0).toLocaleString("en-IN")}
                        </td>

                        <td>
                          <button
                            className={`${styles.statusPill} ${
                              s.active ? styles.pillActive : styles.pillInactive
                            }`}
                            onClick={() => handleToggleStatus(s._id)}
                            disabled={isToggling}
                          >
                            {s.active ? "Active" : "Inactive"}
                          </button>
                        </td>

                        <td>
                          <div className={styles.actions}>
                            <motion.button
                              className={`${styles.actionBtn} ${styles.editBtn}`}
                              onClick={() => startEdit(s)}
                            >
                              <FiEdit2 size={13} />
                            </motion.button>

                            <motion.button
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              onClick={() => setDeleteTarget(s._id)}
                              disabled={deletingId === s._id}
                            >
                              {deletingId === s._id ? (
                                <span className={styles.spinnerSm} />
                              ) : (
                                <FiTrash2 size={13} />
                              )}
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

      {/* ── Delete confirm ── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className={styles.confirmOverlay}
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              className={styles.confirmBox}
              onClick={(e) => e.stopPropagation()}
            >
              <h4>Delete supplier?</h4>

              <div className={styles.confirmActions}>
                <button onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button onClick={handleDelete}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupplierList;
