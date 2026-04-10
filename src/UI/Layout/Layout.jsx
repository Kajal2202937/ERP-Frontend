import Navbar from "../DefaultComponents/Navbar/Navbar";
import Footer from "../DefaultComponents/Footer/Footer";
import { Outlet } from "react-router-dom";
import styles from "./Layout.module.css";

const Layout = () => {
  return (
    <div className={styles.layout}>
      <Navbar />

      <main className={styles.main}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;