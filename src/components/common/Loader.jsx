export default function Loader({
  fullscreen = false,
  size = "md",
  text = "Loading...",
}) {
  const sizes = { sm: 20, md: 36, lg: 56 };
  const px = sizes[size] || 36;

  const spinner = (
    <div
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
        style={{ animation: "spin 0.9s linear infinite" }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="var(--color-primary, #6366f1)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="90 150"
          strokeDashoffset="0"
        />
      </svg>
      {text && (
        <span style={{ color: "var(--color-muted, #888)", fontSize: 14 }}>
          {text}
        </span>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
          background: "var(--color-bg, #fff)",
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
