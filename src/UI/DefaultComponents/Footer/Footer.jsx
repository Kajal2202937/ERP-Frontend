import styles from "./Footer.module.css";
import { useNavigate } from "react-router-dom";
import {
  FiFacebook,
  FiTwitter,
  FiLinkedin,
  FiGithub,
} from "react-icons/fi";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* BRAND */}
        <div className={styles.brand}>
          <h2 onClick={() => navigate("/")}>ERP System</h2>
          <p>
            A modern ERP platform to manage inventory, production, sales,
            and reports efficiently.
          </p>

          <div className={styles.socials}>
            <FiFacebook />
            <FiTwitter />
            <FiLinkedin />
            <FiGithub />
          </div>
        </div>

        {/* LINKS */}
        <div className={styles.links}>
          <h4>Company</h4>
          <span onClick={() => navigate("/")}>Home</span>
          <span onClick={() => navigate("/about")}>About</span>
          <span onClick={() => navigate("/contact")}>Contact</span>
        </div>

        {/* MODULES */}
        <div className={styles.links}>
          <h4>Modules</h4>
          <span onClick={() => navigate("/inventory")}>Inventory</span>
          <span onClick={() => navigate("/production")}>Production</span>
          <span onClick={() => navigate("/sales")}>Sales</span>
          <span onClick={() => navigate("/reports")}>Reports</span>
        </div>

        {/* CONTACT */}
        <div className={styles.links}>
          <h4>Contact</h4>
          <p>Email: support@erp.com</p>
          <p>Phone: +91 98765 43210</p>
          <p>India</p>
        </div>
      </div>

      {/* BOTTOM */}
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} ERP System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;