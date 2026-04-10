import styles from "./AboutPage.module.css";
import { useNavigate } from "react-router-dom";
import {
  FiBox,
  FiSettings,
  FiShoppingCart,
  FiBarChart2,
} from "react-icons/fi";

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      {/* HERO */}
      <section className={styles.hero}>
        <h1>About Our ERP System</h1>
        <p>
          A modern, scalable ERP platform designed to streamline your business
          operations from inventory to analytics.
        </p>
      </section>

      {/* DESCRIPTION */}
      <section className={styles.description}>
        <h2>What is ERP?</h2>
        <p>
          Enterprise Resource Planning (ERP) systems integrate core business
          processes into one unified platform. Our ERP helps you manage products,
          production, sales, and reports efficiently with real-time data.
        </p>
      </section>

      {/* MODULES */}
      <section className={styles.modules}>
        <h2>Core Modules</h2>

        <div className={styles.grid}>
          <div onClick={() => navigate("/inventory")}>
            <FiBox />
            <h3>Inventory</h3>
            <p>Track stock levels and manage warehouses seamlessly.</p>
          </div>

          <div onClick={() => navigate("/production")}>
            <FiSettings />
            <h3>Production</h3>
            <p>Monitor manufacturing workflows and optimize efficiency.</p>
          </div>

          <div onClick={() => navigate("/sales")}>
            <FiShoppingCart />
            <h3>Sales</h3>
            <p>Handle orders, customers, and transactions in one place.</p>
          </div>

          <div onClick={() => navigate("/reports")}>
            <FiBarChart2 />
            <h3>Reports</h3>
            <p>Analyze performance with powerful reporting tools.</p>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className={styles.workflow}>
        <h2>How It Works</h2>

        <div className={styles.steps}>
          <div>
            <span>1</span>
            <h4>Plan</h4>
            <p>Define your business processes and workflows.</p>
          </div>

          <div>
            <span>2</span>
            <h4>Manage</h4>
            <p>Handle inventory, orders, and production.</p>
          </div>

          <div>
            <span>3</span>
            <h4>Track</h4>
            <p>Monitor real-time data and performance.</p>
          </div>

          <div>
            <span>4</span>
            <h4>Grow</h4>
            <p>Scale your business with insights and automation.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Ready to Transform Your Business?</h2>
        <p>Start using our ERP system today.</p>

        <button onClick={() => navigate("/contact")}>
          Contact Us
        </button>
      </section>
    </div>
  );
};

export default AboutPage;