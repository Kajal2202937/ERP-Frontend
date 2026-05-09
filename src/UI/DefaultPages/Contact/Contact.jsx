import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiX, FiMessageCircle } from "react-icons/fi";
import {
  sendContactMessage,
  replyMessage,
} from "../../../services/contactService";
import { initSocket, getSocket } from "../../../services/socket";
import styles from "./Contact.module.css";

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

  useEffect(() => {
    let socket;
    try {
      socket = getSocket();
    } catch {
      socket = initSocket(localStorage.getItem("token"));
    }
    socketRef.current = socket;

    const handleReply = (data) => {
      if (
        !conversationIdRef.current ||
        String(data.contactId) !== String(conversationIdRef.current)
      )
        return;

      if (data.tempId && data.sender === "user") {
        setMessages((prev) =>
          prev.map((m) =>
            m.tempId === data.tempId ? { ...m, status: "sent" } : m,
          ),
        );
        return;
      }

      if (data.sender !== "admin") return;

      setMessages((prev) => [
        ...prev,
        {
          sender: "admin",
          message: data.message,
          createdAt: data.createdAt || new Date().toISOString(),
          status: "sent",
        },
      ]);
    };

    const handleTyping = (data) => {
      if (String(data.contactId) !== String(conversationIdRef.current)) return;
      setIsTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setIsTyping(false), 1800);
    };

    socket.on("contact_reply_receive", handleReply);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("contact_reply_receive", handleReply);
      socket.off("typing", handleTyping);
    };
  }, []);

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

  useEffect(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages.length, isTyping]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      return "Name, email and message are required.";
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(form.email)) return "Please enter a valid email.";
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
            message:
              "✅ Conversation started. Our support team will reply shortly.",
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
      setError(err?.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    const text = replyText.trim();
    if (!text || !conversationId) return;

    const tempId = `temp_${Date.now()}`;

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

    setReplyText("");

    try {
      await replyMessage(conversationId, text, tempId, "user");

      setMessages((prev) =>
        prev.map((m) =>
          m.tempId === tempId && m.status === "sending"
            ? { ...m, status: "sent" }
            : m,
        ),
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.tempId === tempId ? { ...m, status: "failed" } : m)),
      );
      setError("Failed to send message.");
    }
  };

  const handleReplyKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const handleTypingInput = useCallback(
    (e) => {
      setReplyText(e.target.value);
      if (!socketRef.current || !conversationId) return;

      clearTimeout(typingDebounce.current);
      typingDebounce.current = setTimeout(() => {
        socketRef.current.emit("typing", { contactId: String(conversationId) });
      }, 300);
    },
    [conversationId],
  );

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

  return (
    <div className={styles.page}>
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div
            key="form"
            className={styles.formCard}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
          >
            <div className={styles.formHeader}>
              <FiMessageCircle size={32} className={styles.formIcon} />
              <h2 className={styles.title}>Get in Touch</h2>
              <p className={styles.subtitle}>
                We typically reply within a few minutes during business hours.
              </p>
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Email *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>Subject</label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="How can we help you ?"
                />
              </div>

              <div className={styles.field}>
                <label>Message *</label>
                <textarea
                  name="message"
                  rows={6}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.sendBtn}
                disabled={loading}
              >
                {loading ? "Sending Message..." : "Start Conversation"}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            className={styles.chatCard}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
          >
            <div className={styles.chatHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.onlineIndicator}>
                  <span className={styles.onlineDot} />
                  <span>Support Online</span>
                </div>
              </div>
              <button onClick={handleCloseChat} className={styles.closeBtn}>
                <FiX size={20} />
              </button>
            </div>

            <div className={styles.chatBody}>
              {messages.map((m, i) => (
                <div
                  key={m.tempId || m._id || `msg-${i}`}
                  className={`${styles.msgRow} ${
                    m.sender === "user"
                      ? styles.user
                      : m.sender === "admin"
                        ? styles.admin
                        : styles.system
                  }`}
                >
                  <div className={styles.bubble}>
                    {m.message}
                    {m.sender === "user" && m.status && (
                      <span className={styles.msgStatus}>
                        {m.status === "sending" && "Sending..."}
                        {m.status === "sent" && "✓ Sent"}
                        {m.status === "failed" && "Failed"}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className={`${styles.msgRow} ${styles.admin}`}>
                  <div className={styles.typingBubble}>
                    <div className={styles.typingIndicator}>
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className={styles.chatInputArea}>
              {error && <p className={styles.chatError}>{error}</p>}

              <div className={styles.inputWrapper}>
                <input
                  value={replyText}
                  onChange={handleTypingInput}
                  onKeyDown={handleReplyKeyDown}
                  className={styles.chatInput}
                  placeholder="Type your message..."
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className={styles.sendBtn}
                >
                  <FiSend size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contact;
