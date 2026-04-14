import { useState } from "react";
import styles from "./Contact.module.css";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiSend } from "react-icons/fi";
import { sendContactMessage } from "../../../services/contactService";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // ================= HANDLE CHANGE =================
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ================= VALIDATION =================
  const validate = () => {
    if (!form.name || !form.email || !form.message) {
      return "All required fields must be filled";
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(form.email)) {
      return "Invalid email format";
    }

    return null;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }
    try {
      const data = await sendContactMessage(form);

      if (data?.success) {
        setSuccess(true);
        setForm({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= STATIC DATA =================
  const contactItems = [
    {
      icon: <FiMail />,
      label: "Email",
      value: "support@yourdomain.com",
      color: "var(--mod-inventory)",
      dim: "var(--mod-inventory-soft)",
    },
    {
      icon: <FiPhone />,
      label: "Phone",
      value: "Available on request",
      color: "var(--mod-sales)",
      dim: "var(--mod-sales-soft)",
    },
    {
      icon: <FiMapPin />,
      label: "Location",
      value: "India",
      color: "var(--mod-production)",
      dim: "var(--mod-production-soft)",
    },
  ];

  const slideIn = {
    hidden: { opacity: 0, x: -16 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <motion.span
          className={styles.eyebrow}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Contact
        </motion.span>

        <motion.h1
          className={styles.heroTitle}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          Get in touch with us
        </motion.h1>

        <motion.p className={styles.heroDesc}>
          If you have questions about the system, feel free to reach out.
        </motion.p>
      </section>

      {/* Main */}
      <div className={styles.main}>
        {/* Info */}
        <motion.div className={styles.infoCol}>
          <div>
            <p className={styles.infoLabel}>Contact Information</p>
            <h2 className={styles.infoTitle}>Reach us for any queries</h2>
            <p className={styles.infoDesc}>
              You can contact us for general information or technical support.
            </p>
          </div>

          <motion.div className={styles.contactItems}>
            {contactItems.map((item) => (
              <motion.div key={item.label} className={styles.contactItem}>
                <div
                  className={styles.contactIconBox}
                  style={{ background: item.dim, color: item.color }}
                >
                  {item.icon}
                </div>
                <div>
                  <div className={styles.contactLabel}>{item.label}</div>
                  <div className={styles.contactValue}>{item.value}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className={styles.responseBox}>
            <span className={styles.responseIcon} />
            <p className={styles.responseText}>
              Our team reviews all messages and responds based on availability.
            </p>
          </motion.div>
        </motion.div>

        {/* Form */}
        <motion.div className={styles.formCard}>
          <div className={styles.formHeader}>
            <p className={styles.formTitle}>Send a message</p>
            <p className={styles.formSub}>
              Fill out the form and we will review your request.
            </p>
          </div>

          {/* ✅ ERROR */}
          {error && (
            <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
          )}

          {/* SUCCESS */}
          {success ? (
            <div className={styles.successState}>
              <p className={styles.successTitle}>Message submitted</p>
              <p className={styles.successSub}>
                Your message has been received successfully.
              </p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    className={styles.input}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input
                    className={styles.input}
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Subject</label>
                <select
                  className={styles.select}
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                >
                  <option value="">Select topic</option>
                  <option value="general">General inquiry</option>
                  <option value="support">Support</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Message</label>
                <textarea
                  className={styles.textarea}
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <motion.button
                type="submit"
                className={styles.btnSubmit}
                disabled={loading}
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    <FiSend /> Submit
                  </>
                )}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
