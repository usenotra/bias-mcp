/** Normalize a URL for dedupe: lowercase host, drop www, hash, trailing slash and tracking params. */
export function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    u.hash = "";
    u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
    for (const key of [...u.searchParams.keys()]) {
      if (key.startsWith("utm_") || key === "ref" || key === "fbclid" || key === "gclid") {
        u.searchParams.delete(key);
      }
    }
    if (u.pathname.length > 1 && u.pathname.endsWith("/")) u.pathname = u.pathname.replace(/\/+$/, "");
    let out = u.toString();
    if (out.endsWith("/")) out = out.slice(0, -1);
    return out.replace(/^http:/, "https:");
  } catch {
    return raw;
  }
}

export function hostnameOf(raw: string): string {
  try {
    return new URL(raw).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return raw;
  }
}
