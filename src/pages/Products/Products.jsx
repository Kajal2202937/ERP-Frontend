import { useEffect, useState, useCallback, useRef } from "react";
import { getProducts } from "../../services/ProductService";
import ProductList from "./ProductList";
import AddProduct from "./AddProduct";
import styles from "./Products.module.css";
import { toast } from "../../../utils/toast";
import { useDebounce } from "../../hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { MdInventory2 } from "react-icons/md";
import ImportButton from "../../components/common/ImportButton";
import ExportButton from "../../components/common/ExportButton";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const searchInputRef = useRef(null);
  const limit = 6;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts({ page, limit, search: debouncedSearch });
      const data = res?.data;
      setProducts(data?.data || []);
      setTotalPages(data?.pages || 1);
      setTotalCount(data?.total || 0);
    } catch {
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    searchInputRef.current?.focus();
  };

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };
  const openAddModal = () => {
    setEditData(null);
    setShowForm(true);
  };
  const closeModal = () => {
    setShowForm(false);
    setEditData(null);
  };
  const handleRefresh = () => {
    fetchProducts();
    setShowForm(false);
  };

  const getPaginationRange = () => {
    if (totalPages <= 1) return [];
    const delta = 2;
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);
    const items = [];
    items.push({ type: "page", value: 1, key: "page-1" });
    if (left > 2)
      items.push({ type: "ellipsis", value: "...", key: "ellipsis-start" });
    for (let i = left; i <= right; i++)
      items.push({ type: "page", value: i, key: `page-${i}` });
    if (right < totalPages - 1)
      items.push({ type: "ellipsis", value: "...", key: "ellipsis-end" });
    items.push({ type: "page", value: totalPages, key: `page-${totalPages}` });
    const seen = new Set();
    return items.filter(({ key }) => {
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <div className={styles.titleIcon}>
            <MdInventory2 size={18} />
          </div>
          <div>
            <h2 className={styles.title}>Products</h2>
            <p className={styles.subtitle}>
              {loading ? (
                <span style={{ opacity: 0.4 }}>Loading…</span>
              ) : (
                <>
                  {totalCount} item{totalCount !== 1 ? "s" : ""}
                  {debouncedSearch && (
                    <span className={styles.searchTag}>
                      "{debouncedSearch}"
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchWrapper}>
            {/* Icon is now decorative — no onClick needed, search fires on type */}
            <FiSearch className={styles.searchIcon} size={13} />
            <input
              ref={searchInputRef}
              className={styles.searchInput}
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  className={styles.clearBtn}
                  onClick={handleClearSearch}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                >
                  <FiX size={11} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <ExportButton entity="products" />
          <ImportButton entity="products" onSuccess={handleRefresh} />
          <motion.button
            className={styles.btnPrimary}
            onClick={openAddModal}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <FiPlus size={14} /> Add Product
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeModal}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleGroup}>
                  <div className={styles.modalIcon}>
                    <MdInventory2 size={15} />
                  </div>
                  <h3 className={styles.modalTitle}>
                    {editData ? "Edit Product" : "New Product"}
                  </h3>
                </div>
                <motion.button
                  className={styles.modalClose}
                  onClick={closeModal}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  transition={{ duration: 0.18 }}
                >
                  <FiX size={14} />
                </motion.button>
              </div>
              <div className={styles.modalBody}>
                <AddProduct
                  refresh={handleRefresh}
                  editData={editData}
                  setEditData={setEditData}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <ProductList
          products={products}
          loading={loading}
          refresh={fetchProducts}
          setEditData={setEditData}
          setShowForm={setShowForm}
        />
      </motion.div>

      <AnimatePresence>
        {!loading && totalPages > 1 && (
          <motion.div
            className={styles.pagination}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className={styles.pageInfo}>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              <span className={styles.totalCount}> · {totalCount} items</span>
            </span>
            <div className={styles.pageControls}>
              <button
                className={styles.pageArrow}
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                <FiChevronLeft size={13} />
              </button>
              {getPaginationRange().map(({ type, value, key }) =>
                type === "ellipsis" ? (
                  <span key={key} className={styles.ellipsis}>
                    …
                  </span>
                ) : (
                  <button
                    key={key}
                    className={`${styles.pageBtn} ${page === value ? styles.activeBtn : ""}`}
                    onClick={() => handlePageChange(value)}
                  >
                    {value}
                  </button>
                ),
              )}
              <button
                className={styles.pageArrow}
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                <FiChevronRight size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
