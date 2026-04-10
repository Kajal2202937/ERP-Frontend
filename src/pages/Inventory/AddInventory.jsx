import { useEffect, useState } from "react";
import API from "../../services/api";
import { addStock } from "../../services/inventoryService";
import styles from "./AddInventory.module.css";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FiSave, FiPackage, FiHash, FiX } from "react-icons/fi";
import { MdOutlineInventory2 } from "react-icons/md";

const AddInventory = ({ refresh, onClose }) => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ productId: "", quantity: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/products")
      .then((res) => setProducts(res?.data?.data || []))
      .catch(() => toast.error("Failed to load products"));
  }, []);

  const reset = () => setForm({ productId: "", quantity: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId) return toast.error("Please select a product");
    if (!form.quantity || Number(form.quantity) <= 0)
      return toast.error("Enter a valid quantity");

    setLoading(true);
    try {
      await addStock({ productId: form.productId, quantity: Number(form.quantity) });
      toast.success("Stock added");
      reset();
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add stock");
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p._id === form.productId);

  return (
    <div className={styles.modal}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><MdOutlineInventory2 size={16} /></div>
          <h3 className={styles.headerTitle}>Add Stock</h3>
        </div>
        <motion.button className={styles.closeBtn} onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }} transition={{ duration: 0.18 }}>
          <FiX size={15} />
        </motion.button>
      </div>

      {/* Form */}
      <form className={styles.form} onSubmit={handleSubmit} noValidate>

        {/* Product */}
        <div className={styles.field}>
          <label className={styles.label}>
            <FiPackage size={12} className={styles.labelIcon} />
            Product
          </label>
          <select
            className={styles.select}
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
          >
            <option value="">Choose a product…</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Selected product info */}
        {selectedProduct && (
          <motion.div className={styles.productInfo}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}>
            <div className={styles.piIcon}><FiPackage size={13} /></div>
            <div>
              <p className={styles.piName}>{selectedProduct.name}</p>
              <p className={styles.piSub}>Current stock: <strong>{selectedProduct.quantity ?? "—"}</strong></p>
            </div>
          </motion.div>
        )}

        {/* Quantity */}
        <div className={styles.field}>
          <label className={styles.label}>
            <FiHash size={12} className={styles.labelIcon} />
            Quantity to Add
          </label>
          <input
            className={styles.input}
            type="number"
            min="1"
            placeholder="e.g. 50"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button type="button" className={styles.btnCancel} onClick={onClose}>
            Cancel
          </button>
          <motion.button
            type="submit"
            className={styles.btnSubmit}
            disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          >
            {loading ? <span className={styles.spinner} /> : <FiSave size={14} />}
            {loading ? "Saving…" : "Add Stock"}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default AddInventory;