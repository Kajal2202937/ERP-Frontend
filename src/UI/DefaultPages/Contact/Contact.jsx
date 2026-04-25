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
      const token = localStorage.getItem("token");
      if (token) {
        socket = initSocket(token);
      } else {
        console.warn("⚠️ No token, socket not initialized");
        return;
      }
    }

    if (!socket) return;

    socketRef.current = socket;

    const handleReply = (data) => {
      if (!conversationIdRef.current) return;
      if (String(data.contactId) !== String(conversationIdRef.current)) return;
      if (!isMounted.current) return;

      if (data.tempId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.tempId === data.tempId ? { ...m, status: "sent" } : m,
          ),
        );
        return;
      }

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

    const handleTyping = (data) => {
      if (String(data.contactId) !== String(conversationIdRef.current)) return;

      setIsTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    };

    socket.on("contact_reply_receive", handleReply);
    socket.on("contact_typing", handleTyping);

    return () => {
      socket.off("contact_reply_receive", handleReply);
      socket.off("contact_typing", handleTyping);
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
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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

  const handleSendReply = async () => {
    const text = replyText.trim();
    if (!text || !conversationId) return;

    const tempId = `temp_${Date.now()}`;

    setReplyText("");
    setError("");

    const tempMessage = {
      tempId,
      sender: "user",
      message: text,
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      socketRef.current?.emit("send_message", {
        contactId: String(conversationId),
        message: text,
        sender: "user",
        tempId,
      });

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

  const handleTypingInput = (e) => {
    setReplyText(e.target.value);

    if (!socketRef.current || !conversationId) return;

    clearTimeout(typingDebounce.current);
    typingDebounce.current = setTimeout(() => {
      socketRef.current.emit("contact_typing", {
        contactId: String(conversationId),
      });
    }, 300);
  };

  return (
    <div className={styles.page}>
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div key="form" className={styles.formCard}>
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
                  />
                </div>
                <div className={styles.field}>
                  <label>Email</label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>Subject</label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label>Message</label>
                <textarea
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
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
          <motion.div key="chat" className={styles.chatCard}>
            <div className={styles.chatHeader}>
              <div className={styles.onlineDot} />
              <div>
                <h3>Live Chat</h3>
                <span>Support is online</span>
              </div>

              <button onClick={handleCloseChat} className={styles.closeBtn}>
                <FiX />
              </button>
            </div>

            <div className={styles.chatBody}>
              {messages.map((m, i) => (
                <div key={m.tempId || i} className={styles.msgRow}>
                  <div className={styles.bubble}>
                    {m.message}
                    {m.status && (
                      <span className={styles.msgStatus}>
                        {m.status === "sending" && "Sending..."}
                        {m.status === "sent" && "✓"}
                        {m.status === "failed" && "Failed"}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className={styles.typing}>Support is typing...</div>
              )}

              <div ref={chatEndRef} />
            </div>

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
