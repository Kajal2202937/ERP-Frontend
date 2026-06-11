export default function Loader({
  fullscreen = false,
  size = "md",
  text = null,
  label = "Loading",
}) {
  const sizes = { sm: 20, md: 36, lg: 56 };
  const px = sizes[size] ?? 36;

  const spinner = (
    <div
      role="status"
      aria-label={label}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 50 50"
        aria-hidden="true"
        style={{ animation: "spin 0.9s linear infinite" }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="90 150"
          strokeDashoffset="0"
        />
      </svg>

      {text && (
        <span
          aria-hidden="true"
          style={{
            color: "var(--text3)",
            fontSize: "var(--text-sm)",
            fontFamily: "var(--font)",
          }}
        >
          {text}
        </span>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          zIndex: 9999,
        }}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}
    >
      {spinner}
    </div>
  );
}
