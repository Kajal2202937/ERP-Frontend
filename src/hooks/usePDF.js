
import { useState, useCallback } from "react";
import API from "../services/api";
import { parseBlobError, triggerDownload } from "../../utils/downloadBlob";

const REPORT_ENDPOINTS = {
  "sales-report": "/pdf/sales",
  sales: "/pdf/sales",
  suppliers: "/pdf/suppliers",
};

const usePDF = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const _download = useCallback(async (url, params, filename) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get(url, {
        params,
        responseType: "blob",
      });

      triggerDownload(
        new Blob([response.data], { type: "application/pdf" }),
        filename,
      );
    } catch (err) {
      const msg = await parseBlobError(err, "PDF generation failed");
      setError(msg);
      console.error("[usePDF] download error:", msg, err);
    } finally {
      setLoading(false);
    }
  }, []);

  /** GET /pdf/invoice/:id */
  const downloadInvoicePDF = useCallback(
    (id) => _download(`/pdf/invoice/${id}`, {}, `invoice-${id}.pdf`),
    [_download],
  );

  const downloadSupplierPDF = useCallback(
    () => _download("/pdf/suppliers", {}, `supplier-report-${Date.now()}.pdf`),
    [_download],
  );

  /**
   * FIX #2: was POSTing to /pdf/report which doesn't exist.
   * Now maps reportType → the correct GET endpoint via REPORT_ENDPOINTS.
   * Filters are passed as query params (matching the backend's req.query).
   *
   * @param {"sales-report"|"sales"|"suppliers"} type
   * @param {Object} filters  — e.g. { startDate, endDate }
   */
  const downloadReportPDF = useCallback(
    (type, filters = {}) => {
      const endpoint = REPORT_ENDPOINTS[type];
      if (!endpoint) {
        setError(`Unknown report type: "${type}"`);
        console.error("[usePDF] No endpoint mapped for reportType:", type);
        return;
      }
      return _download(endpoint, filters, `report-${type}-${Date.now()}.pdf`);
    },
    [_download],
  );

  return {
    downloadInvoicePDF,
    downloadSupplierPDF,
    downloadReportPDF,
    loading,
    error,
  };
};

export default usePDF;
