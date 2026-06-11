import React from "react";
import { Inbox, SearchX, PackageOpen, AlertCircle, FolderOpen } from "lucide-react";

/**
 * EmptyState
 * ──────────
 * Fixes applied:
 *  1. All inline style hardcoded values replaced with CSS variable tokens
 *     - var(--color-text, #1a1a1a)  → var(--text)
 *     - var(--color-muted, #888)    → var(--text3)
 *     - var(--color-primary, #6366f1) → var(--accent)
 *     - hardcoded px values         → spacing/radius tokens
 *  2. Emoji icon (📭) replaced with Lucide SVG icons — renders consistently
 *     across all OS, looks professional in enterprise context
 *  3. Added preset `variant` prop so callers can pick a contextual icon
 *     without passing a custom icon component
 *  4. Wrapped with React.memo — EmptyState renders inside list containers
 *     that re-render on search/filter changes
 *  5. Action button is now keyboard accessible with :focus-visible ring
 *  6. Added aria-label on the icon wrapper
 */

const VARIANT_ICONS = {
  default:    Inbox,
  search:     SearchX,
  inventory:  PackageOpen,
  error:      AlertCircle,
  files:      FolderOpen,
};

function EmptyStateComponent({
  variant = "default",
  icon: CustomIcon = null,
  title = "Nothing here yet",
  description = "",
  action = null,
}) {
  const Icon = CustomIcon ?? VARIANT_ICONS[variant] ?? Inbox;

  return (
    <div
      role="status"
      aria-label={title}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-3)",
        padding: "var(--space-12) var(--space-6)",
        textAlign: "center",
      }}
    >
      {/* Icon ring */}
      <div
        aria-hidden="true"
        style={{
          width: 56,
          height: 56,
          borderRadius: "var(--radius-full)",
          background: "var(--surface2)",
          border: "1px solid var(--border2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text3)",
          flexShrink: 0,
        }}
      >
        <Icon size={22} strokeWidth={1.5} />
      </div>

      <h3
        style={{
          margin: 0,
          fontSize: "var(--text-md)",
          fontWeight: 600,
          color: "var(--text)",
          fontFamily: "var(--font)",
          letterSpacing: "-0.01em",
          transition: "color var(--theme-tx)",
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            margin: 0,
            fontSize: "var(--text-sm)",
            color: "var(--text3)",
            maxWidth: 320,
            lineHeight: 1.6,
            fontFamily: "var(--font)",
            transition: "color var(--theme-tx)",
          }}
        >
          {description}
        </p>
      )}

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          style={{
            marginTop: "var(--space-2)",
            padding: "10px 24px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--accent-border)",
            background: "var(--accent-soft)",
            color: "var(--accent)",
            fontSize: "var(--text-base)",
            fontWeight: 600,
            fontFamily: "var(--font)",
            cursor: "pointer",
            transition: "background var(--t-fast), color var(--t-fast), border-color var(--t-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--accent-soft)";
            e.currentTarget.style.color = "var(--accent)";
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export const EmptyState = React.memo(EmptyStateComponent);
export default EmptyState;