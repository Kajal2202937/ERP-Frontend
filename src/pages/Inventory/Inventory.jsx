import { useEffect, useState, useCallback, useMemo } from "react";
import { getInventory, deleteInventory } from "../../services/inventoryService";
import AddInventory from "./AddInventory";
import InventoryList from "./InventoryList";
import styles from "./Inventory.module.css";
import { toast } from "../../../utils/toast";  
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, X, ChevronLeft, ChevronRight, Trash2,
  Package, AlertTriangle, CheckCircle2, Boxes,
} from "lucide-react";
import ImportButton from "../../components/common/ImportButton";
import ExportButton from "../../components/common/ExportButton";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";

const LIMIT_OPTIONS = [5, 10, 20, 50];

const useBodyScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev || ""; };
  }, [locked]);
};

const Inventory = () => {
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [show,       setShow]       = useState(false);
  const [search,     setSearch]     = useState("");
  const [debounced,  setDebounced]  = useState("");
  const [filter,     setFilter]     = useState("all");
  const [page,       setPage]       = useState(1);
  const [limit,      setLimit]      = useState(10);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selected,   setSelected]   = useState(new Set());
  const [dialog,     setDialog]     = useState(null);

  const [summary, setSummary] = useState({
    total: 0, lowStock: 0, outOfStock: 0, active: 0,
  });

  useBodyScrollLock(show);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getInventory({
        page,
        limit,
        search: debounced || undefined,
        stock:  filter !== "all" ? filter : undefined,
      });
      const result = res?.data;
      setData(result?.data         || []);
      setTotal(result?.total       || 0);
      setTotalPages(result?.totalPages || 1);
      setSelected(new Set());
      if (result?.summary) {
        setSummary({
          total:      result.summary.total      ?? result.total ?? 0,
          lowStock:   result.summary.lowStock   ?? 0,
          outOfStock: result.summary.outOfStock ?? 0,
          active:     result.summary.active     ?? 0,
        });
      } else {
        setSummary((prev) => ({ ...prev, total: result?.total ?? prev.total }));
      }
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debounced, filter]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [limit, filter]);

  const handleBulkDelete = useCallback(() => {
    if (selected.size === 0) return;
    setDialog({
      title:        `Delete ${selected.size} item${selected.size > 1 ? "s" : ""}?`,
      message:      "This will permanently remove the selected inventory items. This cannot be undone.",
      variant:      "danger",
      confirmLabel: `Delete ${selected.size} item${selected.size > 1 ? "s" : ""}`,
      onConfirm: async () => {
        try {
          const productIds = data
            .filter((i) => selected.has(i._id))
            .map((i) => i.product._id);
          await deleteInventory(productIds);
          toast.success(`${selected.size} item(s) archived`);
          fetchInventory();
        } catch (err) {
          toast.error(err?.response?.data?.message || err?.message || "Delete failed");
        }
      },
    });
  }, [selected, data, fetchInventory]);

  const toggleSelect = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === data.length ? new Set() : new Set(data.map((i) => i._id))
    );
  }, [data]);

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  const paginationRange = useMemo(() => {
    const delta = 2, range = [];
    const left  = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);
    if (totalPages >= 1) range.push(1);
    if (left > 2)        range.push("...");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push("...");
    if (totalPages > 1)  range.push(totalPages);
    return range;
  }, [page, totalPages]);

  const kpis = useMemo(() => [
    { label: "Total Items",    value: summary.total,      Icon: Boxes,         color: "var(--accent)", bg: "var(--accent-soft)" },
    { label: "Low / Critical", value: summary.lowStock,   Icon: AlertTriangle, color: "var(--amber)",  bg: "var(--amber-soft)"  },
    { label: "Out of Stock",   value: summary.outOfStock, Icon: X,             color: "var(--red)",    bg: "var(--red-soft)"    },
    { label: "Active",         value: summary.active,     Icon: CheckCircle2,  color: "var(--green)",  bg: "var(--green-soft)"  },
  ], [summary]);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <div className={styles.titleIcon} aria-hidden="true">
            <Package size={18} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className={styles.title}>Inventory</h2>
            <p className={styles.subtitle}>Stock management</p>
          </div>
        </div>

        <div className={styles.controls}>
          <AnimatePresence>
            {selected.size > 0 && (
              <motion.button
                type="button"
                className={styles.btnDanger}
                onClick={handleBulkDelete}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1  }}
                exit={{   opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <Trash2 size={13} aria-hidden="true" /> Delete ({selected.size})
              </motion.button>
            )}
          </AnimatePresence>

          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={13} aria-hidden="true" />
            <input
              className={styles.searchInput}
              placeholder="Search product…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search inventory"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1   }}
                  exit={{   opacity: 0, scale: 0.6  }}
                >
                  <X size={11} aria-hidden="true" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <select
            className={styles.filterSelect}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter by stock level"
          >
            <option value="all">All Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          <select
            className={styles.filterSelect}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            aria-label="Rows per page"
          >
            {LIMIT_OPTIONS.map((l) => (
              <option key={l} value={l}>{l} / page</option>
            ))}
          </select>

          <ExportButton entity="inventory" />
          <ImportButton entity="inventory" onSuccess={fetchInventory} />
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => setShow(true)}
          >
            <Plus size={14} aria-hidden="true" /> Add Stock
          </button>
        </div>
      </div>

      <div className={styles.kpiRow} role="region" aria-label="Inventory summary">
        {kpis.map((k) => (
          <div key={k.label} className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <div
                className={styles.kpiIconBox}
                style={{ background: k.bg, color: k.color }}
                aria-hidden="true"
              >
                <k.Icon size={16} strokeWidth={1.8} />
              </div>
              <span className={styles.kpiLabel}>{k.label}</span>
            </div>
            {loading ? (
              <div className={styles.kpiSkeleton} aria-hidden="true" />
            ) : (
              <div
                className={styles.kpiValue}
                style={{ color: k.color }}
                aria-label={`${k.label}: ${k.value}`}
              >
                {k.value.toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {show && (
          <motion.div
            className={styles.modalOverlay}
            onClick={() => setShow(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{   opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Add inventory stock"
          >
            <div onClick={(e) => e.stopPropagation()}>
              <AddInventory
                refresh={() => { fetchInventory(); setShow(false); }}
                onClose={() => setShow(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingRow} aria-live="polite" aria-busy="true">
            <span className={styles.spinner} aria-hidden="true" />
            <span>Loading inventory…</span>
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            variant={debounced ? "search" : "inventory"}
            title={debounced ? "No results found" : "No inventory yet"}
            description={
              debounced
                ? `No items match "${debounced}". Try a different search.`
                : "Add your first stock item to get started."
            }
            action={!debounced ? { label: "Add Stock", onClick: () => setShow(true) } : null}
          />
        ) : (
          <InventoryList
            data={data}
            refresh={fetchInventory}
            selected={selected}
            toggleSelect={toggleSelect}
            toggleSelectAll={toggleSelectAll}
            onConfirm={setDialog}
          />
        )}
      </div>

      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Pagination">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} aria-hidden="true" />
          </button>
          {paginationRange.map((p, i) =>
            p === "..." ? (
              <span key={`e-${i}`} className={styles.paginationEllipsis}>…</span>
            ) : (
              <button
                key={p}
                type="button"
                className={page === p ? styles.pageActive : ""}
                onClick={() => handlePageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={page === p ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </nav>
      )}

      {total > 0 && (
        <p className={styles.paginationInfo} aria-live="polite">
          Showing {Math.min((page - 1) * limit + 1, total)}–
          {Math.min(page * limit, total)} of {total.toLocaleString()} items
        </p>
      )}

      <ConfirmDialog config={dialog} onClose={() => setDialog(null)} />
    </div>
  );
};

export default Inventory;