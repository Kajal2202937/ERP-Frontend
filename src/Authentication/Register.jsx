import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", form);
      alert("Registered successfully");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.formBox}>
        <h2 className={styles.title}>Register</h2>

        <input
          className={styles.input}
          name="name"
          placeholder="Name"
          onChange={handleChange}
        />

        <input
          className={styles.input}
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          className={styles.input}
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <input
          className={styles.input}
          name="phone"
          placeholder="Phone (optional)"
          onChange={handleChange}
        />

        <button type="submit" className={styles.button}>
          Register
        </button>

        <p className={styles.linkText}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
