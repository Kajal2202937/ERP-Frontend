import { useState, useCallback } from "react";
import API from "../services/api";

const triggerDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};

const useExcel = () => {
  const [loading, setLoading] = useState(false);

  const [importing, setImporting] = useState(false);

  const [progress, setProgress] = useState(0);

  const [error, setError] = useState(null);

  const [importResult, setImportResult] = useState(null);

  const exportFile = useCallback(async (endpoint, filename) => {
    setLoading(true);

    setError(null);

    try {
      const response = await API.get(endpoint, {
        responseType: "blob",
      });

      triggerDownload(new Blob([response.data]), filename);
    } catch (err) {
      setError(err.message || "Excel export failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const importEntity = useCallback(async (entity, file) => {
    setImporting(true);

    setError(null);

    setProgress(0);

    setImportResult(null);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await API.post(`/pdf/xlsx/import/${entity}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },

        onUploadProgress: (e) => {
          if (e.total) {
            setProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      });

      setImportResult(response.data);

      return response.data;
    } catch (err) {
      setError(err.message || "Excel import failed");

      return null;
    } finally {
      setImporting(false);

      setTimeout(() => {
        setProgress(0);
      }, 1000);
    }
  }, []);

  return {
    exportProducts: () =>
      exportFile("/pdf/xlsx/products", `products-${Date.now()}.xlsx`),

    exportSuppliers: () =>
      exportFile("/pdf/xlsx/suppliers", `suppliers-${Date.now()}.xlsx`),

    exportInventory: () =>
      exportFile("/pdf/xlsx/inventory", `inventory-${Date.now()}.xlsx`),

    exportOrders: () =>
      exportFile("/pdf/xlsx/orders", `orders-${Date.now()}.xlsx`),

    exportInvoices: () =>
      exportFile("/pdf/xlsx/orders", `invoices-${Date.now()}.xlsx`),

    importEntity,

    loading,
    importing,
    progress,
    error,
    importResult,
  };
};

export default useExcel;
