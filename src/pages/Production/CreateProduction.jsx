import { useState, useEffect } from "react";
import { createProduction } from "../../services/ProductionService";
import API from "../../services/api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import styles from "./CreateProduction.module.css";
import { FiPackage, FiHash, FiSave, FiX } from "react-icons/fi";

const CreateProduction = ({ refresh, onClose }) => {
  const [form, setForm] = useState({ product: "", quantityProduced: "" });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/products")
      .then((res) => setProducts(res.data.data || []))
      .catch(() => toast.error("Failed to load products"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product || !form.quantityProduced)
      return toast.warning("Please fill all fields");
    setLoading(true);
    try {
      await createProduction({
        product: form.product,
        quantityProduced: Number(form.quantityProduced),
      });
      toast.success("Production created");
      setForm({ product: "", quantityProduced: "" });
      refresh();
      onClose?.();
    } catch {
      toast.error("Failed to create production");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          <h4 className={styles.cardTitle}>New Production Run</h4>
          {onClose && (
            <motion.button className={styles.closeBtn} onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }} transition={{ duration: 0.18 }}>
              <FiX size={14} />
            </motion.button>
          )}
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>
                <FiPackage size={12} className={styles.labelIcon} />
                Product
              </label>
              <select
                className={styles.select}
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
              >
                <option value="">Select a product…</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            
            <div className={styles.field}>
              <label className={styles.label}>
                <FiHash size={12} className={styles.labelIcon} />
                Quantity to Produce
              </label>
              <input
                className={styles.input}
                type="number"
                min="1"
                placeholder="e.g. 100"
                value={form.quantityProduced}
                onChange={(e) => setForm({ ...form, quantityProduced: e.target.value })}
              />
            </div>

            <div className={styles.fieldAction}>
              <label className={styles.labelSpacer} />
              <motion.button
                type="submit"
                className={styles.btnSubmit}
                disabled={loading}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              >
                {loading ? <span className={styles.spinner} /> : <FiSave size={14} />}
                {loading ? "Creating…" : "Create Run"}
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProduction;