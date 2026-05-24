import { useEffect, useCallback, useState } from "react";
import useAI from "../../hooks/useAI";
import styles from "./InsightsPanel.module.css";
import { FiRefreshCw, FiTrendingUp, FiAlertCircle } from "react-icons/fi";

const InsightsPanel = () => {
  const [insights, setInsights] = useState([]);

  const { getInsights, insightsLoading, insightsError } = useAI();

  const load = useCallback(async () => {
    const result = await getInsights();
    if (!result) return;

    const raw = result?.data?.insight;

    if (Array.isArray(raw)) {
      setInsights(
        raw.filter((item) => typeof item === "string" && item.trim()),
      );
    } else if (typeof raw === "string" && raw.trim()) {
      setInsights(
        raw
          .split("\n")
          .map((l) => l.replace(/^[-•*]\s*/, "").trim())
          .filter(Boolean),
      );
    } else {
      setInsights([]);
    }
  }, [getInsights]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <FiTrendingUp />
        <span>AI Insights</span>
        <button
          className={styles.refresh}
          onClick={load}
          disabled={insightsLoading}
          aria-label="Refresh insights"
          type="button"
        >
          <FiRefreshCw className={insightsLoading ? styles.spin : ""} />
        </button>
      </div>

      {insightsLoading && (
        <div className={styles.skeleton}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={styles.skLine}
              style={{ width: `${70 + n * 8}%` }}
            />
          ))}
        </div>
      )}

      {insightsError && !insightsLoading && (
        <p className={styles.error}>
          <FiAlertCircle style={{ verticalAlign: "middle", marginRight: 4 }} />
          {insightsError}
        </p>
      )}

      {!insightsLoading && insights.length > 0 && (
        <ul className={styles.list}>
          {insights.map((item, i) => (
            <li key={i} className={styles.item}>
              <span className={styles.dot} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {!insightsLoading && insights.length === 0 && !insightsError && (
        <p className={styles.empty}>No AI insights available yet.</p>
      )}
    </div>
  );
};

export default InsightsPanel;
