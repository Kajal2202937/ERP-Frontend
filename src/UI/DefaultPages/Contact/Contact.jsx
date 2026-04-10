import styles from "./Contact.module.css";
import {
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";

const Contact = () => {
  return (
    <div className={styles.container}>
      {/* LEFT SIDE */}
      <div className={styles.info}>
        <h1>Contact Us</h1>
        <p>
          Have questions about our ERP system? Reach out to us and we’ll help
          you get started.
        </p>

        <div className={styles.details}>
          <div>
            <FiMail />
            <span>support@erp.com</span>
          </div>

          <div>
            <FiPhone />
            <span>+91 98765 43210</span>
          </div>

          <div>
            <FiMapPin />
            <span>India</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className={styles.formBox}>
        <h2>Send Message</h2>

        <form>
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" rows="5" required />

          <button type="submit">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;