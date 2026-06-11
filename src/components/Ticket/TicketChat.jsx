import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "../../../utils/toast";
import useTicketSocket from "../../hooks/useTicketSocket";
import { TICKET_EVENTS } from "../../services/socketEvents";
import {
  replyToTicket,
  markTicketSeen,
  resolveTicket,
} from "../../services/ticketService";
import TicketStatusBadge from "../Ticket/TicketStatusBadge";
import styles from "./TicketChat.module.css";

const TYPING_TIMEOUT = 2500;

const TicketChat = ({
  ticket,
  token,
  isAdmin = false,
  onResolved,
  onClose,
}) => {
  const [messages, setMessages] = useState(ticket?.messages || []);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [status, setStatus] = useState(ticket?.status || "open");

  const bottomRef = useRef(null);
  const typingTimerRef = useRef(null);
  const inputRef = useRef(null);

  const ticketId = ticket?.ticketId;
  const contactId = ticket?._id;

  const handlers = useMemo(
    () => ({
      [TICKET_EVENTS.TICKET_REPLY]: (payload) => {
        if (payload.contactId !== contactId) return;
        setMessages((prev) => {
          if (payload.tempId) {
            const idx = prev.findIndex((m) => m._id === payload.tempId);
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = { ...payload, _id: payload._id };
              return updated;
            }
          }
          if (prev.some((m) => m._id === payload._id)) return prev;
          return [...prev, payload];
        });
      },

      [TICKET_EVENTS.TYPING]: ({ ticketId: tid }) => {
        if (tid !== ticketId) return;
        setIsTyping(true);
      },

      [TICKET_EVENTS.STOP_TYPING]: ({ ticketId: tid }) => {
        if (tid !== ticketId) return;
        setIsTyping(false);
      },

      [TICKET_EVENTS.TICKET_RESOLVED]: (payload) => {
        if (payload.ticketId !== ticketId) return;
        setStatus("resolved");
        toast.success("This ticket has been resolved.");
      },

      [TICKET_EVENTS.TICKET_UPDATED]: (payload) => {
        if (payload.ticketId !== ticketId) return;
        setStatus(payload.status);
      },

      [TICKET_EVENTS.SEEN]: ({ ticketId: tid }) => {
        if (tid !== ticketId) return;
        setMessages((prev) =>
          prev.map((m) =>
            isAdmin && m.sender === "admin" ? { ...m, seen: true } : m,
          ),
        );
      },
    }),
    [contactId, ticketId, isAdmin],
  );

  const { emitTyping, emitStopTyping, emitSeen } = useTicketSocket({
    token,
    isAdmin,
    ticketId,
    handlers,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!contactId) return;
    markTicketSeen(contactId).catch(() => {});
    emitSeen(ticketId);
  }, [contactId, ticketId, emitSeen]);

  useEffect(() => {
    return () => clearTimeout(typingTimerRef.current);
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    emitTyping(ticketId);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      emitStopTyping(ticketId);
    }, TYPING_TIMEOUT);
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    clearTimeout(typingTimerRef.current);
    emitStopTyping(ticketId);

    const tempId = `temp_${Date.now()}`;
    const optimistic = {
      _id: tempId,
      message: text,
      sender: isAdmin ? "admin" : "user",
      seen: false,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSending(true);

    try {
      await replyToTicket(contactId, { message: text, tempId });
    } catch (err) {
      toast.error(err.message || "Failed to send message");
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setInput(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending, contactId, ticketId, isAdmin, emitStopTyping]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResolve = async () => {
    if (!isAdmin || resolving) return;
    setResolving(true);
    try {
      await resolveTicket(contactId);
      setStatus("resolved");
      toast.success("Ticket resolved successfully");
      onResolved?.();
    } catch (err) {
      toast.error(err.message || "Failed to resolve ticket");
    } finally {
      setResolving(false);
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (date) =>
    new Date(date).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const isResolved = status === "resolved" || status === "closed";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            className={styles.backBtn}
            onClick={onClose}
            aria-label="Close chat"
            type="button"
          >
            ←
          </button>
          <div>
            <div className={styles.headerTitle}>
              <span className={styles.ticketIdLabel}>{ticket?.ticketId}</span>
              <TicketStatusBadge status={status} />
              {ticket?.priority && (
                <TicketStatusBadge priority={ticket.priority} />
              )}
            </div>
            <p className={styles.headerSubject}>{ticket?.subject}</p>
            <p className={styles.headerMeta}>
              {ticket?.name} · {ticket?.email}
            </p>
          </div>
        </div>

        {isAdmin && !isResolved && (
          <button
            className={styles.resolveBtn}
            onClick={handleResolve}
            disabled={resolving}
            type="button"
          >
            {resolving ? "Resolving…" : "✓ Resolve"}
          </button>
        )}
      </div>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <p className={styles.emptyMsg}>No messages yet.</p>
        )}

        {messages.map((msg, idx) => {
          const isMine = isAdmin
            ? msg.sender === "admin"
            : msg.sender === "user";
          const showDate =
            idx === 0 ||
            formatDate(messages[idx - 1].createdAt) !==
              formatDate(msg.createdAt);

          return (
            <React.Fragment key={msg._id}>
              {showDate && (
                <div className={styles.dateDivider}>
                  {formatDate(msg.createdAt)}
                </div>
              )}
              <motion.div
                className={`${styles.messageRow} ${isMine ? styles.mine : styles.theirs}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div
                  className={`${styles.bubble} ${
                    isMine ? styles.bubbleMine : styles.bubbleTheirs
                  } ${msg._optimistic ? styles.optimistic : ""}`}
                >
                  <p className={styles.msgText}>{msg.message}</p>
                  <div className={styles.msgMeta}>
                    <span>{formatTime(msg.createdAt)}</span>
                    {isMine && (
                      <span
                        className={styles.seenIcon}
                        title={msg.seen ? "Seen" : "Delivered"}
                      >
                        {msg.seen ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}

        <AnimatePresence>
          {isTyping && (
            <motion.div
              className={`${styles.messageRow} ${styles.theirs}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div
                className={`${styles.bubble} ${styles.bubbleTheirs} ${styles.typingBubble}`}
              >
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {!isResolved ? (
        <div className={styles.inputArea}>
          <textarea
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            rows={2}
            disabled={sending}
            aria-label="Message input"
          />
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={sending || !input.trim()}
            type="button"
            aria-label="Send message"
          >
            {sending ? (
              <span className={styles.spinner} />
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="18"
                height="18"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </div>
      ) : (
        <div className={styles.resolvedBanner}>
          <TicketStatusBadge status="resolved" size="md" />
          <span>This ticket has been resolved.</span>
        </div>
      )}
    </div>
  );
};

export default TicketChat;