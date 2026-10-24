import { REQUEST_TIMEOUT_MS } from "../constants/providers.js";

/** POST JSON with a bearer token; throws with the response body on non-2xx. */
export async function postJson<T>(url: string, apiKey: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} from ${new URL(url).host}: ${text.slice(0, 500)}`);
  }
  return (await res.json()) as T;
}
