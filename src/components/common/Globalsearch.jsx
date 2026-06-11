import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Users,
  Factory,
  BarChart3,
  TicketCheck,
  ArrowRight,
  Clock,
  Pin,
  PinOff,
  Command,
  Sparkles,
} from "lucide-react";
import styles from "./Globalsearch.module.css";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    shortcut: "⌘1",
    description: "Overview & KPIs",
  },
  {
    id: "inventory",
    label: "Inventory",
    path: "/inventory",
    icon: Boxes,
    shortcut: "⌘2",
    description: "Stock levels & transfers",
  },
  {
    id: "orders",
    label: "Orders",
    path: "/orders",
    icon: ShoppingCart,
    shortcut: "⌘3",
    description: "Purchase & sales orders",
  },
  {
    id: "products",
    label: "Products",
    path: "/products",
    icon: Package,
    shortcut: "⌘4",
    description: "Product catalogue",
  },
  {
    id: "suppliers",
    label: "Suppliers",
    path: "/suppliers",
    icon: Users,
    shortcut: "⌘5",
    description: "Vendor management",
  },
  {
    id: "production",
    label: "Production",
    path: "/production",
    icon: Factory,
    shortcut: "⌘6",
    description: "Manufacturing runs",
  },
  {
    id: "reports",
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
    shortcut: "⌘7",
    description: "Analytics & exports",
  },
  {
    id: "tickets",
    label: "Support",
    path: "/tickets",
    icon: TicketCheck,
    shortcut: "⌘8",
    description: "Help desk & issues",
  },
];

const RECENT_KEY = "erp_recent_pages";
const PINNED_KEY = "erp_pinned_pages";
const MAX_RECENT = 6;
const MAX_PINNED = 6;

const load = (key, fallback = []) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
};
const save = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
};

const addRecent = (item) => {
  const prev = load(RECENT_KEY).filter((r) => r.id !== item.id);
  save(RECENT_KEY, [item, ...prev].slice(0, MAX_RECENT));
};

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState([]);
  const [pinned, setPinned] = useState([]);
  const [aiHint, setAiHint] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const aiTimer = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Load persisted state when opening
  useEffect(() => {
    if (open) {
      setRecent(load(RECENT_KEY));
      setPinned(load(PINNED_KEY));
    }
  }, [open]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opening; reset when closing
  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
      setAiHint("");
      setActiveTab("all");
      return;
    }
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // Reset active index on query change
  useEffect(() => {
    setActive(0);
  }, [query]);

  // --- Filtered results ---
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return [...NAV_ITEMS]
      .filter(
        (i) =>
          i.label.toLowerCase().includes(q) ||
          i.path.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const aS = a.label.toLowerCase().startsWith(q);
        const bS = b.label.toLowerCase().startsWith(q);
        return aS === bS ? 0 : aS ? -1 : 1;
      });
  }, [query]);

  // --- Sections based on tab + query ---
  const sections = useMemo(() => {
    if (query) {
      return filtered.length
        ? [{ title: "Results", badge: "result", items: filtered }]
        : [];
    }
    if (activeTab === "pinned")
      return [{ title: "Pinned", badge: "pinned", items: pinned }];
    if (activeTab === "recent")
      return [{ title: "Recent", badge: "recent", items: recent }];
    if (activeTab === "nav")
      return [{ title: "Navigation", badge: "nav", items: NAV_ITEMS }];
    // "all" tab
    const all = [];
    if (pinned.length)
      all.push({ title: "Pinned", badge: "pinned", items: pinned });
    if (recent.length)
      all.push({ title: "Recent", badge: "recent", items: recent.slice(0, 3) });
    all.push({ title: "Navigation", badge: "nav", items: NAV_ITEMS });
    return all;
  }, [query, filtered, activeTab, pinned, recent]);

  const flatItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  // Scroll active item into view
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  // --- AI hint (debounced) ---
  useEffect(() => {
    clearTimeout(aiTimer.current);
    if (query.trim().length < 3) {
      setAiHint("");
      return;
    }
    aiTimer.current = setTimeout(() => fetchAiHint(query.trim()), 650);
    return () => clearTimeout(aiTimer.current);
  }, [query]);

  const fetchAiHint = async (q) => {
    setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 100,
          system:
            "You are a concise assistant inside an ERP command palette. For any search query, reply with 1 short sentence (max 20 words) explaining what the user will find or answering a quick factual question. No preamble.",
          messages: [{ role: "user", content: q }],
        }),
      });
      const data = await res.json();
      setAiHint(data?.content?.[0]?.text?.trim() || "");
    } catch {
      setAiHint("");
    } finally {
      setAiLoading(false);
    }
  };

  // --- Pin / unpin ---
  const togglePin = useCallback((item) => {
    setPinned((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      const next = exists
        ? prev.filter((p) => p.id !== item.id)
        : [
            { id: item.id, label: item.label, path: item.path, icon: item.id },
            ...prev,
          ].slice(0, MAX_PINNED);
      save(PINNED_KEY, next);
      return next;
    });
  }, []);

  const isPinned = useCallback(
    (id) => pinned.some((p) => p.id === id),
    [pinned],
  );

  // --- Navigate ---
  const navigateTo = useCallback(
    (item) => {
      addRecent({
        id: item.id,
        label: item.label,
        path: item.path,
        icon: item.id,
      });
      navigate(item.path);
      setOpen(false);
    },
    [navigate],
  );

  // --- Keyboard navigation ---
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((v) => (flatItems.length ? (v + 1) % flatItems.length : 0));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((v) =>
        flatItems.length ? (v - 1 + flatItems.length) % flatItems.length : 0,
      );
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const item = flatItems[active];
      if (item) navigateTo(item);
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
      e.preventDefault();
      togglePin(flatItems[active]);
    }
  };

  const resolveIcon = (id) =>
    NAV_ITEMS.find((n) => n.id === id)?.icon ?? LayoutDashboard;

  // --- Highlight match ---
  const highlight = (text, q) => {
    if (!q.trim()) return text;
    const re = new RegExp(
      `(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    return text.replace(re, '<mark class="hl">$1</mark>');
  };

  let globalIdx = 0;

  const tabs = [
    { id: "all", label: "All" },
    {
      id: "pinned",
      label: `Pinned${pinned.length ? ` (${pinned.length})` : ""}`,
    },
    { id: "recent", label: "Recent" },
    { id: "nav", label: "Navigation" },
  ];

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                className={styles.backdrop}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />

              <motion.div
                className={styles.panel}
                initial={{ opacity: 0, scale: 0.96, y: -12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -8 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                role="dialog"
                aria-modal="true"
                aria-label="Global search"
              >
                {/* Input row */}
                <div className={styles.inputWrap}>
                  <Search
                    size={15}
                    className={styles.inputIcon}
                    aria-hidden="true"
                  />
                  <input
                    ref={inputRef}
                    role="combobox"
                    aria-expanded={flatItems.length > 0}
                    aria-autocomplete="list"
                    aria-activedescendant={
                      flatItems[active] ? `gs-item-${active}` : undefined
                    }
                    aria-label="Search pages and actions"
                    className={styles.input}
                    placeholder="Search pages, actions, modules…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {query && (
                    <button
                      type="button"
                      className={styles.clearBtn}
                      onClick={() => {
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                      aria-label="Clear search"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>

                {/* Tabs — only show when no query */}
                {!query && (
                  <div
                    className={styles.tabRow}
                    role="tablist"
                    aria-label="Filter sections"
                  >
                    {tabs.map((t) => (
                      <button
                        key={t.id}
                        role="tab"
                        aria-selected={activeTab === t.id}
                        className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ""}`}
                        onClick={() => {
                          setActiveTab(t.id);
                          setActive(0);
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Results */}
                <div
                  className={styles.results}
                  ref={listRef}
                  role="listbox"
                  aria-label="Search results"
                >
                  {sections.length === 0 && (
                    <div className={styles.empty}>
                      <Search size={20} aria-hidden="true" />
                      <p>
                        {query ? (
                          <>
                            No results for "<strong>{query}</strong>"
                          </>
                        ) : (
                          "Nothing here yet"
                        )}
                      </p>
                    </div>
                  )}

                  {sections.map((section) => {
                    const sectionStart = globalIdx;
                    return (
                      <div
                        key={section.title + sectionStart}
                        className={styles.section}
                      >
                        <p className={styles.sectionTitle}>
                          {section.badge === "recent" && (
                            <Clock size={10} style={{ marginRight: 4 }} />
                          )}
                          {section.badge === "pinned" && (
                            <Pin size={10} style={{ marginRight: 4 }} />
                          )}
                          {section.title}
                        </p>

                        {section.items.map((item) => {
                          const idx = globalIdx++;
                          const Icon =
                            typeof item.icon === "string"
                              ? resolveIcon(item.icon)
                              : item.icon;
                          const isAct = active === idx;
                          const pinned_ = isPinned(item.id);
                          const navMeta = NAV_ITEMS.find(
                            (n) => n.id === item.id,
                          );

                          return (
                            <button
                              key={item.id + idx}
                              id={`gs-item-${idx}`}
                              data-idx={idx}
                              type="button"
                              role="option"
                              aria-selected={isAct}
                              className={`${styles.item} ${isAct ? styles.itemActive : ""}`}
                              onClick={(e) => {
                                if (e.target.closest(`.${styles.pinBtn}`))
                                  return;
                                navigateTo(item);
                              }}
                              onMouseEnter={() => setActive(idx)}
                            >
                              <span
                                className={styles.itemIcon}
                                aria-hidden="true"
                              >
                                <Icon size={14} strokeWidth={1.8} />
                              </span>

                              <span className={styles.itemBody}>
                                <span
                                  className={styles.itemLabel}
                                  dangerouslySetInnerHTML={{
                                    __html: highlight(item.label, query),
                                  }}
                                />
                                {navMeta?.description && (
                                  <span className={styles.itemDesc}>
                                    {navMeta.description}
                                  </span>
                                )}
                              </span>

                              <span className={styles.itemMeta}>
                                <span className={styles.itemPath}>
                                  {item.path}
                                </span>
                                {navMeta?.shortcut && (
                                  <span className={styles.shortcutBadge}>
                                    {navMeta.shortcut}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  className={`${styles.pinBtn} ${pinned_ ? styles.pinned : ""}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePin(item);
                                  }}
                                  aria-label={`${pinned_ ? "Unpin" : "Pin"} ${item.label}`}
                                  title={pinned_ ? "Unpin" : "Pin"}
                                >
                                  {pinned_ ? (
                                    <PinOff size={12} />
                                  ) : (
                                    <Pin size={12} />
                                  )}
                                </button>
                              </span>

                              {isAct && (
                                <ArrowRight
                                  size={12}
                                  className={styles.itemArrow}
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* AI hint */}
                <AnimatePresence>
                  {(aiHint || aiLoading) && (
                    <motion.div
                      className={styles.aiHint}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Sparkles
                        size={11}
                        className={styles.aiIcon}
                        aria-hidden="true"
                      />
                      {aiLoading ? (
                        <span className={styles.aiLoading}>Thinking…</span>
                      ) : (
                        <span>{aiHint}</span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer */}
                <div className={styles.footer} aria-hidden="true">
                  <span>
                    <kbd>↑↓</kbd> Navigate
                  </span>
                  <span>
                    <kbd>↵</kbd> Open
                  </span>
                  <span>
                    <kbd>⌘P</kbd> Pin
                  </span>
                  <span>
                    <kbd>Esc</kbd> Close
                  </span>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

export function SearchTrigger() {
  const isMac =
    typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);

  const openSearch = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: !isMac,
        metaKey: isMac,
        bubbles: true,
      }),
    );
  };

  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Open global search"
      aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
      className={styles.searchTrigger}
    >
      <Search size={13} aria-hidden="true" />
      <span>Search</span>
      <kbd>{isMac ? "⌘" : "Ctrl"}K</kbd>
    </button>
  );
}
