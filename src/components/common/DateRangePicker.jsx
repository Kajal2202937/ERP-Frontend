import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, X } from "lucide-react";
import styles from "./DateRangePicker.module.css";

const PRESETS = [
  { label: "Today", days: 0 },
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
];

const toISO = (date) => date.toISOString().split("T")[0];

const getPresetRange = (days) => {
  const to = new Date();
  const from = new Date();
  if (days === 0) {
    return { from: toISO(from), to: toISO(to) };
  }
  from.setDate(from.getDate() - days);
  return { from: toISO(from), to: toISO(to) };
};

const formatDisplay = (value) => {
  if (!value.from && !value.to) return "All time";
  if (value.from && value.to) {
    const f = new Date(value.from).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    const t = new Date(value.to).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${f} – ${t}`;
  }
  if (value.from)
    return `From ${new Date(value.from).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
  return "Pick a range";
};

export default function DateRangePicker({ value, onChange, presets = true }) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [draft, setDraft] = useState(value);
  const wrapRef = useRef(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const applyPreset = (days, label) => {
    const range = getPresetRange(days);
    setDraft(range);
    setActivePreset(label);
    onChange(range);
    setOpen(false);
  };

  const applyCustom = () => {
    if (draft.from && draft.to && draft.from > draft.to) {
      setDraft({ from: draft.to, to: draft.from });
      onChange({ from: draft.to, to: draft.from });
    } else {
      onChange(draft);
    }
    setActivePreset(null);
    setOpen(false);
  };

  const clearRange = (e) => {
    e.stopPropagation();
    const cleared = { from: null, to: null };
    setDraft(cleared);
    setActivePreset(null);
    onChange(cleared);
  };

  const hasValue = value.from || value.to;

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Date range: ${formatDisplay(value)}`}
      >
        <Calendar size={13} aria-hidden="true" />
        <span className={styles.triggerLabel}>{formatDisplay(value)}</span>
        {hasValue ? (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={clearRange}
            aria-label="Clear date range"
          >
            <X size={11} />
          </button>
        ) : (
          <ChevronDown
            size={12}
            className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
            aria-hidden="true"
          />
        )}
      </button>

      {open && (
        <div
          className={styles.panel}
          role="dialog"
          aria-label="Select date range"
        >
          {/* Presets */}
          {presets && (
            <div className={styles.presets}>
              {PRESETS.map(({ label, days }) => (
                <button
                  key={label}
                  type="button"
                  className={`${styles.preset} ${activePreset === label ? styles.presetActive : ""}`}
                  onClick={() => applyPreset(days, label)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className={styles.divider} aria-hidden="true" />

          {/* Custom range inputs */}
          <div className={styles.inputs}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="drp-from">
                From
              </label>
              <input
                id="drp-from"
                type="date"
                className={styles.input}
                value={draft.from ?? ""}
                max={draft.to ?? toISO(new Date())}
                onChange={(e) => {
                  setDraft((d) => ({ ...d, from: e.target.value || null }));
                  setActivePreset(null);
                }}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="drp-to">
                To
              </label>
              <input
                id="drp-to"
                type="date"
                className={styles.input}
                value={draft.to ?? ""}
                min={draft.from ?? undefined}
                max={toISO(new Date())}
                onChange={(e) => {
                  setDraft((d) => ({ ...d, to: e.target.value || null }));
                  setActivePreset(null);
                }}
              />
            </div>
          </div>

          <button
            type="button"
            className={styles.applyBtn}
            onClick={applyCustom}
            disabled={!draft.from && !draft.to}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
