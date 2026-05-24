import { useNavigate } from "react-router-dom";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 16,
        background: "var(--color-bg, #fff)",
        padding: 24,
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: 72 }}>🔍</span>
      <h1
        style={{
          margin: 0,
          fontSize: 48,
          fontWeight: 800,
          color: "var(--color-primary, #6366f1)",
        }}
      >
        404
      </h1>
      <h2
        style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 600,
          color: "var(--color-text, #1a1a1a)",
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          margin: 0,
          fontSize: 15,
          color: "var(--color-muted, #888)",
          maxWidth: 380,
        }}
      >
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            border: "2px solid var(--color-primary, #6366f1)",
            background: "transparent",
            color: "var(--color-primary, #6366f1)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← Go Back
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
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
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default NotFound;
