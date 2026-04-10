import { useState, useEffect } from "react";
import { createProduct, updateProduct } from "../../services/productService";
import API from "../../services/api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import styles from "./AddProduct.module.css";

import {
  FiSave, FiPackage, FiTag, FiHash, FiUser, FiFileText, FiX,
} from "react-icons/fi";
import { MdCurrencyRupee } from "react-icons/md";

const Field = ({ icon, label, error, children }) => (
  <div className={`${styles.group} ${error ? styles.hasError : ""}`}>
    <label className={styles.label}>
      <span className={styles.labelIcon}>{icon}</span>
      {label}
    </label>
    {children}
    {error && (
      <motion.p
        className={styles.error}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        {error}
      </motion.p>
    )}
  </div>
);

const AddProduct = ({ refresh, editData, setEditData }) => {
  const [form, setForm] = useState({
    name: "", description: "", price: "", category: "",
    quantity: "", supplier: "", sku: "",
  });
  const [suppliers, setSuppliers] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get("/suppliers")
      .then((res) => setSuppliers(res.data.data || []))
      .catch(() => toast.error("Failed to load suppliers"));
  }, []);

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        description: editData.description || "",
        price: editData.price ?? "",
        category: editData.category || "",
        quantity: editData.quantity ?? "",
        supplier: editData.supplier?._id || "",
        sku: editData.sku || "",
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.category.trim()) e.category = "Category is required";
    if (!form.supplier) e.supplier = "Please select a supplier";
    if (form.price === "" || Number(form.price) <= 0) e.price = "Price must be greater than 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { ...form, price: Number(form.price), quantity: Number(form.quantity) || 0 };
      if (editData) {
        await updateProduct(editData._id, payload);
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product created");
      }
      refresh();
      setEditData(null);
      setForm({ name: "", description: "", price: "", category: "", quantity: "", supplier: "", sku: "" });
      setErrors({});
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({ name: "", description: "", price: "", category: "", quantity: "", supplier: "", sku: "" });
    setErrors({});
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.grid}>
        <Field icon={<FiTag size={13} />} label="Product Name" error={errors.name}>
          <input
            className={styles.input}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Wireless Headphones"
          />
        </Field>

        <Field icon={<FiPackage size={13} />} label="Category" error={errors.category}>
          <input
            className={styles.input}
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="e.g. Electronics"
          />
        </Field>

        <Field icon={<MdCurrencyRupee size={14} />} label="Price (₹)" error={errors.price}>
          <input
            className={styles.input}
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
          />
        </Field>

        <Field icon={<FiHash size={13} />} label="Quantity">
          <input
            className={styles.input}
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="0"
            min="0"
          />
        </Field>

        <Field icon={<FiHash size={13} />} label="SKU">
          <input
            className={styles.input}
            name="sku"
            value={form.sku}
            onChange={handleChange}
            placeholder="e.g. SKU-001"
          />
        </Field>

        <Field icon={<FiUser size={13} />} label="Supplier" error={errors.supplier}>
          <select
            className={`${styles.input} ${styles.select}`}
            name="supplier"
            value={form.supplier}
            onChange={handleChange}
          >
            <option value="">Select a supplier…</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </Field>

        <div className={`${styles.group} ${styles.full}`}>
          <label className={styles.label}>
            <span className={styles.labelIcon}><FiFileText size={13} /></span>
            Description
          </label>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional product description…"
            rows={3}
          />
        </div>
      </div>

      {/* ── FOOTER ACTIONS ── */}
      <div className={styles.actions}>
        <button type="button" className={styles.btnSecondary} onClick={handleReset}>
          <FiX size={14} />
          Reset
        </button>

        <motion.button
          type="submit"
          className={styles.btnPrimary}
          disabled={submitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          {submitting ? (
            <span className={styles.spinner} />
          ) : (
            <FiSave size={14} />
          )}
          {editData ? "Update Product" : "Create Product"}
        </motion.button>
      </div>
    </form>
  );
};

export default AddProduct;