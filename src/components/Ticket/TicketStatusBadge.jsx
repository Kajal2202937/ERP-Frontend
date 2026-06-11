import React from "react";
import styles from "./TicketStatusBadge.module.css";

const STATUS_CONFIG = {
  new: { label: "New", color: "blue" },
  open: { label: "Open", color: "indigo" },
  in_progress: { label: "In Progress", color: "amber" },
  waiting_for_user: { label: "Waiting for User", color: "purple" },
  resolved: { label: "Resolved", color: "green" },
  closed: { label: "Closed", color: "gray" },
};

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "gray" },
  medium: { label: "Medium", color: "blue" },
  high: { label: "High", color: "amber" },
  urgent: { label: "Urgent", color: "red" },
};

const TicketStatusBadge = ({ status, priority, size = "sm" }) => {
  if (status) {
    const config = STATUS_CONFIG[status] || { label: status, color: "gray" };
    return (
      <span
        className={`${styles.badge} ${styles[config.color]} ${styles[size]}`}
      >
        {config.label}
      </span>
    );
  }

  if (priority) {
    const config = PRIORITY_CONFIG[priority] || {
      label: priority,
      color: "gray",
    };
    return (
      <span
        className={`${styles.badge} ${styles[config.color]} ${styles[size]}`}
      >
        {config.label}
      </span>
    );
  }

  return null;
};

export default TicketStatusBadge;
