const STATUS_MAP = {
  active: { label: "Active", bg: "#dcfce7", color: "#166534" },
  inactive: { label: "Inactive", bg: "#f1f5f9", color: "#64748b" },
  disabled: { label: "Disabled", bg: "#f1f5f9", color: "#64748b" },

  pending: { label: "Pending", bg: "#fef9c3", color: "#854d0e" },
  completed: { label: "Completed", bg: "#dcfce7", color: "#166534" },
  cancelled: { label: "Cancelled", bg: "#fee2e2", color: "#991b1b" },
  started: { label: "Started", bg: "#dbeafe", color: "#1e40af" },
  "in-progress": { label: "In Progress", bg: "#fef3c7", color: "#92400e" },

  new: { label: "New", bg: "#ede9fe", color: "#5b21b6" },
  read: { label: "Read", bg: "#f1f5f9", color: "#475569" },
  replied: { label: "Replied", bg: "#dcfce7", color: "#166534" },
  resolved: { label: "Resolved", bg: "#d1fae5", color: "#065f46" },

  low: { label: "Low Stock", bg: "#fef9c3", color: "#854d0e" },
  available: { label: "Available", bg: "#dcfce7", color: "#166534" },
  out: { label: "Out of Stock", bg: "#fee2e2", color: "#991b1b" },
};

export function StatusBadge({ status, customLabel }) {
  const key = status?.toLowerCase?.() ?? "";
  const { label, bg, color } = STATUS_MAP[key] || {
    label: customLabel || status || "Unknown",
    bg: "#f1f5f9",
    color: "#64748b",
  };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: bg,
        color,
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      {customLabel || label}
    </span>
  );
}
