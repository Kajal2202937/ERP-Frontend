import { useState, useRef, useEffect, useCallback } from "react";
import { FiSearch, FiChevronDown, FiX } from "react-icons/fi";
import styles from "./SearchableSelect.module.css";

const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select…",
  error,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const selectedOption = options.find((o) => o.value === value);

  const filtered = query.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : options;

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const handleToggle = () => {
    if (disabled) return;
    setOpen((v) => !v);
    setQuery("");
  };

  const handleSelect = useCallback(
    (optValue) => {
      onChange(optValue);
      setOpen(false);
      setQuery("");
    },
    [onChange],
  );

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.wrapper} ${error ? styles.hasError : ""} ${disabled ? styles.disabled : ""}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <div
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={handleToggle}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <span
          className={
            selectedOption ? styles.triggerValue : styles.triggerPlaceholder
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className={styles.triggerIcons}>
          {selectedOption && !disabled && (
            <span
              className={styles.clearBtn}
              onClick={handleClear}
              title="Clear"
            >
              <FiX size={12} />
            </span>
          )}
          <FiChevronDown
            size={13}
            className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          />
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className={styles.dropdown}>
          {/* Search box */}
          <div className={styles.searchBox}>
            <FiSearch size={13} className={styles.searchIcon} />
            <input
              ref={searchRef}
              className={styles.searchInput}
              type="text"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {query && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={() => setQuery("")}
              >
                <FiX size={11} />
              </button>
            )}
          </div>

          {/* Options list */}
          <ul ref={listRef} className={styles.list} role="listbox">
            {filtered.length === 0 ? (
              <li className={styles.noResults}>No results found</li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={opt.value === value}
                  className={`${styles.option} ${opt.value === value ? styles.optionSelected : ""}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                  {opt.value === value && (
                    <span className={styles.checkMark}>✓</span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
