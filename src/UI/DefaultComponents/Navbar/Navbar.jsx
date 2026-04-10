import styles from "./Navbar.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiBox,
  FiSettings,
  FiShoppingCart,
  FiBarChart2,
} from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  const goTo = (path) => {
    navigate(path);
    setMenuOpen(false); // 🔥 auto close mobile
  };

  return (
    <header className={styles.navbar}>
      {/* LOGO */}
      <div className={styles.logo} onClick={() => goTo("/")}>
        ERP System
      </div>

      {/* DESKTOP NAV */}
      <nav className={styles.links}>
        <button
          className={location.pathname === "/" ? styles.active : ""}
          onClick={() => goTo("/")}
        >
          Home
        </button>

        <button
          className={location.pathname === "/about" ? styles.active : ""}
          onClick={() => goTo("/about")}
        >
          About
        </button>

        <button
          className={location.pathname === "/contact" ? styles.active : ""}
          onClick={() => goTo("/contact")}
        >
          Contact
        </button>

        {/* MODULES */}
        <div
          className={styles.dropdown}
          onMouseEnter={() => setDropdown(true)}
          onMouseLeave={() => setDropdown(false)}
        >
          <button className={styles.dropdownBtn}>
            Modules <FiChevronDown />
          </button>

          <div
            className={`${styles.dropdownMenu} ${
              dropdown ? styles.show : ""
            }`}
          >
            <p onClick={() => goTo("/inventory")}>
              <FiBox /> Inventory
            </p>
            <p onClick={() => goTo("/production")}>
              <FiSettings /> Production
            </p>
            <p onClick={() => goTo("/sales")}>
              <FiShoppingCart /> Sales
            </p>
            <p onClick={() => goTo("/reports")}>
              <FiBarChart2 /> Reports
            </p>
          </div>
        </div>
      </nav>

      {/* RIGHT SIDE */}
      <div className={styles.actions}>
        <button onClick={() => goTo("/login")}>Login</button>
        <button className={styles.registerBtn} onClick={() => goTo("/register")}>
          Register
        </button>
      </div>

      {/* MOBILE ICON */}
      <div className={styles.menuIcon} onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FiX /> : <FiMenu />}
      </div>

      {/* MOBILE MENU */}
      <div
        className={`${styles.mobileMenu} ${
          menuOpen ? styles.open : ""
        }`}
      >
        <button onClick={() => goTo("/")}>Home</button>
        <button onClick={() => goTo("/about")}>About</button>
        <button onClick={() => goTo("/contact")}>Contact</button>

        <div className={styles.mobileModules}>
          <p>Modules</p>
          <span onClick={() => goTo("/inventory")}>Inventory</span>
          <span onClick={() => goTo("/production")}>Production</span>
          <span onClick={() => goTo("/sales")}>Sales</span>
          <span onClick={() => goTo("/reports")}>Reports</span>
        </div>

        <button onClick={() => goTo("/login")}>Login</button>
        <button onClick={() => goTo("/register")}>Register</button>
      </div>
    </header>
  );
};

export default Navbar;