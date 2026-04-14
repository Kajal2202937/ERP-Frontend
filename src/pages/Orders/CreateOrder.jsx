import { useState, useEffect } from "react";
import { createOrder } from "../../services/OrderService";
import { getInventory } from "../../services/inventoryService";
import API from "../../services/api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./CreateOrder.module.css";

import { FiPackage, FiHash, FiX, FiAlertCircle, FiInfo } from "react-icons/fi";
import { TbShoppingCartPlus } from "react-icons/tb";

const CreateOrder = ({ refresh, onClose }) => {
  const [form, setForm] = useState({ product: "", quantity: "" });
  const [products, setProducts] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [disabledProductIds, setDisabledProductIds] = useState(new Set());
  const [selectedStock, setSelectedStock] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Load products
  useEffect(() => {
    API.get("/products")
      .then((res) => setProducts(res.data.data || []))
      .catch(() => toast.error("Failed to load products"));
  }, []);

  // Load inventory
  useEffect(() => {
    getInventory()
      .then((res) => {
        const data = res.data?.data || [];
        setInventoryData(data);

        const disabled = new Set(
          data
            .filter((inv) => inv.isActive === false && inv.product?._id)
            .map((inv) => inv.product._id),
        );
        setDisabledProductIds(disabled);
      })
      .catch(() => toast.error("Failed to load inventory"));
  }, []);

  const availableProducts = products.filter(
    (p) => !disabledProductIds.has(p._id),
  );

  // ✅ FIXED: get stock from inventory (NOT product)
  useEffect(() => {
    const inv = inventoryData.find((i) => i.product?._id === form.product);
    setSelectedStock(inv?.quantity || 0);
  }, [form.product, inventoryData]);

  const selectedProduct = availableProducts.find((p) => p._id === form.product);

  const qty = Number(form.quantity);
  const overStock = qty > 0 && qty > selectedStock;
  const stockPct =
    selectedStock > 0 && qty > 0
      ? Math.min((qty / selectedStock) * 100, 100)
      : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.product) return toast.error("Please select a product");
    if (disabledProductIds.has(form.product))
      return toast.error("This product's inventory is disabled");
    if (qty <= 0) return toast.error("Quantity must be greater than 0");
    if (qty > selectedStock) return toast.error("Not enough stock");

    setSubmitting(true);

    try {
      await createOrder({ product: form.product, quantity: qty });

      toast.success("Order created");
      refresh();
      setForm({ product: "", quantity: "" });
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <TbShoppingCartPlus size={16} />
            </div>
            <h3 className={styles.headerTitle}>New Order</h3>
          </div>
          <motion.button
            className={styles.closeBtn}
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            transition={{ duration: 0.18 }}
          >
            <FiX size={15} />
          </motion.button>
        </div>

        {/* Body */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Product */}
          <div className={styles.field}>
            <label className={styles.label}>
              <FiPackage size={12} className={styles.labelIcon} />
              Product
            </label>

            <div className={styles.selectWrap}>
              <select
                className={styles.select}
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
              >
                <option value="">Choose a product…</option>
                {availableProducts.map((p) => {
                  const inv = inventoryData.find(
                    (i) => i.product?._id === p._id,
                  );
                  return (
                    <option key={p._id} value={p._id}>
                      {p.name} — Stock: {inv?.quantity || 0}
                    </option>
                  );
                })}
              </select>
            </div>

            {disabledProductIds.size > 0 && (
              <p className={styles.hint}>
                <FiInfo size={11} />
                {disabledProductIds.size} product(s) hidden (inventory disabled)
              </p>
            )}
          </div>

          {/* Product Card */}
          <AnimatePresence>
            {selectedProduct && (
              <motion.div
                className={styles.productCard}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.productCardInner}>
                  <div className={styles.pcIcon}>
                    <FiPackage size={14} />
                  </div>

                  <div className={styles.pcInfo}>
                    <span className={styles.pcName}>
                      {selectedProduct.name}
                    </span>
                    <span className={styles.pcStock}>
                      {selectedStock} units available
                    </span>
                  </div>

                  <span
                    className={`${styles.pcBadge} ${
                      selectedStock <= 5 ? styles.lowBadge : styles.okBadge
                    }`}
                  >
                    {selectedStock <= 5 ? "Low stock" : "In stock"}
                  </span>
                </div>

                {qty > 0 && (
                  <div className={styles.stockBarWrap}>
                    <div className={styles.stockBar}>
                      <motion.div
                        className={`${styles.stockFill} ${
                          overStock ? styles.overFill : ""
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${stockPct}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>

                    <span
                      className={`${styles.stockBarLabel} ${
                        overStock ? styles.overLabel : ""
                      }`}
                    >
                      {qty} / {selectedStock}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quantity */}
          <div className={styles.field}>
            <label className={styles.label}>
              <FiHash size={12} className={styles.labelIcon} />
              Quantity
            </label>

            <input
              className={`${styles.input} ${
                overStock ? styles.inputError : ""
              }`}
              type="number"
              min="1"
              placeholder="Enter quantity…"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />

            <AnimatePresence>
              {overStock && (
                <motion.p
                  className={styles.errorMsg}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <FiAlertCircle size={12} />
                  Exceeds available stock ({selectedStock})
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
            >
              Cancel
            </button>

            <motion.button
              type="submit"
              className={styles.btnSubmit}
              disabled={
                submitting || overStock || !form.product || !form.quantity
              }
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {submitting ? (
                <span className={styles.spinner} />
              ) : (
                <TbShoppingCartPlus size={15} />
              )}
              Create Order
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateOrder;
