export const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const truncate = (str = "", maxLen = 32) => {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "…";
};

export const toTitleCase = (str = "") =>
  str.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const shortRef = (id = "") =>
  id ? `#${id.slice(-6).toUpperCase()}` : "—";
