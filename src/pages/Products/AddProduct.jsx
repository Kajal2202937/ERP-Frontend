import { useState, useEffect } from "react";
import { createProduct, updateProduct } from "../../services/ProductService";
import API from "../../services/api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./AddProduct.module.css";
import {
  FiSave,
  FiPackage,
  FiTag,
  FiHash,
  FiUser,
  FiFileText,
  FiX,
} from "react-icons/fi";
import { MdCurrencyRupee } from "react-icons/md";

const Field = ({ icon, label, error, full, children }) => (
  <div
    className={`${styles.field} ${full ? styles.full : ""} ${error ? styles.hasError : ""}`}
  >
    <label className={styles.label}>
      <span className={styles.labelIcon}>{icon}</span>
      {label}
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

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  quantity: "",
  supplier: "",
  sku: "",
  costPrice: "",
};

const AddProduct = ({ refresh, editData, setEditData }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [suppliers, setSuppliers] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get("/suppliers")
      .then((res) => {
        const list = res?.data?.data?.data || [];

        setSuppliers(list);
      })
      .catch(() => {
        setSuppliers([]);
        toast.error("Failed to load suppliers");
      });
  }, []);

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        description: editData.description || "",
        price: editData.price ?? "",
        costPrice: editData.costPrice ?? "",
        category: editData.category || "",
        quantity: editData.quantity ?? "",
        supplier: editData.supplier?._id || "",
        sku: editData.sku || "",
      });
      setErrors({});
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.category.trim()) e.category = "Category is required";
    if (!form.supplier) e.supplier = "Please select a supplier";

    if (form.price === "" || Number(form.price) <= 0)
      e.price = "Price must be greater than 0";

    if (form.costPrice === "" || Number(form.costPrice) < 0)
      e.costPrice = "Cost price is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        costPrice: Number(form.costPrice),
        quantity: Number(form.quantity) || 0,
      };

      if (editData) {
        await updateProduct(editData._id, payload);
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product created");
      }

      refresh();
      setEditData(null);
      setForm(EMPTY_FORM);
      setErrors({});
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.grid}>
        <Field
          icon={<FiTag size={12} />}
          label="Product Name"
          error={errors.name}
        >
          <input
            className={styles.input}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Wireless Headphones"
          />
        </Field>

        <Field
          icon={<MdCurrencyRupee size={13} />}
          label="Cost Price (₹)"
          error={errors.costPrice}
        >
          <input
            className={styles.input}
            type="number"
            name="costPrice"
            min="0"
            value={form.costPrice}
            onChange={handleChange}
            placeholder="0.00"
          />
        </Field>

        <Field
          icon={<FiPackage size={12} />}
          label="Category"
          error={errors.category}
        >
          <input
            className={styles.input}
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="e.g. Electronics"
          />
        </Field>

        <Field
          icon={<MdCurrencyRupee size={13} />}
          label="Price (₹)"
          error={errors.price}
        >
          <input
            className={styles.input}
            type="number"
            name="price"
            min="0"
            value={form.price}
            onChange={handleChange}
            placeholder="0.00"
          />
        </Field>

        <Field icon={<FiHash size={12} />} label="Quantity">
          <input
            className={styles.input}
            type="number"
            name="quantity"
            min="0"
            value={form.quantity}
            onChange={handleChange}
            placeholder="0"
          />
        </Field>

        <Field icon={<FiHash size={12} />} label="SKU">
          <input
            className={styles.input}
            name="sku"
            value={form.sku}
            onChange={handleChange}
            placeholder="e.g. SKU-001"
          />
        </Field>

        <Field
          icon={<FiUser size={12} />}
          label="Supplier"
          error={errors.supplier}
        >
          <select
            className={`${styles.input} ${styles.select}`}
            name="supplier"
            value={form.supplier}
            onChange={handleChange}
          >
            <option value="">Select a supplier…</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={<FiFileText size={12} />} label="Description" full>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional product description…"
            rows={3}
          />
        </Field>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={handleReset}
        >
          <FiX size={13} /> Reset
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
            <FiSave size={13} />
          )}

          {submitting
            ? "Saving…"
            : editData
              ? "Update Product"
              : "Create Product"}
        </motion.button>
      </div>
    </form>
  );
};

export default AddProduct;
