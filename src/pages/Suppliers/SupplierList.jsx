import {
  deleteSupplier,
  updateSupplier,
  toggleSupplierStatus,
} from "../../services/SupplierService";

import styles from "./SupplierList.module.css";
import {
  FiEdit,
  FiTrash2,
  FiSave,
  FiX,
} from "react-icons/fi";

import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import API from "../../services/api";

const SupplierList = ({
  data = [],
  refresh,
  loading,
  selected,
  setSelected,
}) => {
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});

  // ✅ DASHBOARD STATS
  const [stats, setStats] = useState({});

  // =========================
  // FETCH PRODUCT STATS
  // =========================
  useEffect(() => {
    API.get("/products")
      .then((res) => {
        const products = res.data.data || [];

        const map = {};

        products.forEach((p) => {
          const supplierId = p.supplier?._id;
          if (!supplierId) return;

          if (!map[supplierId]) {
            map[supplierId] = {
              count: 0,
              quantity: 0,
              value: 0,
            };
          }

          map[supplierId].count += 1;
          map[supplierId].quantity += p.quantity || 0;
          map[supplierId].value +=
            (p.price || 0) * (p.quantity || 0);
        });

        setStats(map);
      })
      .catch(() => {});
  }, [data]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selected.length === data.length) setSelected([]);
    else setSelected(data.map((d) => d._id));
  };

  const handleDelete = async (id) => {
    try {
      await deleteSupplier(id);
      toast.success("Deleted");
      refresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleUpdate = async (id) => {
    try {
      await updateSupplier(id, form);
      setEditId(null);
      setForm({});
      toast.success("Updated");
      refresh();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleStatus = async (id) => {
    try {
      await toggleSupplierStatus(id);
      toast.success("Status updated");
      refresh();
    } catch {
      toast.error("Status update failed");
    }
  };

  if (loading)
    return <div className={styles.loading}>Loading...</div>;

  if (!data.length)
    return <div className={styles.empty}>No suppliers found</div>;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={
                selected.length === data.length && data.length > 0
              }
              onChange={toggleAll}
            />
          </th>

          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>

          {/* ✅ NEW DASHBOARD COLUMNS */}
          <th>Products</th>
          <th>Stock Qty</th>
          <th>Stock Value</th>

          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {data.map((s) => (
          <tr key={s._id}>
            <td>
              <input
                type="checkbox"
                checked={selected.includes(s._id)}
                onChange={() => toggleSelect(s._id)}
              />
            </td>

            {editId === s._id ? (
              <>
                <td>
                  <input
                    value={form.name || ""}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </td>

                <td>
                  <input
                    value={form.email || ""}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </td>

                <td>
                  <input
                    value={form.phone || ""}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </td>

                {/* DASHBOARD EMPTY IN EDIT */}
                <td>—</td>
                <td>—</td>
                <td>—</td>

                <td>
                  <button
                    className={styles.iconBtn}
                    onClick={() => setEditId(null)}
                  >
                    <FiX />
                  </button>
                </td>

                <td>
                  <button
                    className={styles.saveBtn}
                    onClick={() => handleUpdate(s._id)}
                  >
                    <FiSave />
                  </button>
                </td>
              </>
            ) : (
              <>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.phone}</td>

                {/* ✅ DASHBOARD DATA */}
                <td>{stats[s._id]?.count || 0}</td>

                <td>{stats[s._id]?.quantity || 0}</td>

                <td>
                  ₹ {stats[s._id]?.value?.toLocaleString() || 0}
                </td>

                <td>
                  <span
                    onClick={() => handleStatus(s._id)}
                    className={
                      s.active
                        ? styles.active
                        : styles.inactive
                    }
                  >
                    {s.active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className={styles.actions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => {
                      setEditId(s._id);
                      setForm({
                        name: s.name,
                        email: s.email,
                        phone: s.phone,
                      });
                    }}
                  >
                    <FiEdit />
                  </button>

                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(s._id)}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SupplierList;