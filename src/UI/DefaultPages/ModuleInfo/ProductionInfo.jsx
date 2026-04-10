import styles from "./ProductionInfo.module.css";
import { useNavigate } from "react-router-dom";
import {
  FiSettings,
  FiActivity,
  FiClock,
  FiTrendingUp,
} from "react-icons/fi";

const ProductionInfo = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      {/* HERO */}
      <section className={styles.hero}>
        <h1>Production Management</h1>
        <p>Optimize manufacturing workflows and track production in real-time.</p>
      </section>

      {/* FEATURES */}
      <section className={styles.features}>
        <h2>Key Features</h2>
        <div className={styles.grid}>
          <div><FiSettings /><h3>Workflow Control</h3><p>Manage production stages efficiently.</p></div>
          <div><FiActivity /><h3>Real-Time Tracking</h3><p>Track ongoing production processes.</p></div>
          <div><FiClock /><h3>Time Management</h3><p>Optimize production time and reduce delays.</p></div>
          <div><FiTrendingUp /><h3>Performance</h3><p>Analyze production efficiency.</p></div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Boost Your Production Efficiency</h2>
        <button onClick={() => navigate("/login")}>Go to Production</button>
      </section>
    </div>
  );
};

export default ProductionInfo;