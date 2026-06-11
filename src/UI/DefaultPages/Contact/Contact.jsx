import { useState, useEffect, useRef, useCallback } from "react";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import styles from "./Contact.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiX, FiCheck, FiAlertCircle } from "react-icons/fi";
import {
  submitTicket,
  replyToTicket,
  markTicketSeen,
} from "../../../services/ticketService";
import { getSocket, initSocket } from "../../../services/socket";
import { TICKET_EVENTS } from "../../../services/socketEvents";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatActive, setChatActive] = useState(false);
  const [dialog, setDialog] = useState(null);

  const chatEndRef = useRef(null);
  const ticketRef = useRef(null);
  const seenRef = useRef(new Set());
  const stopTypingTimer = useRef(null);
  const typingFadeTimer = useRef(null);

  useEffect(() => {
    ticketRef.current = ticket;
  }, [ticket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const socket = getSocket() || initSocket(null);
    if (!socket) return;

    const joinRoom = () => {
      const t = ticketRef.current;
      if (!t?.ticketId) return;
      socket.emit(TICKET_EVENTS.JOIN_TICKET, { ticketId: t.ticketId });
    };

    socket.on("connect", joinRoom);
    if (socket.connected) joinRoom();

    const handleReply = (payload) => {
      const t = ticketRef.current;
      if (!t) return;
      if (payload.contactId !== t._id && payload.ticketId !== t.ticketId)
        return;

      const key = payload._id;
      if (key && seenRef.current.has(key)) return;
      if (key) seenRef.current.add(key);

      setMessages((prev) => {
        if (payload.tempId) {
          const idx = prev.findIndex((m) => m._id === payload.tempId);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              _id: payload._id,
              _status: "sent",
              createdAt: payload.createdAt,
            };
            return updated;
          }
        }
        if (prev.some((m) => m._id === payload._id)) return prev;
        return [
          ...prev,
          {
            _id: payload._id,
            sender: payload.sender,
            message: payload.message,
            createdAt: payload.createdAt || new Date().toISOString(),
            _status: payload.sender === "user" ? "sent" : undefined,
          },
        ];
      });

      if (payload.sender === "admin") {
        socket.emit(TICKET_EVENTS.SEEN, { ticketId: t.ticketId });
      }
    };

    const handleTyping = ({ ticketId }) => {
      if (ticketRef.current?.ticketId !== ticketId) return;
      setIsTyping(true);
      clearTimeout(typingFadeTimer.current);
      typingFadeTimer.current = setTimeout(() => setIsTyping(false), 2500);
    };

    const handleStopTyping = ({ ticketId }) => {
      if (ticketRef.current?.ticketId !== ticketId) return;
      clearTimeout(typingFadeTimer.current);
      setIsTyping(false);
    };

    const handleSeen = ({ ticketId }) => {
      if (ticketRef.current?.ticketId !== ticketId) return;
      setMessages((prev) =>
        prev.map((m) => (m.sender === "user" ? { ...m, _status: "seen" } : m)),
      );
    };

    const handleResolved = ({ ticketId }) => {
      if (ticketRef.current?.ticketId !== ticketId) return;
      setMessages((prev) => [
        ...prev,
        {
          _id: `resolved-${Date.now()}`,
          sender: "system",
          message:
            "✅ This ticket has been resolved by our support team. Thank you for reaching out!",
          createdAt: new Date().toISOString(),
        },
      ]);
    };

    socket.on(TICKET_EVENTS.TICKET_REPLY, handleReply);
    socket.on(TICKET_EVENTS.TYPING, handleTyping);
    socket.on(TICKET_EVENTS.STOP_TYPING, handleStopTyping);
    socket.on(TICKET_EVENTS.SEEN, handleSeen);
    socket.on(TICKET_EVENTS.TICKET_RESOLVED, handleResolved);

    return () => {
      socket.off("connect", joinRoom);
      socket.off(TICKET_EVENTS.TICKET_REPLY, handleReply);
      socket.off(TICKET_EVENTS.TYPING, handleTyping);
      socket.off(TICKET_EVENTS.STOP_TYPING, handleStopTyping);
      socket.off(TICKET_EVENTS.SEEN, handleSeen);
      socket.off(TICKET_EVENTS.TICKET_RESOLVED, handleResolved);
      clearTimeout(stopTypingTimer.current);
      clearTimeout(typingFadeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!ticket?.ticketId) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit(TICKET_EVENTS.JOIN_TICKET, { ticketId: ticket.ticketId });
    markTicketSeen(ticket._id).catch(() => {});
    return () => {
      socket.emit(TICKET_EVENTS.LEAVE_TICKET, { ticketId: ticket.ticketId });
    };
  }, [ticket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await submitTicket(form);
      const newTicket = res.data;
      setTicket(newTicket);
      setChatActive(true);
      setMessages([
        {
          _id: `system-${Date.now()}`,
          sender: "system",
          message: `✅ Ticket ${newTicket.ticketId} created. Our team will respond shortly.`,
          createdAt: new Date().toISOString(),
        },
        {
          _id: `initial-${Date.now()}`,
          sender: "user",
          message: form.message,
          createdAt: newTicket.createdAt || new Date().toISOString(),
          _status: "sent",
        },
      ]);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to submit. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = useCallback(async () => {
    const text = replyText.trim();
    if (!text || !ticket) return;
    const tempId = `temp_${Date.now()}`;
    setReplyText("");
    clearTimeout(stopTypingTimer.current);
    const socket = getSocket();
    socket?.emit(TICKET_EVENTS.STOP_TYPING, { ticketId: ticket.ticketId });
    setMessages((prev) => [
      ...prev,
      {
        _id: tempId,
        sender: "user",
        message: text,
        createdAt: new Date().toISOString(),
        _status: "sending",
      },
    ]);
    try {
      await replyToTicket(ticket._id, { message: text, tempId });
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...m, _status: "failed" } : m)),
      );
      setError(err?.response?.data?.message || err.message || "Failed to send");
      setReplyText(text);
    }
  }, [replyText, ticket]);

  const handleTypingInput = (e) => {
    setReplyText(e.target.value);
    const socket = getSocket();
    if (!socket || !ticket?.ticketId) return;
    socket.emit(TICKET_EVENTS.TYPING, { ticketId: ticket.ticketId });
    clearTimeout(stopTypingTimer.current);
    stopTypingTimer.current = setTimeout(() => {
      socket.emit(TICKET_EVENTS.STOP_TYPING, { ticketId: ticket.ticketId });
    }, 2000);
  };

  const handleCloseChat = () => {
    setDialog({
      title: "Close this conversation?",
      message: "The conversation will be marked as resolved.",
      variant: "warning",
      confirmLabel: "Close Conversation",
      onConfirm: () => closeConversation(),
    });
  };

  const closeConversation = () => {
    const socket = getSocket();
    if (ticket?.ticketId) {
      socket?.emit(TICKET_EVENTS.LEAVE_TICKET, { ticketId: ticket.ticketId });
      socket?.emit(TICKET_EVENTS.STOP_TYPING, { ticketId: ticket.ticketId });
    }
    clearTimeout(stopTypingTimer.current);
    clearTimeout(typingFadeTimer.current);
    setTicket(null);
    setMessages([]);
    setReplyText("");
    setError("");
    setChatActive(false);
    seenRef.current.clear();
  };

  return (
    <div className={styles.page}>
      <AnimatePresence mode="wait">
        {/* ── Contact Form ── */}
        {!chatActive ? (
          <motion.div
            key="form"
            className={styles.formCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.formHeader}>
              <h1 className={styles.title}>Contact Us</h1>
              <p className={styles.subtitle}>
                Send a message to start a live support chat with our team.
              </p>
            </div>

            {error && (
              <p className={styles.errorMsg} role="alert">
                <FiAlertCircle aria-hidden="true" />
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="c-name">Name</label>
                  <input
                    id="c-name"
                    name="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Your name"
                    required
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="c-email">Email</label>
                  <input
                    id="c-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="c-subject">Subject</label>
                <input
                  id="c-subject"
                  name="subject"
                  value={form.subject}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, subject: e.target.value }))
                  }
                  placeholder="What is this about?"
                  disabled={loading}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="c-message">Message</label>
                <textarea
                  id="c-message"
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, message: e.target.value }))
                  }
                  placeholder="How can we help?"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className={styles.sendBtn}
                disabled={loading}
              >
                {loading ? (
                  "Connecting…"
                ) : (
                  <>
                    <FiSend aria-hidden="true" /> Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          /* ── Support Chat ── */
          <motion.div
            key="chat"
            className={styles.chatCard}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            role="region"
            aria-label="Support chat"
          >
            {/* Header */}
            <div className={styles.chatHeader}>
              <div className={styles.onlineStatus}>
                <div className={styles.onlineDot} aria-hidden="true" />
                <div>
                  <h2>Support Chat</h2>
                  <span>
                    {ticket?.ticketId
                      ? `Ticket ${ticket.ticketId} · Typically replies in minutes`
                      : "Typically replies in minutes"}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCloseChat}
                className={styles.closeBtn}
                title="End conversation"
                type="button"
                aria-label="End conversation"
              >
                <FiX aria-hidden="true" />
              </button>
            </div>

            {/* Messages */}
            <div
              className={styles.chatBody}
              role="log"
              aria-live="polite"
              aria-label="Chat messages"
            >
              {messages.map((m, i) => (
                <div
                  key={m._id || i}
                  className={`${styles.msgRow} ${styles[m.sender] || styles.admin}`}
                >
                  <div
                    className={`${styles.bubble} ${
                      m._status === "failed" ? styles.failedBubble : ""
                    } ${m.sender === "system" ? styles.systemBubble : ""}`}
                  >
                    {m.message}

                    {m.sender === "user" && (
                      <span
                        className={styles.msgStatus}
                        aria-label={`Message status: ${m._status}`}
                      >
                        {m._status === "sending" && "···"}
                        {m._status === "sent" && <FiCheck size={10} />}
                        {m._status === "seen" && (
                          <>
                            <FiCheck size={10} style={{ marginRight: -4 }} />
                            <FiCheck size={10} />
                          </>
                        )}
                        {m._status === "failed" && (
                          <span style={{ color: "var(--red)" }}>!</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div
                  className={`${styles.msgRow} ${styles.admin}`}
                  aria-label="Support is typing"
                >
                  <div className={styles.typingBubble}>
                    <span className={styles.typingDot} />
                    <span className={styles.typingDot} />
                    <span className={styles.typingDot} />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {error && (
              <p
                className={styles.errorMsg}
                style={{ margin: "0 14px" }}
                role="alert"
              >
                <FiAlertCircle aria-hidden="true" />
                {error}
              </p>
            )}

            {/* Input row */}
            <div className={styles.chatInputRow}>
              <input
                value={replyText}
                onChange={handleTypingInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
                className={styles.chatInput}
                placeholder="Type a message…"
                aria-label="Reply message"
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className={styles.sendIconBtn}
                type="button"
                aria-label="Send reply"
              >
                <FiSend aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog config={dialog} onClose={() => setDialog(null)} />
    </div>
  );
};

export default Contact;
