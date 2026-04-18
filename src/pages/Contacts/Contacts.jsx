import { useEffect, useState, useRef, useMemo } from "react";
import styles from "./Contacts.module.css";
import {
  FiRefreshCw,
  FiSend,
  FiTrash2,
  FiSearch,
  FiCheckCircle,
  FiMessageSquare,
  FiInbox,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";

import {
  getAllMessages,
  replyMessage,
  deleteMessage,
} from "../../services/contactService";
import { initSocket, getSocket } from "../../services/socket";

const MAX_CHARS = 500;
const TABS = ["all", "unread", "resolved"];

const initial = (name) => name?.[0]?.toUpperCase() ?? "?";

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const withDateSeparators = (messages) => {
  const result = [];
  let lastDate = null;

  messages.forEach((msg, i) => {
    const d = new Date(msg.createdAt).toDateString();
    if (d !== lastDate) {
      result.push({ type: "separator", date: msg.createdAt, key: `sep-${i}` });
      lastDate = d;
    }
    result.push({ type: "message", ...msg });
  });

  return result;
};

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  const isMounted = useRef(true);
  const typingTimeout = useRef(null);
  const sentTempIds = useRef(new Set());

  const selected = useMemo(
    () => contacts.find((c) => c._id === selectedId) ?? null,
    [contacts, selectedId],
  );

  const tabCounts = useMemo(
    () => ({
      all: contacts.length,
      unread: contacts.filter((c) => c.status === "new").length,
      resolved: contacts.filter((c) => c.status === "resolved").length,
    }),
    [contacts],
  );

  const filteredContacts = useMemo(() => {
    let list = contacts;

    if (tab === "unread") list = list.filter((c) => c.status === "new");
    if (tab === "resolved") list = list.filter((c) => c.status === "resolved");

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        `${c.name} ${c.email} ${c.message} ${c.subject ?? ""}`
          .toLowerCase()
          .includes(q),
      );
    }

    return list;
  }, [contacts, search, tab]);

  const timeline = useMemo(() => {
    if (!selected) return [];
    const initial_msg = {
      _id: "initial",
      message: selected.message,
      sender: "user",
      createdAt: selected.createdAt,
    };
    return withDateSeparators([initial_msg, ...(selected.replies || [])]);
  }, [selected]);

  const charCount = message.length;
  const charClass =
    charCount > MAX_CHARS
      ? styles.over
      : charCount > MAX_CHARS * 0.85
        ? styles.warn
        : "";

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchContacts = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      setRefreshing(true);
      const res = await getAllMessages();
      if (isMounted.current) setContacts(res?.data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    let socket;
    try {
      socket = getSocket();
    } catch {
      socket = initSocket(localStorage.getItem("token"));
    }
    socketRef.current = socket;

    const handleNotification = (data) => {
      if (!isMounted.current) return;
      setContacts((prev) => {
        if (prev.some((c) => c._id === data._id)) return prev;
        return [data, ...prev];
      });
      toast.info(`New message from ${data.name}`);
    };

    const handleReplyReceive = (data) => {
      if (!isMounted.current) return;
      if (data.tempId && sentTempIds.current.has(data.tempId)) {
        sentTempIds.current.delete(data.tempId);
        return;
      }
      setContacts((prev) =>
        prev.map((c) => {
          if (c._id !== data.contactId) return c;
          const exists = (c.replies || []).some((r) => r._id === data._id);
          if (exists) return c;
          return {
            ...c,
            replies: [
              ...(c.replies || []),
              {
                _id: data._id,
                message: data.message,
                sender: data.sender,
                createdAt: data.createdAt || new Date().toISOString(),
              },
            ],
          };
        }),
      );
    };

    const handleTyping = (data) => {
      if (!isMounted.current) return;
      if (data.contactId !== selectedId) return;
      setIsTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setIsTyping(false), 2500);
    };

    socket.on("contact_notification", handleNotification);
    socket.on("contact_reply_receive", handleReplyReceive);
    socket.on("contact_typing", handleTyping);

    return () => {
      socket.off("contact_notification", handleNotification);
      socket.off("contact_reply_receive", handleReplyReceive);
      socket.off("contact_typing", handleTyping);
    };
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId || !socketRef.current) return;
    socketRef.current.emit("join_contact", { contactId: selectedId });
    return () => {
      socketRef.current?.emit("leave_contact", { contactId: selectedId });
    };
  }, [selectedId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [timeline.length, isTyping]);

  const sendReply = async () => {
    if (!selectedId || !message.trim() || charCount > MAX_CHARS) return;

    const text = message.trim();
    const tempId = `temp_${Date.now()}_${Math.random()}`;

    setMessage("");
    sentTempIds.current.add(tempId);

    setContacts((prev) =>
      prev.map((c) =>
        c._id === selectedId
          ? {
              ...c,
              replies: [
                ...(c.replies || []),
                {
                  tempId,
                  message: text,
                  sender: "admin",
                  createdAt: new Date().toISOString(),
                  _status: "sending",
                },
              ],
            }
          : c,
      ),
    );

    try {
      await replyMessage(selectedId, text, tempId);

      setContacts((prev) =>
        prev.map((c) =>
          c._id === selectedId
            ? {
                ...c,
                status: "replied",
                replies: c.replies.map((r) =>
                  r.tempId === tempId ? { ...r, _status: "sent" } : r,
                ),
              }
            : c,
        ),
      );
    } catch {
      toast.error("Reply failed");
      setContacts((prev) =>
        prev.map((c) =>
          c._id === selectedId
            ? {
                ...c,
                replies: c.replies.map((r) =>
                  r.tempId === tempId ? { ...r, _status: "failed" } : r,
                ),
              }
            : c,
        ),
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  const markResolved = async () => {
    if (!selectedId) return;
    try {
      setContacts((prev) =>
        prev.map((c) =>
          c._id === selectedId ? { ...c, status: "resolved" } : c,
        ),
      );
      toast.success("Conversation resolved");
    } catch {
      toast.error("Failed to resolve");
    }
  };

  const handleDelete = async (contactId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this conversation?")) return;
    try {
      await deleteMessage(contactId);
      setContacts((prev) => prev.filter((c) => c._id !== contactId));
      if (selectedId === contactId) setSelectedId(null);
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className={styles.chatLayout}>
      {/* ══════════════ LEFT PANEL ══════════════ */}
      <div className={styles.leftPanel}>
        {/* Header */}
        <div className={styles.header}>
          <h3>Inbox</h3>
          <div className={styles.headerActions}>
            <button
              onClick={() => fetchContacts(false)}
              className={`${styles.refreshBtn} ${refreshing ? styles.spinning : ""}`}
              title="Refresh"
            >
              <FiRefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span className={styles.tabCount}>{tabCounts[t]}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className={styles.searchBox}>
          <FiSearch size={13} />
          <input
            id="contact-search"
            name="contactSearch"
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                display: "flex",
              }}
            >
              <FiX size={12} />
            </button>
          )}
        </div>

        {/* List */}
        <div className={styles.contactList}>
          {loading ? (
            <div className={styles.loadingList}>Loading conversations…</div>
          ) : filteredContacts.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <FiInbox size={18} />
              </div>
              <p>{search ? "No results found" : "No conversations yet"}</p>
              <p>
                {search
                  ? "Try a different search term"
                  : "Messages from the contact form will appear here"}
              </p>
            </div>
          ) : (
            filteredContacts.map((c) => (
              <div
                key={c._id}
                className={[
                  styles.contactItem,
                  selectedId === c._id ? styles.active : "",
                  c.status === "new" ? styles.unread : "",
                ].join(" ")}
                onClick={() => setSelectedId(c._id)}
              >
                <div className={styles.contactAvatar}>
                  {initial(c.name)}
                  <span className={styles.onlineDotSmall} />
                </div>

                <div className={styles.contactText}>
                  <strong>{c.name}</strong>
                  <p>
                    {c.subject ? `[${c.subject}] ` : ""}
                    {c.message}
                  </p>
                </div>

                <div className={styles.meta}>
                  <span className={styles.time}>
                    {formatTime(c.updatedAt || c.createdAt)}
                  </span>
                  <span
                    className={`${styles.statusBadge} ${styles[c.status ?? "new"]}`}
                  >
                    {c.status ?? "new"}
                  </span>
                  <button
                    onClick={(e) => handleDelete(c._id, e)}
                    className={styles.deleteBtn}
                    title="Delete"
                  >
                    <FiTrash2 size={11} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <div className={styles.rightPanel}>
        {!selected ? (
          <div className={styles.emptyChat}>
            <div className={styles.emptyChatIcon}>
              <FiMessageSquare size={22} />
            </div>
            <h3>No conversation selected</h3>
            <p>
              Pick a conversation from the inbox to start replying in real-time
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderAvatar}>
                {initial(selected.name)}
              </div>
              <div className={styles.chatHeaderInfo}>
                <h3>{selected.name}</h3>
                <p>{selected.email}</p>
              </div>

              {selected.subject && (
                <span className={styles.subjectTag} title={selected.subject}>
                  {selected.subject}
                </span>
              )}

              <div className={styles.chatHeaderMeta}>
                {selected.status !== "resolved" && (
                  <button
                    className={`${styles.headerBtn} ${styles.resolve}`}
                    onClick={markResolved}
                    title="Mark as resolved"
                  >
                    <FiCheckCircle size={14} />
                  </button>
                )}
                <button
                  className={`${styles.headerBtn} ${styles.danger}`}
                  onClick={(e) => handleDelete(selected._id, e)}
                  title="Delete conversation"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>

            {/* Resolved banner */}
            {selected.status === "resolved" && (
              <div className={styles.resolvedBanner}>
                <FiCheckCircle size={13} />
                This conversation has been marked as resolved
              </div>
            )}

            {/* Chat body */}
            <div className={styles.chatBody}>
              {timeline.map((item) => {
                if (item.type === "separator") {
                  return (
                    <div key={item.key} className={styles.dateSeparator}>
                      <span>{formatDate(item.date)}</span>
                    </div>
                  );
                }

                const isAdmin = item.sender === "admin";
                const statusClass =
                  item._status === "sending"
                    ? styles.sending
                    : item._status === "failed"
                      ? styles.failed
                      : "";

                return (
                  <div
                    key={item._id || item.tempId}
                    className={`${isAdmin ? styles.msgRight : styles.msgLeft} ${statusClass}`}
                  >
                    {item.message}
                    <span className={styles.msgTime}>
                      {item._status === "sending"
                        ? "Sending…"
                        : item._status === "failed"
                          ? "Failed to send"
                          : formatTime(item.createdAt)}
                    </span>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className={styles.typingIndicator}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input row */}
            <div className={styles.chatInputRow}>
              <div className={styles.chatInputWrap}>
                <input
                  value={message}
                  id="reply-message"
                  name="replyMessage"
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    selected.status === "resolved"
                      ? "Conversation resolved — reopen to reply"
                      : "Type a reply… (Enter to send)"
                  }
                  className={styles.chatInput}
                  disabled={selected.status === "resolved"}
                  maxLength={MAX_CHARS + 10}
                />
                {charCount > MAX_CHARS * 0.7 && (
                  <span className={`${styles.charCount} ${charClass}`}>
                    {charCount}/{MAX_CHARS}
                  </span>
                )}
              </div>

              <button
                onClick={sendReply}
                disabled={
                  !message.trim() ||
                  charCount > MAX_CHARS ||
                  selected.status === "resolved"
                }
                className={styles.sendBtn}
                title="Send reply"
              >
                <FiSend size={15} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Contacts;
