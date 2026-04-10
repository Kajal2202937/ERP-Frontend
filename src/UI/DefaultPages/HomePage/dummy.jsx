import styles from "./HomePage.module.css";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>ERP System</h1>

          {!user ? (
            <>
              <p className={styles.subtitle}>
                Manage Inventory, Products, Orders, Production & Suppliers in
                one place.
              </p>
              <div className={styles.buttons}>
                <button
                  onClick={() => navigate("/login")}
                  className={styles.loginBtn}
                >
                  Login
                </button>

                <button
                  onClick={() => navigate("/register")}
                  className={styles.registerBtn}
                >
                  Register
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>Welcome, {user.name}</h2>
              <p>Role: {user.role}</p>

              <div className={styles.buttons}>
                {(user.role === "admin" || user.role === "manager") && (
                  <button onClick={handleDashboard} className={styles.loginBtn}>
                    Go to Dashboard
                  </button>
                )}

                <button onClick={logout} className={styles.registerBtn}>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default HomePage;
