export function EmptyState({
  icon = "📭",
  title = "Nothing here yet",
  description = "",
  action = null,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "60px 24px",
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: 48 }}>{icon}</span>
      <h3
        style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 600,
          color: "var(--color-text, #1a1a1a)",
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "var(--color-muted, #888)",
            maxWidth: 320,
          }}
        >
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          style={{
            marginTop: 8,
            padding: "10px 24px",
            borderRadius: 8,
            border: "none",
            background: "var(--color-primary, #6366f1)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
