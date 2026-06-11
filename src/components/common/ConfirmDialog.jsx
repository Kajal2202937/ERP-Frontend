import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, XCircle, HelpCircle, X } from "lucide-react";
import styles from "./ConfirmDialog.module.css";

/**
 * ConfirmDialog
 * ─────────────
 * Drop-in replacement for all window.confirm() calls in the app.
 *
 * Usage:
 *   const [dialog, setDialog] = useState(null);
 *
 *
 *   setDialog({
 *     title: "Delete Order #1234?",
 *     message: "This cannot be undone.",
 *     variant: "danger",
 *     confirmLabel: "Delete",
 *     cancelLabel: "Cancel",
 *     onConfirm: () => doDelete(),
 *   });
 *
 *
 *   <ConfirmDialog config={dialog} onClose={() => setDialog(null)} />
 *
 * Accessibility:
 *  - Renders in a portal at document.body
 *  - Moves focus to the Cancel button on open (safe default)
 *  - Traps focus inside the dialog while open
 *  - Closes on Escape key
 *  - Returns focus to the trigger element on close
 *  - role="alertdialog" + aria-modal + aria-labelledby + aria-describedby
 */

const VARIANT_META = {
  danger: {
    icon: Trash2,
    iconClass: "iconDanger",
    confirmClass: "btnDanger",
    defaultConfirmLabel: "Delete",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "iconWarning",
    confirmClass: "btnWarning",
    defaultConfirmLabel: "Confirm",
  },
  info: {
    icon: HelpCircle,
    iconClass: "iconInfo",
    confirmClass: "btnInfo",
    defaultConfirmLabel: "OK",
  },
};

export default function ConfirmDialog({ config, onClose }) {
  const cancelRef = useRef(null);
  const triggerRef = useRef(null);

  const isOpen = !!config;

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;

      requestAnimationFrame(() => cancelRef.current?.focus());
    } else {
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = document.getElementById("confirm-dialog-root");
    if (!dialog) return;

    const focusable = () => [
      ...dialog.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ];

    const onTab = (e) => {
      if (e.key !== "Tab") return;
      const els = focusable();
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onTab);
    return () => document.removeEventListener("keydown", onTab);
  }, [isOpen]);

  const handleConfirm = () => {
    config?.onConfirm?.();
    onClose();
  };

  const variant = config?.variant ?? "danger";
  const meta = VARIANT_META[variant] ?? VARIANT_META.danger;
  const Icon = meta.icon;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            id="confirm-dialog-root"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby={config?.message ? "confirm-desc" : undefined}
            className={styles.dialog}
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Close × */}
            <button
              type="button"
              className={styles.closeX}
              onClick={onClose}
              aria-label="Cancel"
            >
              <X size={14} strokeWidth={2.2} />
            </button>

            {/* Icon */}
            <div
              className={`${styles.iconWrap} ${styles[meta.iconClass]}`}
              aria-hidden="true"
            >
              <Icon size={22} strokeWidth={1.8} />
            </div>

            {/* Text */}
            <h2 id="confirm-title" className={styles.title}>
              {config?.title ?? "Are you sure?"}
            </h2>

            {config?.message && (
              <p id="confirm-desc" className={styles.message}>
                {config.message}
              </p>
            )}

            {/* Actions */}
            <div className={styles.actions}>
              <button
                ref={cancelRef}
                type="button"
                className={styles.btnCancel}
                onClick={onClose}
              >
                {config?.cancelLabel ?? "Cancel"}
              </button>
              <button
                type="button"
                className={`${styles.btnConfirm} ${styles[meta.confirmClass]}`}
                onClick={handleConfirm}
              >
                {config?.confirmLabel ?? meta.defaultConfirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
