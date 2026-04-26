import { useState, useEffect, useRef } from "react";
import styles from "./Contact.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiX } from "react-icons/fi";
import {
  sendContactMessage,
  replyMessage,
} from "../../../services/contactService";
import { getSocket, initSocket } from "../../../services/socket";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  const conversationIdRef = useRef(null);
  const isMounted = useRef(true);
  const typingTimeout = useRef(null);
  const typingDebounce = useRef(null);

  // Keep conversationIdRef in sync so socket handlers always have the latest value
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearTimeout(typingTimeout.current);
      clearTimeout(typingDebounce.current);
    };
  }, []);

  // ── Socket setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    // FIX: getSocket() throws when not initialised — use try/catch instead of null check
    let socket;
    try {
      socket = getSocket();
    } catch {
      const token = localStorage.getItem("token");
      socket = initSocket(token);
    }

    if (!socket) return;
    socketRef.current = socket;

    const handleReply = (data) => {
      if (!conversationIdRef.current || !data?.contactId) return;
      if (String(data.contactId) !== String(conversationIdRef.current)) return;
      if (!isMounted.current) return;

      // Optimistic update: mark the temp message as confirmed
      if (data.tempId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.tempId === data.tempId ? { ...m, status: "sent" } : m,
          ),
        );
        return;
      }

      // New message from the admin/support side
      setMessages((prev) => [
        ...prev,
        {
          sender: data.sender || "admin",
          message: data.message,
          createdAt: data.createdAt || new Date().toISOString(),
          status: "sent",
        },
      ]);
    };

    // FIX: server emits "typing" not "contact_typing" — match the socket/index.js event name
    const handleTyping = (data) => {
      if (!conversationIdRef.current) return;
      if (String(data.contactId) !== String(conversationIdRef.current)) return;

      setIsTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        if (isMounted.current) setIsTyping(false);
      }, 2000);
    };

    socket.on("contact_reply_receive", handleReply);
    // FIX: was "contact_typing" — correct event name is "typing"
    socket.on("typing", handleTyping);

    return () => {
      socket.off("contact_reply_receive", handleReply);
      socket.off("typing", handleTyping);
    };
  }, []);

  // ── Join / leave conversation room ──────────────────────────────────────────
  useEffect(() => {
    if (!conversationId || !socketRef.current) return;

    socketRef.current.emit("join_contact", {
      contactId: String(conversationId),
    });

    return () => {
      socketRef.current?.emit("leave_contact", {
        contactId: String(conversationId),
      });
    };
  }, [conversationId]);

  // ── Auto-scroll to latest message ───────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Form handlers ───────────────────────────────────────────────────────────
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      return "Name, email and message are required.";
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(form.email)) {
      return "Please enter a valid email.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await sendContactMessage(form);

      if (res?.success) {
        setSuccess(true);
        setConversationId(res.data._id);

        setMessages([
          {
            sender: "system",
            message: "Conversation started. Our team will reply shortly.",
            createdAt: new Date().toISOString(),
          },
          {
            sender: "user",
            message: form.message,
            createdAt: new Date().toISOString(),
            status: "sent",
          },
        ]);

        setForm({ name: "", email: "", subject: "", message: "" });
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err?.message || "Failed to send message.");
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  // ── Reply handlers ──────────────────────────────────────────────────────────
  const handleSendReply = async () => {
    const text = replyText.trim();
    if (!text || !conversationId) return;

    const tempId = `temp_${Date.now()}`;

    setReplyText("");
    setError("");

    // Optimistic UI — show message immediately with "sending" status
    setMessages((prev) => [
      ...prev,
      {
        tempId,
        sender: "user",
        message: text,
        createdAt: new Date().toISOString(),
        status: "sending",
      },
    ]);

    try {
      await replyMessage(conversationId, text, tempId);
    } catch {
      if (isMounted.current) {
        setError("Failed to send message.");
        setMessages((prev) =>
          prev.map((m) =>
            m.tempId === tempId ? { ...m, status: "failed" } : m,
          ),
        );
      }
    }
  };

  const handleReplyKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const handleCloseChat = () => {
    socketRef.current?.emit("leave_contact", {
      contactId: String(conversationId),
    });
    setSuccess(false);
    setConversationId(null);
    setMessages([]);
    setReplyText("");
    setError("");
  };

  // FIX: emit "typing" to match server-side EVENTS.TYPING constant — was "contact_typing"
  const handleTypingInput = (e) => {
    setReplyText(e.target.value);

    if (!socketRef.current || !conversationId) return;

    clearTimeout(typingDebounce.current);
    typingDebounce.current = setTimeout(() => {
      socketRef.current.emit("typing", {
        contactId: String(conversationId),
      });
    }, 300);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <AnimatePresence mode="wait">
        {!success ? (
          // ── Contact Form ──
          <motion.div
            key="form"
            className={styles.formCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className={styles.title}>Contact Us</h2>
            <p className={styles.subtitle}>
              Send a message and start a live conversation.
            </p>

            {error && <p className={styles.errorMsg}>{error}</p>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                  />
                </div>
                <div className={styles.field}>
                  <label>Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>Subject</label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                />
              </div>

              <div className={styles.field}>
                <label>Message</label>
                <textarea
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message here…"
                />
              </div>

              <button
                type="submit"
                className={styles.sendBtn}
                disabled={loading}
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message <FiSend />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          // ── Live Chat ──
          <motion.div
            key="chat"
            className={styles.chatCard}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header */}
            <div className={styles.chatHeader}>
              <div className={styles.onlineDot} />
              <div>
                <h3>Live Chat</h3>
                <span>Support is online</span>
              </div>
              <button
                onClick={handleCloseChat}
                className={styles.closeBtn}
                aria-label="Close chat"
              >
                <FiX />
              </button>
            </div>

            {/* Messages */}
            <div className={styles.chatBody}>
              {messages.map((m, i) => {
                // FIX: distinguish three sender types properly
                const isUser = m.sender === "user";
                const isSystem = m.sender === "system";

                return (
                  <div
                    key={m.tempId || i}
                    className={`${styles.msgRow} ${
                      isUser
                        ? styles.user
                        : isSystem
                          ? styles.system
                          : styles.admin
                    }`}
                  >
                    <div className={styles.bubble}>
                      {m.message}
                      {/* Only show status indicator on user messages */}
                      {isUser && m.status && (
                        <span
                          className={`${styles.msgStatus} ${
                            m.status === "failed" ? styles.statusFailed : ""
                          }`}
                        >
                          {m.status === "sending" && "Sending…"}
                          {m.status === "sent" && "✓"}
                          {m.status === "failed" && "Failed to send"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className={`${styles.msgRow} ${styles.admin}`}>
                  <div className={styles.typingBubble}>
                    <span className={styles.typingDot} />
                    <span className={styles.typingDot} />
                    <span className={styles.typingDot} />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Reply input */}
            {error && <p className={styles.chatError}>{error}</p>}

            <div className={styles.chatInputRow}>
              <input
                value={replyText}
                onChange={handleTypingInput}
                onKeyDown={handleReplyKeyDown}
                className={styles.chatInput}
                placeholder="Type a message…"
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className={styles.sendIconBtn}
                aria-label="Send message"
              >
                <FiSend />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contact;