import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

// Shown by ProtectedRoute when the user is authenticated but their role
// doesn't satisfy allowedRoles for the requested route.
const AccessDenied = ({ userRole, requiredRoles = [] }) => {
  const navigate  = useNavigate();
  const { logout } = useAuth();

  const handleGoBack = () => navigate(-1);
  const handleHome   = () => navigate("/dashboard");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "2rem",
        textAlign: "center",
        color: "var(--text1)",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: "1rem" }}>🔒</div>

      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Access Denied
      </h1>

      <p style={{ color: "var(--text3)", maxWidth: 420, marginBottom: "0.5rem" }}>
        Your account role (<strong>{userRole}</strong>) does not have permission
        to view this page.
      </p>

      {requiredRoles.length > 0 && (
        <p style={{ color: "var(--text3)", fontSize: 13, marginBottom: "1.5rem" }}>
          Required: {requiredRoles.join(", ")}
        </p>
      )}

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={handleGoBack}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--surface2)",
            color: "var(--text1)",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ← Go Back
        </button>
        <button
          onClick={handleHome}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: 8,
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;