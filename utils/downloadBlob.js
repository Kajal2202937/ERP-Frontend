/**
 * downloadBlob.js
 * Shared utilities for both usePDF and useExcel hooks.
 *
 * WHY THIS EXISTS
 * ───────────────
 * Axios with `responseType: "blob"` wraps even error responses as Blobs.
 * Calling `err.response.data.message` on a Blob always returns `undefined`,
 * which is why errors were silently swallowed before this fix.
 */

/**
 * Parse a human-readable message from an Axios error whose response body
 * may be a Blob (happens when `responseType: "blob"` is set).
 *
 * @param {unknown} err - Axios error object
 * @param {string}  fallback
 * @returns {Promise<string>}
 */
export const parseBlobError = async (err, fallback = "Request failed") => {
  const data = err?.response?.data;

  
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      const json = JSON.parse(text);
      return json?.message || json?.error || fallback;
    } catch {
      return fallback;
    }
  }

  return data?.message || err?.message || fallback;
};

/**
 * Create an <a> element, click it to trigger a download, then clean up.
 *
 * @param {Blob}   blob
 * @param {string} filename  - e.g. "invoice-abc123.pdf"
 */
export const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};