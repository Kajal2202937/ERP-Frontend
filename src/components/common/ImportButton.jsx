import { useRef } from "react";
import useExcel from "../../hooks/useExcel";
import useToast from "../../hooks/useToast";
import styles from "./ExportButton.module.css";
import { FiUpload, FiLoader } from "react-icons/fi";

const ImportButton = ({ entity, onSuccess }) => {
  const fileRef = useRef(null);
  const { importEntity, importing, progress, error } = useExcel();
  const toast = useToast();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const valid = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
    if (!valid) {
      toast.error("Only Excel files are allowed");
      return;
    }

    const result = await importEntity(entity, file);
    e.target.value = "";

    if (result?.success) {
      toast.success(
        `Imported: ${result.imported} | Skipped: ${result.skipped} | Failed: ${result.failed}`,
      );
      if (result.errors?.length) {
        result.errors.forEach((err) => {
          toast.error(`Skipped ${err.row}: ${err.error}`, { duration: 6000 });
        });
      }
      onSuccess?.(result);
    } else {
      toast.error(error || "Import failed");
    }
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      <button
        className={styles.btnImport}
        onClick={() => fileRef.current?.click()}
        disabled={importing}
      >
        {importing ? (
          <>
            <FiLoader className={styles.spin} size={13} />
            Uploading {progress}%
          </>
        ) : (
          <>
            <FiUpload size={13} />
            Import Excel
          </>
        )}
      </button>
    </>
  );
};

export default ImportButton;
