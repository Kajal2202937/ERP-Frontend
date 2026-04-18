import { useState } from "react";
import {
  deleteSupplier,
  updateSupplier,
  toggleSupplierStatus,
} from "../../services/SupplierService";
import styles from "./SupplierList.module.css";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

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

  if (loading) {
    return <div className={styles.skeletonWrap}>Loading...</div>;
  }

  if (!data.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyTitle}>No suppliers found</div>
        <div className={styles.emptyDesc}>Add your first supplier</div>
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
                  checked={selected.length === data.length}
                  onChange={toggleAll}
                />
              </th>
              <th>Supplier</th>
              <th>Company</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Stock</th>
              <th>Value</th>
              <th>Status</th>
              <th>Alerts</th>
              <th>Score</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence>
              {data.map((s) => {
                const pStats = s.stats || {};

                const score =
                  (pStats.qty > 0 ? 40 : 0) +
                  (pStats.lowStock === 0 ? 30 : 10) +
                  (pStats.profit > 0 ? 30 : 0);

                return (
                  <motion.tr
                    key={s._id}
                    layout
                    className={`${styles.row} ${
                      selected.includes(s._id) ? styles.selectedRow : ""
                    } ${!s.active ? styles.inactiveRow : ""} ${
                      editId === s._id ? styles.editingRow : ""
                    }`}
                  >
                    <td>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={selected.includes(s._id)}
                        onChange={() => toggleRow(s._id)}
                      />
                    </td>

                    <td>
                      <div className={styles.nameCell}>
                        <div
                          className={styles.avatar}
                          style={getAvatarStyle(s.name)}
                        >
                          {initials(s.name)}
                        </div>

                        {editId === s._id ? (
                          <input
                            className={styles.editInput}
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                name: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <span className={styles.supplierName}>{s.name}</span>
                        )}
                      </div>
                    </td>

                    <td>
                      {editId === s._id ? (
                        <input
                          className={styles.editInput}
                          value={editForm.company}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              company: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <span className={styles.company}>{s.company}</span>
                      )}
                    </td>

                    <td>
                      {editId === s._id ? (
                        <input
                          className={styles.editInput}
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              email: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <span className={styles.email}>{s.email}</span>
                      )}
                    </td>

                    <td>
                      {editId === s._id ? (
                        <input
                          className={styles.editInput}
                          value={editForm.phone}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              phone: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <span className={styles.phone}>{s.phone}</span>
                      )}
                    </td>

                    <td className={styles.numCell}>
                      {(pStats.qty || 0).toLocaleString()}
                    </td>

                    <td className={styles.valCell}>
                      ₹{(pStats.value || 0).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <button
                        className={`${styles.statusPill} ${
                          s.active ? styles.pillActive : styles.pillInactive
                        }`}
                        onClick={() => handleToggleStatus(s._id)}
                        disabled={togglingId === s._id}
                      >
                        <span className={styles.pillDot}></span>
                        {togglingId === s._id
                          ? "..."
                          : s.active
                            ? "Active"
                            : "Inactive"}
                      </button>
                    </td>

                    <td>
                      {pStats.lowStock > 0 && (
                        <span className={styles.numCell}>
                          ⚠ {pStats.lowStock}
                        </span>
                      )}
                      {pStats.outOfStock > 0 && (
                        <span className={styles.numCell}>
                          ❌ {pStats.outOfStock}
                        </span>
                      )}
                    </td>

                    <td className={styles.numCell}>{score}/100</td>

                    <td>
                      <div className={styles.actions}>
                        {editId === s._id ? (
                          <>
                            <button
                              className={`${styles.actionBtn} ${styles.saveBtn}`}
                              onClick={() => handleUpdate(s._id)}
                              disabled={savingId === s._id}
                            >
                              {savingId === s._id ? (
                                <span className={styles.spinnerSm}></span>
                              ) : (
                                "✓"
                              )}
                            </button>

                            <button
                              className={`${styles.actionBtn} ${styles.cancelBtn}`}
                              onClick={() => setEditId(null)}
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className={`${styles.actionBtn} ${styles.editBtn}`}
                              onClick={() => startEdit(s)}
                            >
                              ✎
                            </button>

                            <button
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              onClick={() => setDeleteTarget(s._id)}
                            >
                              🗑
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

      {deleteTarget && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmBox}>
            <div className={styles.confirmTitle}>Delete supplier?</div>
            <div className={styles.confirmDesc}>
              This action cannot be undone.
            </div>

            <div className={styles.confirmActions}>
              <button
                className={styles.confirmCancel}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmDelete}
                onClick={handleDelete}
                disabled={deletingId === deleteTarget}
              >
                {deletingId === deleteTarget ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupplierList;
