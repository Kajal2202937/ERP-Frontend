import { useState } from "react";
import { createSupplier } from "../../services/SupplierService";
import styles from "./AddSupplier.module.css";
import { FiX, FiUser, FiMail, FiPhone, FiHome, FiSave } from "react-icons/fi";

const AddSupplier = ({ refresh, close }) => {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ VALIDATION
  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) newErrors.name = "Supplier name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    if (!form.company.trim()) newErrors.company = "Company name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      await createSupplier(form);
      refresh();
      handleClose();

      setForm({
        name: "",
        company: "",
        email: "",
        phone: "",
        address: "",
      });

      setErrors({});
    } catch {
      alert("Failed to add supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    close?.();
    setForm({
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
    });
    setErrors({});
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard}>

        {/* HEADER */}
        <div className={styles.header}>
          <h2>
            <FiUser /> Add Supplier
          </h2>

          <button className={styles.closeBtn} onClick={handleClose}>
            <FiX />
          </button>
        </div>

        {/* FORM */}
        <form className={styles.form} onSubmit={handleSubmit}>

          <div className={styles.group}>
            <input
              name="name"
              placeholder="Supplier Name *"
              onChange={handleChange}
              value={form.name}
            />
            {errors.name && <p className={styles.error}>{errors.name}</p>}
          </div>

          <div className={styles.group}>
            <input
              name="company"
              placeholder="Company *"
              onChange={handleChange}
              value={form.company}
            />
            {errors.company && <p className={styles.error}>{errors.company}</p>}
          </div>

          <div className={styles.group}>
            <input
              name="email"
              placeholder="Email *"
              onChange={handleChange}
              value={form.email}
            />
            {errors.email && <p className={styles.error}>{errors.email}</p>}
          </div>

          <div className={styles.group}>
            <input
              name="phone"
              placeholder="Phone *"
              onChange={handleChange}
              value={form.phone}
            />
            {errors.phone && <p className={styles.error}>{errors.phone}</p>}
          </div>

          <div className={styles.group}>
            <input
              name="address"
              placeholder="Address"
              onChange={handleChange}
              value={form.address}
            />
          </div>

          {/* ACTIONS */}
          <div className={styles.actions}>
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Add Supplier"}
            </button>

            <button
              type="button"
              className={styles.cancel}
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplier;