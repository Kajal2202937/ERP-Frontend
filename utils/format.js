
export const formatCurrency = (num = 0) => {
  if (!num && num !== 0) return "₹ 0";
  const n = Number(num);
  if (isNaN(n)) return "₹ 0";
  if (n >= 10_000_000) return `₹ ${(n / 10_000_000).toFixed(1)} Cr`;
  if (n >= 100_000) return `₹ ${(n / 100_000).toFixed(1)} L`;
  if (n >= 1_000) return `₹ ${n.toLocaleString("en-IN")}`;
  return `₹ ${n}`;
};

export const formatCompact = (num = 0) => {
  const n = Number(num);
  if (isNaN(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

export const formatPercent = (num = 0, decimals = 2) => {
  const n = Number(num);
  if (isNaN(n)) return "0%";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(decimals)}%`;
};

export const formatDateRange = (from, to) => {
  if (!from || !to) return "";
  const f = new Date(from);
  const t = new Date(to);
  const opts = { month: "short", day: "numeric" };
  const yearOpt = { year: "numeric" };
  return `${f.toLocaleDateString("en-IN", opts)} – ${t.toLocaleDateString("en-IN", { ...opts, ...yearOpt })}`;
};

export const getDelta = (current, previous) => {
  if (!previous || previous === 0) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  return {
    pct,
    label: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`,
    direction: pct >= 0 ? "up" : "down",
    isPositive: pct >= 0,
  };
};
