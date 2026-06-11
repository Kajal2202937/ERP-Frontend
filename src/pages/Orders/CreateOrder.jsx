import { useState, useEffect, useCallback, useRef } from "react";
import { createOrder } from "../../services/OrderService";
import API from "../../services/api";
import { getInventory } from "../../services/inventoryService";
import { toast } from "../../../utils/toast";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./CreateOrder.module.css";
import {
  FiPackage,
  FiHash,
  FiX,
  FiAlertCircle,
  FiInfo,
  FiUser,
  FiMail,
  FiPhone,
  FiFileText,
  FiChevronDown,
} from "react-icons/fi";
import { TbShoppingCartPlus } from "react-icons/tb";
import SearchableSelect from "../../components/common/SearchableSelect";

const EMPTY_FORM = {
  product: "",
  quantity: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  notes: "",
};

const CreateOrder = ({
  refresh,
  onClose,
  inventoryData: propInventory,
  disabledProductIds: propDisabled,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [products, setProducts] = useState([]);
  const [inventoryData, setInventoryData] = useState(propInventory || []);
  const [disabledProductIds, setDisabledProductIds] = useState(
    propDisabled || new Set(),
  );
  const [selectedStock, setSelectedStock] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(!propInventory);
  const [showCustomer, setShowCustomer] = useState(false);

  const propInventoryRef = useRef(propInventory);

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        const tasks = [API.get("/products", { params: { limit: 1000 } })];
        if (!propInventoryRef.current) tasks.push(getInventory());

        const [prodRes, invRes] = await Promise.allSettled(tasks);

        if (prodRes.status === "fulfilled") {
          setProducts(prodRes.value.data?.data || []);
        }

        if (!propInventoryRef.current && invRes?.status === "fulfilled") {
          const inv = invRes.value.data?.data || [];
          setInventoryData(inv);
          setDisabledProductIds(
            new Set(
              inv
                .filter((i) => i.isActive === false && i.product?._id)
                .map((i) => i.product._id),
            ),
          );
        }
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (propInventory) setInventoryData(propInventory);
  }, [propInventory]);

  useEffect(() => {
    if (propDisabled) setDisabledProductIds(propDisabled);
  }, [propDisabled]);

  const availableProducts = products.filter(
    (p) => !disabledProductIds.has(p._id),
  );

  useEffect(() => {
    if (!form.product) {
      setSelectedStock(0);
      return;
    }
    const inv = inventoryData.find((i) => i.product?._id === form.product);
    setSelectedStock(inv?.quantity || 0);
  }, [form.product, inventoryData]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, quantity: "" }));
  }, [form.product]);

  const selectedProduct = availableProducts.find((p) => p._id === form.product);
  const qty = Number(form.quantity);
  const isIntQty = Number.isInteger(qty);
  const overStock = qty > 0 && qty > selectedStock;
  const stockPct =
    selectedStock > 0 && qty > 0
      ? Math.min((qty / selectedStock) * 100, 100)
      : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!form.product) return toast.error("Please select a product");
      if (disabledProductIds.has(form.product))
        return toast.error("This product's inventory is disabled");
      if (qty <= 0) return toast.error("Quantity must be greater than 0");
      if (!isIntQty) return toast.error("Quantity must be a whole number");
      if (qty > selectedStock) return toast.error("Not enough stock");

      setSubmitting(true);
      try {
        await createOrder({
          product: form.product,
          quantity: qty,
          notes: form.notes.trim(),
          customer: {
            name: form.customerName.trim(),
            email: form.customerEmail.trim(),
            phone: form.customerPhone.trim(),
          },
        });
        toast.success("Order created successfully");
        refresh?.();
        onClose?.();
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong";
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [form, qty, isIntQty, selectedStock, disabledProductIds, refresh, onClose],
  );

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
        {/* ── Header ─────────────────────────────────────────────────── */}
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

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* ── Product selector ──────────────────────────────────────── */}
          <div className={styles.field}>
            <label htmlFor="order-product" className={styles.label}>
              <FiPackage size={12} className={styles.labelIcon} /> Product
            </label>
            <div className={styles.selectWrap}>
              {loadingData ? (
                <div className={styles.selectSkeleton} />
              ) : (
                <SearchableSelect
                  options={availableProducts.map((p) => {
                    const inv = inventoryData.find(
                      (i) => i.product?._id === p._id,
                    );
                    return {
                      value: p._id,
                      label: `${p.name} — Stock: ${inv?.quantity || 0}`,
                    };
                  })}
                  value={form.product}
                  onChange={(val) => setForm((prev) => ({ ...prev, product: val }))}
                  placeholder="Choose a product…"
                />
              )}
            </div>
            {disabledProductIds.size > 0 && (
              <p className={styles.hint}>
                <FiInfo size={11} />
                {disabledProductIds.size} product(s) hidden (inventory disabled)
              </p>
            )}
          </div>

          {/* ── Product info card ─────────────────────────────────────── */}
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
                    className={`${styles.pcBadge} ${selectedStock <= 5 ? styles.lowBadge : styles.okBadge}`}
                  >
                    {selectedStock <= 5 ? "Low stock" : "In stock"}
                  </span>
                </div>
                {qty > 0 && (
                  <div className={styles.stockBarWrap}>
                    <div className={styles.stockBar}>
                      <motion.div
                        className={`${styles.stockFill} ${overStock ? styles.overFill : ""}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${stockPct}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span
                      className={`${styles.stockBarLabel} ${overStock ? styles.overLabel : ""}`}
                    >
                      {qty} / {selectedStock}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Quantity ──────────────────────────────────────────────── */}
          <div className={styles.field}>
            <label htmlFor="order-quantity" className={styles.label}>
              <FiHash size={12} className={styles.labelIcon} /> Quantity
            </label>
            <input
              className={`${styles.input} ${overStock || (qty > 0 && !isIntQty) ? styles.inputError : ""}`}
              id="order-quantity"
              name="quantity"
              type="number"
              min="1"
              step="1"
              placeholder="Enter quantity…"
              value={form.quantity}
              onChange={handleChange}
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
              {qty > 0 && !isIntQty && !overStock && (
                <motion.p
                  className={styles.errorMsg}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <FiAlertCircle size={12} />
                  Quantity must be a whole number
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* ── Customer details (collapsible) ────────────────────────── */}
          <div className={styles.field}>
            <button
              type="button"
              className={styles.sectionToggle}
              onClick={() => setShowCustomer((v) => !v)}
            >
              <FiUser size={12} />
              Customer Details
              <span className={styles.optional}>(optional)</span>
              <FiChevronDown
                size={13}
                className={`${styles.chevron} ${showCustomer ? styles.chevronOpen : ""}`}
              />
            </button>

            <AnimatePresence>
              {showCustomer && (
                <motion.div
                  className={styles.customerFields}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={styles.inputRow}>
                    <div className={styles.inputWrap}>
                      <FiUser size={12} className={styles.inputIcon} />
                      <input
                        className={styles.inputInline}
                        name="customerName"
                        type="text"
                        placeholder="Customer name"
                        value={form.customerName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className={styles.inputRow}>
                    <div className={styles.inputWrap}>
                      <FiMail size={12} className={styles.inputIcon} />
                      <input
                        className={styles.inputInline}
                        name="customerEmail"
                        type="email"
                        placeholder="Customer email (for invoice)"
                        value={form.customerEmail}
                        onChange={handleChange}
                      />
                    </div>
                    <div className={styles.inputWrap}>
                      <FiPhone size={12} className={styles.inputIcon} />
                      <input
                        className={styles.inputInline}
                        name="customerPhone"
                        type="tel"
                        placeholder="Phone number"
                        value={form.customerPhone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <p className={styles.hint}>
                    <FiInfo size={11} />
                    Customer email is required to send order confirmation and
                    invoice
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Notes ─────────────────────────────────────────────────── */}
          <div className={styles.field}>
            <label htmlFor="order-notes" className={styles.label}>
              <FiFileText size={12} className={styles.labelIcon} />
              Notes
              <span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              className={styles.textarea}
              id="order-notes"
              name="notes"
              rows={2}
              placeholder="Internal notes for this order…"
              value={form.notes}
              onChange={handleChange}
              maxLength={500}
            />
          </div>

          {/* ── Actions ───────────────────────────────────────────────── */}
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
                submitting ||
                overStock ||
                !form.product ||
                !form.quantity ||
                (qty > 0 && !isIntQty)
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