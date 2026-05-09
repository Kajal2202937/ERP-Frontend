import { useEffect, useState, useCallback, useRef } from "react";
import { getProducts } from "../../services/ProductService";
import ProductList from "./ProductList";
import AddProduct from "./AddProduct";
import styles from "./Products.module.css";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { MdInventory2 } from "react-icons/md";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const searchInputRef = useRef(null);
  const limit = 6;

  const fetchProducts = useCallback(
    async (pageNo = page, searchText = activeSearch) => {
      setLoading(true);
      try {
        const res = await getProducts({
          page: pageNo,
          limit,
          search: searchText,
        });
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
    },
    [page, activeSearch],
  );

  useEffect(() => {
    fetchProducts(page, activeSearch);
  }, [page, activeSearch]);

  const handleSearch = () => {
    setActiveSearch(search.trim());
    setPage(1);
  };
  const handleClearSearch = () => {
    setSearch("");
    setActiveSearch("");
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
    fetchProducts(page, activeSearch);
    setShowForm(false);
  };

  const getPaginationRange = () => {
    const delta = 2,
      range = [];
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);
    range.push(1);
    if (left > 2) range.push("...");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push("...");
    if (totalPages > 1) range.push(totalPages);
    return range;
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
              {totalCount} item{totalCount !== 1 ? "s" : ""}
              {activeSearch && (
                <span className={styles.searchTag}>"{activeSearch}"</span>
              )}
            </p>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchWrapper}>
            <FiSearch
              className={styles.searchIcon}
              size={13}
              onClick={handleSearch}
            />
            <input
              ref={searchInputRef}
              className={styles.searchInput}
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
          refresh={() => fetchProducts(page, activeSearch)}
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
              {getPaginationRange().map((p, i) =>
                p === "..." ? (
                  <span key={i} className={styles.ellipsis}>
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${page === p ? styles.activeBtn : ""}`}
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
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
