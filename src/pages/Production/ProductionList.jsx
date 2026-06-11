import { useState as useStateP } from "react";
import {
  updateProduction,
  deleteProduction,
} from "../../services/ProductionService";
import { toast } from "../../../utils/toast";
import { motion as motionP, AnimatePresence as AP } from "framer-motion";
import stylesP from "./ProductionList.module.css";
import { FiEdit2, FiTrash2, FiSave, FiX } from "react-icons/fi";

const STATUS_META = {
  started: { label: "Started", cls: "started" },
  "in-progress": { label: "In Progress", cls: "inprogress" },
  completed: { label: "Completed", cls: "completed" },
};

export const ProductionListComponent = ({ data, refresh }) => {
  const [editId, setEditId] = useStateP(null);
  const [editStatus, setEditStatus] = useStateP("");
  const [deleteConfirm, setDeleteConfirm] = useStateP(null);

  const startEdit = (p) => {
    setEditId(p._id);
    setEditStatus(p.status);
  };

  const handleUpdate = async (id) => {
    if (!editStatus) return toast.warning("Select a status");
    try {
      await updateProduction(id, { status: editStatus });
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
      <div className={stylesP.empty}>
        <div className={stylesP.emptyIcon}>🏭</div>
        <p className={stylesP.emptyTitle}>No production runs</p>
        <p className={stylesP.emptyDesc}>Create a new run to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className={stylesP.tableWrap}>
        <table className={stylesP.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty Produced</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AP>
              {data.map((p, i) => {
                const isEditing = editId === p._id;
                const meta = STATUS_META[p.status] || STATUS_META["started"];
                return (
                  <motionP.tr
                    key={p._id}
                    className={`${stylesP.row} ${isEditing ? stylesP.editingRow : ""}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                  >
                    <td>
                      <span className={stylesP.productName}>
                        {p.product?.name || "—"}
                      </span>
                    </td>
                    <td>
                      <span className={stylesP.qty}>
                        {p.quantityProduced.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          className={stylesP.inlineSelect}
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                        >
                          <option value="started">Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <span
                          className={`${stylesP.badge} ${stylesP[meta.cls]}`}
                        >
                          {meta.label}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className={stylesP.actions}>
                        {isEditing ? (
                          <>
                            <motionP.button
                              className={`${stylesP.actionBtn} ${stylesP.saveBtn}`}
                              onClick={() => handleUpdate(p._id)}
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.92 }}
                              title="Save"
                            >
                              <FiSave size={13} />
                            </motionP.button>
                            <motionP.button
                              className={`${stylesP.actionBtn} ${stylesP.cancelBtn}`}
                              onClick={() => setEditId(null)}
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.92 }}
                              title="Cancel"
                            >
                              <FiX size={13} />
                            </motionP.button>
                          </>
                        ) : (
                          <>
                            <motionP.button
                              className={`${stylesP.actionBtn} ${stylesP.editBtn}`}
                              onClick={() => startEdit(p)}
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.92 }}
                              title="Edit"
                            >
                              <FiEdit2 size={13} />
                            </motionP.button>
                            <motionP.button
                              className={`${stylesP.actionBtn} ${stylesP.deleteBtn}`}
                              onClick={() => setDeleteConfirm(p._id)}
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.92 }}
                              title="Delete"
                            >
                              <FiTrash2 size={13} />
                            </motionP.button>
                          </>
                        )}
                      </div>
                    </td>
                  </motionP.tr>
                );
              })}
            </AP>
          </tbody>
        </table>
      </div>

      <AP>
        {deleteConfirm && (
          <motionP.div
            className={stylesP.confirmOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motionP.div
              className={stylesP.confirmBox}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={stylesP.confirmIcon}>
                <FiTrash2 size={20} />
              </div>
              <h4 className={stylesP.confirmTitle}>Delete Production Run?</h4>
              <p className={stylesP.confirmDesc}>
                This action cannot be undone.
              </p>
              <div className={stylesP.confirmActions}>
                <button
                  className={stylesP.confirmCancel}
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className={stylesP.confirmDelete}
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  Delete
                </button>
              </div>
            </motionP.div>
          </motionP.div>
        )}
      </AP>
    </>
  );
};

export default ProductionListComponent;
