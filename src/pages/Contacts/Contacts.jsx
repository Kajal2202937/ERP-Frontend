import { useEffect, useState } from "react";
import styles from "./Contacts.module.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiTrash2,
  FiRefreshCw,
  FiMessageSquare,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { getAllMessages, deleteMessage } from "../../services/contactService";

/* ── Delete confirm modal ── */
const DeleteConfirm = ({ onConfirm, onCancel }) => (
  <motion.div
    className={styles.confirmOverlay}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onCancel}
  >
    <motion.div
      className={styles.confirmBox}
      initial={{ scale: 0.93, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.93, opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.confirmIcon}>
        <FiTrash2 size={18} />
      </div>
      <h4 className={styles.confirmTitle}>Delete message?</h4>
      <p className={styles.confirmDesc}>This action cannot be undone.</p>
      <div className={styles.confirmActions}>
        <button className={styles.confirmCancel} onClick={onCancel}>
          Cancel
        </button>
        <button className={styles.confirmDelete} onClick={onConfirm}>
          Delete
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllMessages();
      setContacts(res?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget);
    try {
      await deleteMessage(deleteTarget);
      setContacts((prev) => prev.filter((c) => c._id !== deleteTarget));
      toast.success("Message deleted");
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  const unread = contacts.filter((c) => !c.read).length;
  const total = contacts.length;

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <div className={styles.titleIcon}>
            <FiMessageSquare size={18} />
          </div>
          <div>
            <h2 className={styles.title}>Messages</h2>
            <p className={styles.subtitle}>
              Contact form submissions
              {total > 0 && <span className={styles.chip}>{total} total</span>}
              {unread > 0 && (
                <span className={`${styles.chip} ${styles.chipAmber}`}>
                  {unread} unread
                </span>
              )}
            </p>
          </div>
        </div>

        <motion.button
          className={styles.refreshBtn}
          onClick={fetchContacts}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={loading}
        >
          <motion.span
            animate={loading ? { rotate: 360 } : { rotate: 0 }}
            transition={
              loading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}
            }
          >
            <FiRefreshCw size={13} />
          </motion.span>
          Refresh
        </motion.button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className={styles.errorBanner}>
          <FiAlertTriangle size={14} />
          {error}
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading ? (
        <div className={styles.tableCard}>
          <div className={styles.skeletonTable}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={styles.skeletonRow}>
                {[30, 22, 14, 35, 10, 6].map((w, j) => (
                  <div
                    key={j}
                    className={styles.skeletonCell}
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : contacts.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FiMessageSquare size={28} />
          </div>
          <p className={styles.emptyTitle}>No messages yet</p>
          <p className={styles.emptyDesc}>
            Contact form submissions will appear here.
          </p>
        </div>
      ) : (
        <motion.div
          className={styles.tableCard}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {contacts.map((c, i) => (
                    <motion.tr
                      key={c._id}
                      className={styles.row}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                    >
                      {/* Sender */}
                      <td>
                        <div className={styles.senderCell}>
                          <div className={styles.senderAvatar}>
                            {(c.name || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className={styles.senderName}>{c.name}</p>
                            <a
                              href={`mailto:${c.email}`}
                              className={styles.senderEmail}
                            >
                              <FiMail size={10} />
                              {c.email}
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td>
                        <span className={styles.subjectBadge}>
                          {c.subject || "General"}
                        </span>
                      </td>

                      {/* Message */}
                      <td>
                        <div
                          className={styles.messageCell}
                          onClick={() =>
                            setExpandedId(expandedId === c._id ? null : c._id)
                          }
                        >
                          <p
                            className={`${styles.messageText} ${expandedId === c._id ? styles.expanded : ""}`}
                          >
                            {c.message}
                          </p>
                          {c.message?.length > 80 && (
                            <button className={styles.expandBtn}>
                              {expandedId === c._id ? "less" : "more"}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td>
                        <span className={styles.dateText}>
                          {new Date(c.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <motion.button
                          className={styles.deleteBtn}
                          onClick={() => setDeleteTarget(c._id)}
                          disabled={deletingId === c._id}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          title="Delete message"
                        >
                          {deletingId === c._id ? (
                            <span className={styles.spinnerSm} />
                          ) : (
                            <FiTrash2 size={13} />
                          )}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── Delete confirm ── */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirm
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contacts;
