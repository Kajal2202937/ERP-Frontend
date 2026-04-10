import styles from "./ReportsInfo.module.css";
import { useNavigate } from "react-router-dom";
import {
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiFileText,
} from "react-icons/fi";

const ReportsInfo = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1>Reports & Analytics</h1>
        <p>Gain insights with powerful reporting tools.</p>
      </section>

      <section className={styles.features}>
        <h2>Key Features</h2>
        <div className={styles.grid}>
          <div><FiBarChart2 /><h3>Data Visualization</h3><p>Interactive charts and graphs.</p></div>
          <div><FiPieChart /><h3>Analytics</h3><p>Understand business performance.</p></div>
          <div><FiTrendingUp /><h3>Trends</h3><p>Track growth patterns.</p></div>
          <div><FiFileText /><h3>Reports</h3><p>Generate detailed reports.</p></div>
        </div>
      </section>

      <section className={styles.cta}>
        <h2>Make Data-Driven Decisions</h2>
        <button onClick={() => navigate("/login")}>View Reports</button>
      </section>
    </div>
  );
};

export default ReportsInfo;