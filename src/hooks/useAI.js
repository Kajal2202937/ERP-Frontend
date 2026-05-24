import { useState, useCallback } from "react";
import API from "../services/api";

const AI_TIMEOUT = 60_000;

const useAI = () => {
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(null);

  /**
   * Send a chat message to the ERP assistant.
   * @param {Array<{role:string, content:string}>} messages - Full conversation history
   * @param {object} context - Live ERP context injected into the system prompt
   * @returns {object|null} { success, data: { reply } } or null on error
   */
  const chat = useCallback(async (messages, context = {}) => {
    setChatLoading(true);
    setChatError(null);
    try {
      const res = await API.post(
        "/ai/chat",
        { history: messages, context },
        { timeout: AI_TIMEOUT },
      );
      return res.data;
    } catch (err) {
      if (err?.name === "CanceledError" || err?.message === "canceled")
        return null;
      const msg =
        err?.response?.data?.message || err.message || "AI chat failed";
      setChatError(msg);
      console.error("[useAI] chat error:", msg);
      return null;
    } finally {
      setChatLoading(false);
    }
  }, []);

  /**
   * Fetch AI business insights.
   * @param {{ startDate?: string, endDate?: string }} [filter] - Optional date range.
   *   Pass nothing to get all-time insights. Do NOT pass dashboard context objects.
   * @returns {object|null} { success, data: { insight, summary, … } } or null on error
   */
  const getInsights = useCallback(async (filter = {}) => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const params = {};
      if (filter?.startDate) params.startDate = filter.startDate;
      if (filter?.endDate) params.endDate = filter.endDate;

      const res = await API.get("/ai/insights", {
        params,
        timeout: AI_TIMEOUT,
      });
      return res.data;
    } catch (err) {
      if (err?.name === "CanceledError" || err?.message === "canceled")
        return null;
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Could not load insights";
      setInsightsError(msg);
      console.error("[useAI] insights error:", msg);
      return null;
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  return {
    chat,
    getInsights,

    chatLoading,
    chatError,

    insightsLoading,
    insightsError,

    loading: chatLoading || insightsLoading,
    error: chatError || insightsError,
  };
};

export default useAI;
