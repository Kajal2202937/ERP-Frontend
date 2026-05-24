import { useEffect, useState, useRef, useCallback } from "react";
import useAI from "../../hooks/useAI";
import styles from "./AIChat.module.css";
import { FiSend, FiX, FiCpu, FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const MAX_INPUT = 2000;

const WELCOME = {
  role: "assistant",
  content:
    "Hello! I'm your ERP assistant. Ask me anything about invoices, suppliers, inventory, or analytics.",
};

const renderMarkdown = (text) => {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let listItems = [];

  const flushList = (key) => {
    if (!listItems.length) return;
    elements.push(
      <ul key={`ul-${key}`} className={styles.mdList}>
        {listItems.map((item, i) => (
          <li key={i}>{applyInline(item)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (/^[-•*]\s+/.test(trimmed)) {
      listItems.push(trimmed.replace(/^[-•*]\s+/, ""));
      return;
    }

    flushList(i);

    if (!trimmed) {
      elements.push(<br key={`br-${i}`} />);
    } else if (/^#{1,3}\s/.test(trimmed)) {
      const level = trimmed.match(/^(#{1,3})/)[0].length;
      const content = trimmed.replace(/^#{1,3}\s+/, "");
      const Tag = `h${level + 2}`;
      elements.push(
        <Tag key={i} className={styles.mdHeading}>
          {applyInline(content)}
        </Tag>,
      );
    } else {
      elements.push(
        <p key={i} className={styles.mdPara}>
          {applyInline(trimmed)}
        </p>,
      );
    }
  });

  flushList("end");
  return elements;
};

const applyInline = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    /^\*\*/.test(part) ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  );
};

const AIChat = ({ context = {}, onClose }) => {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const { chat, chatLoading, chatError } = useAI();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || chatLoading) return;

    const userMsg = { role: "user", content: text };
    const updated = [...messages, userMsg];

    setMessages(updated);
    setInput("");
    textareaRef.current?.focus();

    const history = updated
      .filter((m) => m !== WELCOME)
      .map(({ role, content }) => ({ role, content }));

    const result = await chat(history, context);

    const reply =
      result?.data?.reply ||
      (typeof result === "string" ? result : null) ||
      "I couldn't generate a response. Please try again.";

    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
  }, [input, chatLoading, messages, chat, context]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const remaining = MAX_INPUT - input.length;

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <FiCpu className={styles.headerIcon} />
          <span>ERP Assistant</span>
        </div>
        {onClose && (
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <FiX />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={`${styles.bubble} ${msg.role === "user" ? styles.user : styles.assistant}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {msg.role === "assistant"
                ? renderMarkdown(msg.content)
                : msg.content}
            </motion.div>
          ))}

          {chatLoading && (
            <motion.div
              className={`${styles.bubble} ${styles.assistant} ${styles.typing}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span />
              <span />
              <span />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {chatError && (
        <p className={styles.error}>
          <FiAlertCircle style={{ verticalAlign: "middle", marginRight: 4 }} />
          {chatError}
        </p>
      )}

      {/* Input */}
      <div className={styles.inputRow}>
        <div className={styles.inputWrap}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT))}
            onKeyDown={handleKeyDown}
            placeholder="Ask the ERP assistant…"
            rows={1}
            maxLength={MAX_INPUT}
            aria-label="Message input"
          />
          {input.length > MAX_INPUT * 0.8 && (
            <span
              className={styles.charCount}
              style={{
                color:
                  remaining < 50 ? "var(--color-error, #e53e3e)" : undefined,
              }}
            >
              {remaining}
            </span>
          )}
        </div>

        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={chatLoading || !input.trim()}
          aria-label="Send message"
          type="button"
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
};

export default AIChat;
