import styles from "./HomePage.module.css";
import { useNavigate } from "react-router-dom";
import {
  FiBox,
  FiSettings,
  FiShoppingCart,
  FiBarChart2,
  FiArrowRight,
} from "react-icons/fi";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>🚀 Smart ERP Platform</span>

          <h1>
            Manage Your Entire Business <br />
            <span>In One Powerful ERP</span>
          </h1>

          <p>
            Streamline inventory, production, sales, and reporting with a modern
            ERP system built for scalability and efficiency.
          </p>

          <div className={styles.actions}>
            <button onClick={() => navigate("/inventory")}>
              Explore Modules <FiArrowRight />
            </button>

            <button
              className={styles.secondaryBtn}
              onClick={() => navigate("/about")}
            >
              Learn More
            </button>
          </div>
        </div>

        <div className={styles.heroImage}>
          <div className={styles.glassCard}>
            <h3>Live ERP Preview</h3>
            <p>Dashboard • Inventory • Reports</p>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className={styles.modules}>
        <h2>Core ERP Modules</h2>
        <p className={styles.sectionSub}>
          Everything you need to run your business efficiently
        </p>

        <div className={styles.grid}>
          <div onClick={() => navigate("/inventory")}>
            <FiBox />
            <h3>Inventory</h3>
            <p>Track stock, manage warehouses, and automate inventory flow.</p>
          </div>

          <div onClick={() => navigate("/production")}>
            <FiSettings />
            <h3>Production</h3>
            <p>Monitor manufacturing processes and optimize output.</p>
          </div>

          <div onClick={() => navigate("/sales")}>
            <FiShoppingCart />
            <h3>Sales</h3>
            <p>Manage orders, customers, and transactions in real time.</p>
          </div>

          <div onClick={() => navigate("/reports")}>
            <FiBarChart2 />
            <h3>Reports</h3>
            <p>Gain insights with analytics and performance reports.</p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className={styles.stats}>
        <div>
          <h3>1000+</h3>
          <p>Products Managed</p>
        </div>
        <div>
          <h3>500+</h3>
          <p>Orders Processed Daily</p>
        </div>
        <div>
          <h3>99%</h3>
          <p>Operational Efficiency</p>
        </div>
        <div>
          <h3>24/7</h3>
          <p>System Availability</p>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Take Control of Your Business Today</h2>
        <p>Start using a smarter ERP system designed for growth.</p>

        <button onClick={() => navigate("/contact")}>
          Get Started
        </button>
      </section>
    </div>
  );
};

export default HomePage;