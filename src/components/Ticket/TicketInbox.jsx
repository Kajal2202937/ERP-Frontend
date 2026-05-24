import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  fetchTickets,
  fetchTicketStats,
  deleteTicket,
} from "../../services/ticketService";
import useTicketSocket from "../../hooks/useTicketSocket";
import { TICKET_EVENTS } from "../../services/socketEvents";
import TicketStatusBadge from "../Ticket/TicketStatusBadge";
import TicketChat from "../Ticket/TicketChat";
import styles from "./TicketInbox.module.css";

const TABS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "waiting_for_user", label: "Waiting" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

/**
 * TicketInbox
 *
 * Full admin inbox:
 * - Tabbed filter by status
 * - Search by name/email/ticketId
 * - Live updates via socket
 * - Opens TicketChat panel on row click
 * - Delete tickets
 *
 * Props:
 *   token   {string} - Admin JWT
 */
const TicketInbox = ({ token }) => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchTickets({
        status: activeTab === "all" ? undefined : activeTab,
        search: search || undefined,
        page,
        limit: 20,
      });
      setTickets(res.tickets);
      setTotalPages(res.pages);
    } catch (err) {
      toast.error(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, page]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetchTicketStats();
      setStats(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    loadTickets();
    loadStats();
  }, [loadTickets, loadStats]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handlers = useMemo(
    () => ({
      [TICKET_EVENTS.TICKET_NEW]: (payload) => {
        setTickets((prev) => {
          if (prev.some((t) => t._id === payload._id)) return prev;
          return [payload, ...prev];
        });
        setStats((prev) => ({
          ...prev,
          new: (prev.new || 0) + 1,
          total: (prev.total || 0) + 1,
          unread: (prev.unread || 0) + 1,
        }));
        toast.info(`📩 New ticket from ${payload.name}`, { autoClose: 4000 });
      },

      [TICKET_EVENTS.TICKET_UPDATED]: (payload) => {
        setTickets((prev) =>
          prev.map((t) => (t._id === payload._id ? { ...t, ...payload } : t)),
        );

        setSelectedTicket((prev) =>
          prev?._id === payload._id ? { ...prev, ...payload } : prev,
        );
      },

      [TICKET_EVENTS.TICKET_DELETED]: (payload) => {
        setTickets((prev) => prev.filter((t) => t._id !== payload._id));
        if (selectedTicket?._id === payload._id) {
          setSelectedTicket(null);
        }
      },
    }),
    [selectedTicket],
  );

  useTicketSocket({ token, isAdmin: true, handlers });

  const handleDelete = async (e, ticketId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this ticket? This cannot be undone.")) return;

    setDeletingId(ticketId);
    try {
      await deleteTicket(ticketId);
      setTickets((prev) => prev.filter((t) => t._id !== ticketId));
      if (selectedTicket?._id === ticketId) setSelectedTicket(null);
      toast.success("Ticket deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete ticket");
    } finally {
      setDeletingId(null);
    }
  };

  const handleResolved = () => {
    setSelectedTicket((prev) =>
      prev ? { ...prev, status: "resolved" } : prev,
    );
    loadStats();
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60_000) return "Just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className={styles.layout}>
      <div
        className={`${styles.sidebar} ${selectedTicket ? styles.sidebarHidden : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <h2 className={styles.title}>Support Inbox</h2>
          {stats.unread > 0 && (
            <span className={styles.unreadPill}>{stats.unread} unread</span>
          )}
        </div>

        <div className={styles.searchWrap}>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search by name, email, ticket ID…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search tickets"
          />
        </div>

        <div className={styles.tabs} role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
              onClick={() => {
                setActiveTab(tab.key);
                setPage(1);
              }}
              type="button"
            >
              {tab.label}
              {stats[tab.key] > 0 && (
                <span className={styles.tabCount}>{stats[tab.key]}</span>
              )}
            </button>
          ))}
        </div>

        <div className={styles.list}>
          {loading && (
            <div className={styles.loadingState}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          )}

          {!loading && tickets.length === 0 && (
            <div className={styles.emptyState}>
              <span>📭</span>
              <p>No tickets found</p>
            </div>
          )}

          <AnimatePresence>
            {tickets.map((ticket) => (
              <motion.div
                key={ticket._id}
                className={`${styles.ticketRow} ${
                  selectedTicket?._id === ticket._id
                    ? styles.ticketRowActive
                    : ""
                } ${!ticket.readByAdmin ? styles.ticketRowUnread : ""}`}
                onClick={() => setSelectedTicket(ticket)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && setSelectedTicket(ticket)
                }
                aria-label={`Ticket ${ticket.ticketId} from ${ticket.name}`}
              >
                <div className={styles.rowTop}>
                  <div className={styles.rowMeta}>
                    <span className={styles.rowTicketId}>
                      {ticket.ticketId}
                    </span>
                    <TicketStatusBadge status={ticket.status} />
                    {ticket.priority !== "medium" && (
                      <TicketStatusBadge priority={ticket.priority} />
                    )}
                  </div>
                  <span className={styles.rowTime}>
                    {formatTime(ticket.lastMessageAt || ticket.createdAt)}
                  </span>
                </div>

                <div className={styles.rowName}>{ticket.name}</div>
                <div className={styles.rowSubject}>{ticket.subject}</div>

                <div className={styles.rowActions}>
                  <span className={styles.rowEmail}>{ticket.email}</span>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => handleDelete(e, ticket._id)}
                    disabled={deletingId === ticket._id}
                    type="button"
                    aria-label="Delete ticket"
                  >
                    {deletingId === ticket._id ? "…" : "✕"}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                type="button"
              >
                ← Prev
              </button>
              <span className={styles.pageInfo}>
                {page} / {totalPages}
              </span>
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                type="button"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className={`${styles.main} ${!selectedTicket ? styles.mainEmpty : ""}`}
      >
        {selectedTicket ? (
          <TicketChat
            ticket={selectedTicket}
            token={token}
            isAdmin={true}
            onResolved={handleResolved}
            onClose={() => setSelectedTicket(null)}
          />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>💬</span>
            <p>Select a ticket to view the conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketInbox;
