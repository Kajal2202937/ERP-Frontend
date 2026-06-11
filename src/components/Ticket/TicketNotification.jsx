import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchTicketStats } from "../../services/ticketService";
import useTicketSocket from "../../hooks/useTicketSocket";
import { TICKET_EVENTS } from "../../services/socketEvents";
import styles from "./TicketNotification.module.css";

/**
 * TicketNotification
 *
 * Displays a live badge in the navbar showing unread/new ticket count.
 * Updates in real-time via socket without polling.
 *
 * Props:
 *   token     {string}   - Admin JWT token
 *   onClick   {function} - Called when badge is clicked (navigate to inbox)
 *
 * Fixes applied:
 *   1. handlers wrapped in useMemo — stable reference prevents the socket
 *      from re-subscribing on every render.
 *   2. TICKET_UPDATED handler now decrements `open` (not `unread`).
 *      Resolving a ticket reduces the open count; it has no effect on
 *      whether the admin has read a message.
 *   3. No stale-closure risk — setStats uses the functional updater form
 *      throughout, so handlers never need `stats` in their closure.
 */
const TicketNotification = ({ token, onClick }) => {
  const [stats, setStats] = useState({ unread: 0, new: 0, open: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetchTicketStats();
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load ticket stats:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handlers = useMemo(
    () => ({
      [TICKET_EVENTS.TICKET_NEW]: () => {
        setStats((prev) => ({
          ...prev,
          new: prev.new + 1,
          open: prev.open + 1,
          unread: prev.unread + 1,
          total: prev.total + 1,
        }));
      },

      [TICKET_EVENTS.TICKET_UPDATED]: (payload) => {
        if (["resolved", "closed"].includes(payload.status)) {
          setStats((prev) => ({
            ...prev,
            open: Math.max(0, prev.open - 1),
          }));
        }
      },

      [TICKET_EVENTS.TICKET_DELETED]: () => {
        setStats((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          open: Math.max(0, prev.open - 1),
        }));
      },
    }),
    [],
  );

  useTicketSocket({ token, isAdmin: true, handlers });

  const count = stats.unread || 0;

  return (
    <button
      className={styles.container}
      onClick={onClick}
      aria-label={`Support tickets: ${count} unread`}
      type="button"
    >
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
        />
      </svg>

      {!loading && count > 0 && (
        <span className={styles.badge} aria-live="polite">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
};

export default TicketNotification;
