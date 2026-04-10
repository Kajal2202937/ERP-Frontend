import styles from "./SalesInfo.module.css";
import { useNavigate } from "react-router-dom";
import {
  FiShoppingCart,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
} from "react-icons/fi";

const SalesInfo = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1>Sales Management</h1>
        <p>Manage orders, customers, and revenue seamlessly.</p>
      </section>

      <section className={styles.features}>
        <h2>Key Features</h2>
        <div className={styles.grid}>
          <div><FiShoppingCart /><h3>Order Management</h3><p>Handle orders efficiently.</p></div>
          <div><FiUsers /><h3>Customer Tracking</h3><p>Manage customer relationships.</p></div>
          <div><FiDollarSign /><h3>Revenue Tracking</h3><p>Track sales and revenue.</p></div>
          <div><FiTrendingUp /><h3>Growth Insights</h3><p>Analyze sales trends.</p></div>
        </div>
      </section>

      <section className={styles.cta}>
        <h2>Grow Your Sales Faster</h2>
        <button onClick={() => navigate("/login")}>Go to Sales</button>
      </section>
    </div>
  );
};

export default SalesInfo;