import styles from "./InventoryInfo.module.css";
import { useNavigate } from "react-router-dom";
import {
  FiPackage,
  FiLayers,
  FiRefreshCw,
  FiBarChart2,
} from "react-icons/fi";

const InventoryInfo = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      {/* HERO */}
      <section className={styles.hero}>
        <h1>Inventory Management</h1>
        <p>
          Efficiently track, manage, and optimize your inventory with our
          powerful ERP system.
        </p>
      </section>

      {/* FEATURES */}
      <section className={styles.features}>
        <h2>Key Features</h2>

        <div className={styles.grid}>
          <div>
            <FiPackage />
            <h3>Stock Tracking</h3>
            <p>Monitor stock levels in real-time across warehouses.</p>
          </div>

          <div>
            <FiLayers />
            <h3>Multi-Warehouse</h3>
            <p>Manage multiple warehouses and locations easily.</p>
          </div>

          <div>
            <FiRefreshCw />
            <h3>Auto Reordering</h3>
            <p>Automate restocking based on inventory thresholds.</p>
          </div>

          <div>
            <FiBarChart2 />
            <h3>Analytics</h3>
            <p>Get insights into stock usage and trends.</p>
          </div>
        </div>
      </section>

      {/* IMAGE / PREVIEW */}
      <section className={styles.preview}>
        <div className={styles.text}>
          <h2>Smart Inventory Control</h2>
          <p>
            Gain full visibility over your stock and streamline operations with
            automation and real-time data.
          </p>
        </div>

        <div className={styles.imageBox}>
          <div className={styles.mockCard}>
            <h4>Inventory Dashboard</h4>
            <p>Products • Stock • Reports</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Start Managing Inventory Smarter</h2>
        <p>Access the inventory module and boost efficiency.</p>

        <button onClick={() => navigate("/login")}>
          Go to Inventory
        </button>
      </section>
    </div>
  );
};

export default InventoryInfo;