const API_ORIGIN = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  return url.endsWith("/api/v1") ? url : url.replace(/\/+$/, "") + "/api/v1";
})();

const API_ROOT = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  try { return new URL(url).origin; } catch { return url; }
})();

export { API_ORIGIN, API_ROOT };
