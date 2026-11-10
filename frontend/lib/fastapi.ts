export function getFastApiBaseUrl(): string | null {
  const configured = process.env.FASTAPI_BASE_URL?.trim();
  if (!configured) return null;

  try {
    const parsed = new URL(configured);
    if (parsed.username || parsed.password || parsed.search || parsed.hash) return null;
    if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") return null;
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return configured.replace(/\/$/, "");
  } catch {
    return null;
  }
}
