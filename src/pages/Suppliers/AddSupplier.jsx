import { useState } from "react";
import { createSupplier } from "../../services/SupplierService";
import styles from "./AddSupplier.module.css";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiSave,
  FiBriefcase,
} from "react-icons/fi";

const EMPTY = { name: "", company: "", email: "", phone: "", address: "" };

const Field = ({ icon, label, optional, error, children }) => (
  <div className={`${styles.field} ${error ? styles.fieldError : ""}`}>
    <label className={styles.label}>
      <span className={styles.labelIcon}>{icon}</span>
      {label}
      {optional && <span className={styles.optional}>optional</span>}
    </label>
    {children}
    <AnimatePresence>
      {error && (
        <motion.p
          className={styles.errorMsg}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const AddSupplier = ({ refresh, close }) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Supplier name is required";
    if (!form.company.trim()) e.company = "Company name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await createSupplier(form);
      toast.success("Supplier added successfully");
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(EMPTY);
    setErrors({});
    close?.();
  };

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <FiUser size={15} />
            </div>
            <div>
              <h3 className={styles.headerTitle}>Add supplier</h3>
              <p className={styles.headerSub}>
                Fill in the supplier details below
              </p>
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={handleClose}
            aria- label=" Close"
          >
            <FiX size={14} />
          </button>
        </div>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.grid}>
            <Field
              icon={<FiUser size={11} />}
               label=" Supplier name *"
              error={errors.name}
            >
              <input
                className={styles.input}
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </Field>

            <Field
              icon={<FiBriefcase size={11} />}
               label=" Company *"
              error={errors.company}
            >
              <input
                className={styles.input}
                name="company"
                value={form.company}
                onChange={handleChange}
              />
            </Field>

            <Field
              icon={<FiMail size={11} />}
               label=" Email *"
              error={errors.email}
            >
              <input
                className={styles.input}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </Field>

            <Field
              icon={<FiPhone size={11} />}
               label=" Phone *"
              error={errors.phone}
            >
              <input
                className={styles.input}
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </Field>

            <Field
              icon={<FiHome size={11} />}
               label=" Address"
              error={null}
              className={styles.full}
            >
              <input
                className={styles.input}
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </Field>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleClose}
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                <FiSave size={13} />
              )}
              {loading ? "Saving…" : "Add supplier"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddSupplier;
