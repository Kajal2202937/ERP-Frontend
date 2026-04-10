import { useEffect, useState, useCallback } from "react";
import {
  getSuppliers,
  bulkDeleteSuppliers,
} from "../../services/SupplierService";

import AddSupplier from "./AddSupplier";
import SupplierList from "./SupplierList";
import styles from "./Suppliers.module.css";

import {
  FiPlus,
  FiTrash2,
  FiSearch,
  FiX,
  FiUser
} from "react-icons/fi";

import { toast } from "react-toastify";

const Suppliers = () => {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSuppliers({
        page,
        limit: 6,
        search,
      });

      setData(res?.data?.data || []);
      setTotalPages(res?.data?.totalPages || 1);
    } catch {
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchData();
    }, 400);

    return () => clearTimeout(delay);
  }, [fetchData]);

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteSuppliers(selected);
      toast.success("Deleted successfully");
      setSelected([]);
      fetchData();
    } catch {
      toast.error("Bulk delete failed");
    }
  };

  return (
    <div className={styles.container}>

      {/* TOP BAR */}
      <div className={styles.topBar}>
        <div>
          <h2 className={styles.title}><FiUser />Suppliers</h2>
          <p className={styles.subTitle}>Manage all supplier records</p>
        </div>

        {/* SEARCH */}
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />

          <input
            className={styles.search}
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />

          {search && (
            <button
              className={styles.clearBtn}
              onClick={() => setSearch("")}
              type="button"
            >
              <FiX />
            </button>
          )}
        </div>

        {/* ADD BUTTON */}
        <button className={styles.addBtn} onClick={() => setShow(true)}>
          <FiPlus /> Add Supplier
        </button>

        {/* DELETE BUTTON */}
        {selected.length > 0 && (
          <button className={styles.deleteBtn} onClick={handleBulkDelete}>
            <FiTrash2 /> Delete ({selected.length})
          </button>
        )}
      </div>

      {/* MODAL */}
      {show && (
        <AddSupplier
          refresh={fetchData}
          close={() => setShow(false)}
        />
      )}

      {/* TABLE */}
      <div className={styles.card}>
        <SupplierList
          data={data}
          refresh={fetchData}
          loading={loading}
          selected={selected}
          setSelected={setSelected}
        />
      </div>

      {/* PAGINATION */}
      <div className={styles.pagination}>
        <button
          className={styles.pageBtn}
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => {
          const pageNum = i + 1;

          return (
            <button
              key={pageNum}
              className={`${styles.pageBtn} ${
                page === pageNum ? styles.activePage : ""
              }`}
              onClick={() => setPage(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          className={styles.pageBtn}
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Suppliers;