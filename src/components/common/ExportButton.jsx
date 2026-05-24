
import { useState, useRef, useEffect, useCallback } from "react";
import usePDF from "../../hooks/usePDF";
import useExcel from "../../hooks/useExcel";
import styles from "./ExportButton.module.css";
import { FiDownload, FiFileText, FiGrid, FiChevronDown } from "react-icons/fi";

const ExportButton = ({
  entity,
  entityId,
  reportType,
  filters = {},
  disablePDF = false,
  disableExcel = false,
}) => {
  const [open, setOpen] = useState(false);

  const [localError, setLocalError] = useState(null);
  const ref = useRef(null);
  const errorTimerRef = useRef(null);

  const {
    downloadInvoicePDF,
    downloadSupplierPDF,
    downloadReportPDF,
    loading: pdfLoading,
    error: pdfError,
  } = usePDF();

  const {
    exportInvoices,
    exportSuppliers,
    exportInventory,
    exportOrders,
    exportProducts,
    loading: xlLoading,
    error: xlError,
  } = useExcel();

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const msg = pdfError || xlError;
    if (!msg) return;

    setLocalError(msg);
    clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setLocalError(null), 4000);

    return () => clearTimeout(errorTimerRef.current);
  }, [pdfError, xlError]);

  const busy = pdfLoading || xlLoading;

  const handlePDF = useCallback(async () => {
    setOpen(false);
    try {
      if (entityId) {
        if (entity === "invoices") return await downloadInvoicePDF(entityId);
        if (entity === "suppliers") return await downloadSupplierPDF();
      }
      if (reportType) return await downloadReportPDF(reportType, filters);
    } catch (err) {
      console.error("[ExportButton] handlePDF unexpected error:", err);
    }
  }, [
    entity,
    entityId,
    reportType,
    filters,
    downloadInvoicePDF,
    downloadSupplierPDF,
    downloadReportPDF,
  ]);

  const handleExcel = useCallback(async () => {
    setOpen(false);

    const exportMap = {
      invoices: exportInvoices,
      suppliers: exportSuppliers,
      inventory: exportInventory,
      orders: exportOrders,
      products: exportProducts,
    };

    const fn = exportMap[entity];
    if (!fn) {
      console.warn(
        `[ExportButton] No Excel export mapped for entity: "${entity}"`,
      );
      return;
    }

    try {
      await fn(filters);
    } catch (err) {
      console.error("[ExportButton] handleExcel unexpected error:", err);
    }
  }, [
    entity,
    filters,
    exportInvoices,
    exportSuppliers,
    exportInventory,
    exportOrders,
    exportProducts,
  ]);

  const showPDF = !disablePDF && (entityId || reportType);
  const showExcel = !disableExcel && entity;

  if (!showPDF && !showExcel) return null;

  return (
    <div className={styles.exportWrapper}>
      {showPDF && !showExcel && (
        <button className={styles.btn} onClick={handlePDF} disabled={busy}>
          <FiFileText /> {busy ? "Generating…" : "Export PDF"}
        </button>
      )}

      {!showPDF && showExcel && (
        <button className={styles.btn} onClick={handleExcel} disabled={busy}>
          <FiGrid /> {busy ? "Exporting…" : "Export Excel"}
        </button>
      )}

      {showPDF && showExcel && (
        <div className={styles.wrapper} ref={ref}>
          <button
            className={styles.btn}
            onClick={() => setOpen((o) => !o)}
            disabled={busy}
          >
            <FiDownload />
            {busy ? "Working…" : "Export"}
            <FiChevronDown className={open ? styles.chevronUp : ""} />
          </button>

          {open && (
            <div className={styles.menu}>
              <button className={styles.menuItem} onClick={handlePDF}>
                <FiFileText /> Download PDF
              </button>
              <button className={styles.menuItem} onClick={handleExcel}>
                <FiGrid /> Download Excel
              </button>
            </div>
          )}
        </div>
      )}

      {localError && (
        <p className={styles.exportError} role="alert">
          {localError}
        </p>
      )}
    </div>
  );
};

export default ExportButton;
