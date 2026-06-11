import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "../../../utils/toast";
import { submitTicket } from "../../services/ticketService";
import TicketChat from "../../components/Ticket/TicketChat";
import styles from "./SupportPage.module.css";

const SupportPage = () => {
  const [view, setView] = useState("form");
  const [ticket, setTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitTicket(form);
      setTicket(res);
      setView("chat");
      toast.success(
        `Ticket ${res.ticketId} created! You can now chat with us.`,
      );
    } catch (err) {
      toast.error(err.message || "Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <AnimatePresence mode="wait">
          {view === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.formHeader}>
                <h1 className={styles.formTitle}>Contact Support</h1>
                <p className={styles.formSubtitle}>
                  Fill out the form below and our team will get back to you
                  shortly.
                </p>
              </div>

              {/* FIX: added className={styles.formBody} — the original bare
                  `form {}` selector in the CSS was global and leaked padding
                  to every <form> on the page. */}
              <form
                onSubmit={handleSubmit}
                noValidate
                className={styles.formBody}
              >
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="name">
                      Full Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      autoComplete="name"
                      disabled={submitting}
                    />
                    {errors.name && (
                      <span className={styles.errorMsg}>{errors.name}</span>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="email">
                      Email Address <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={submitting}
                    />
                    {errors.email && (
                      <span className={styles.errorMsg}>{errors.email}</span>
                    )}
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="subject">
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    className={styles.input}
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Brief description of your issue"
                    disabled={submitting}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="message">
                    Message <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className={`${styles.textarea} ${errors.message ? styles.inputError : ""}`}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describe your issue in detail…"
                    rows={5}
                    disabled={submitting}
                  />
                  {errors.message && (
                    <span className={styles.errorMsg}>{errors.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className={styles.spinner} />
                      Submitting…
                    </>
                  ) : (
                    "Submit Ticket"
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              className={styles.chatWrap}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <TicketChat
                ticket={ticket}
                token={null}
                isAdmin={false}
                onClose={() => {
                  setView("form");
                  setForm({ name: "", email: "", subject: "", message: "" });
                  setTicket(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SupportPage;