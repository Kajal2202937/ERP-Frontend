import { useEffect, useCallback, useState } from "react";
import useAI from "../../hooks/useAI";
import styles from "./InsightsPanel.module.css";
import { FiRefreshCw, FiTrendingUp, FiAlertCircle } from "react-icons/fi";

const safeParseInsights = (result) => {
  try {
    if (!result) return null;

    const raw =
      result?.data?.insight ?? result?.data?.insights ?? result?.insight;

    if (Array.isArray(raw)) {
      const items = raw
        .filter((item) => typeof item === "string" && item.trim())
        .map((item) => item.trim());
      return items.length > 0 ? items : null;
    }

    if (typeof raw === "string" && raw.trim()) {
      const items = raw
        .split("\n")
        .map((l) => l.replace(/^[-•*\d.]\s*/, "").trim())
        .filter(Boolean);
      return items.length > 0 ? items : null;
    }

    if (raw !== undefined && raw !== null) {
      console.warn(
        "[InsightsPanel] unexpected insight shape:",
        typeof raw,
        raw,
      );
    }

    return null;
  } catch (err) {
    console.error("[InsightsPanel] parse error:", err);
    return null;
  }
};

const InsightsPanel = ({ analyticsData = {} }) => {
  const [insights, setInsights] = useState([]);
  const [parseError, setParseError] = useState(null);

  const { getInsights, insightsLoading, insightsError } = useAI();

  const load = useCallback(async () => {
    setParseError(null);
    try {
      const result = await getInsights(analyticsData);
      const parsed = safeParseInsights(result);

      if (parsed === null) {
        setInsights([]);
        if (!insightsError) {
          setParseError("Could not parse AI response — please try again.");
        }
      } else {
        setInsights(parsed);
      }
    } catch (err) {
      setParseError(err.message || "Failed to load insights");
      setInsights([]);
    }
  }, [getInsights, analyticsData, insightsError]);

  useEffect(() => {
    if ((analyticsData.totalOrders ?? 0) > 0) {
      load();
    }
  }, []);

  const displayError = insightsError || parseError;

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
          title="Refresh AI insights"
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

      {displayError && !insightsLoading && (
        <p className={styles.error}>
          <FiAlertCircle style={{ verticalAlign: "middle", marginRight: 4 }} />
          {displayError}
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

      {!insightsLoading && insights.length === 0 && !displayError && (
        <p className={styles.empty}>
          {(analyticsData.totalOrders ?? 0) === 0
            ? "Add orders to enable AI insights."
            : "No AI insights available yet."}
        </p>
      )}
    </div>
  );
};

export default InsightsPanel;
