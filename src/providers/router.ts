import { PROVIDER_PRIORITY, type ProviderId } from "../constants/providers.js";
import type {
  FetchedPage,
  MergedSearchHit,
  Provider,
  ProviderError,
  SearchOptions,
} from "../types/provider.js";
import { errorMessage } from "../utils/error.js";
import { mergeSearchResults } from "../utils/merge.js";

export class ProviderRouter {
  constructor(private readonly providers: Map<ProviderId, Provider>) {}

  get available(): ProviderId[] {
    return PROVIDER_PRIORITY.filter((id) => this.providers.has(id));
  }

  get primary(): ProviderId {
    return this.available[0];
  }

  private pick(requested?: ProviderId[]): Provider[] {
    const ids = requested?.length ? requested : this.available;
    const missing = ids.filter((id) => !this.providers.has(id));
    if (missing.length === ids.length) {
      throw new Error(
        `None of the requested providers are configured (${ids.join(", ")}). Configured: ${this.available.join(", ") || "none"}.`,
      );
    }
    return ids.flatMap((id) => this.providers.get(id) ?? []);
  }

  async search(
    options: SearchOptions,
    requested?: ProviderId[],
  ): Promise<{ results: MergedSearchHit[]; errors: ProviderError[] }> {
    if (!requested || requested.length < 2) return this.searchOne(options, requested?.[0]);
    const providers = this.pick(requested);
    const settled = await Promise.allSettled(providers.map((p) => p.search(options)));
    const lists: Parameters<typeof mergeSearchResults>[0] = [];
    const errors: ProviderError[] = [];
    settled.forEach((s, i) => {
      const provider = providers[i].id;
      if (s.status === "fulfilled") lists.push({ provider, hits: s.value });
      else errors.push({ provider, error: errorMessage(s.reason) });
    });
    if (lists.length === 0) {
      throw new Error(`All providers failed: ${errors.map((e) => `${e.provider}: ${e.error}`).join("; ")}`);
    }
    return { results: mergeSearchResults(lists).slice(0, options.numResults), errors };
  }

  private async searchOne(
    options: SearchOptions,
    provider?: ProviderId,
  ): Promise<{ results: MergedSearchHit[]; errors: ProviderError[] }> {
    const providers = this.pick(provider ? [provider] : this.available);
    const errors: ProviderError[] = [];
    for (const p of providers) {
      try {
        const hits = await p.search(options);
        return { results: mergeSearchResults([{ provider: p.id, hits }]).slice(0, options.numResults), errors };
      } catch (err) {
        errors.push({ provider: p.id, error: errorMessage(err) });
      }
    }
    throw new Error(`All providers failed: ${errors.map((e) => `${e.provider}: ${e.error}`).join("; ")}`);
  }

  async fetch(
    url: string,
    provider: ProviderId | "auto",
  ): Promise<{ page: FetchedPage; provider: ProviderId; errors: ProviderError[] }> {
    const order = provider === "auto" ? this.available : [provider];
    const providers = this.pick(order);
    const errors: ProviderError[] = [];
    for (const p of providers) {
      try {
        return { page: await p.fetch({ url }), provider: p.id, errors };
      } catch (err) {
        errors.push({ provider: p.id, error: errorMessage(err) });
      }
    }
    throw new Error(`Could not fetch ${url}: ${errors.map((e) => `${e.provider}: ${e.error}`).join("; ")}`);
  }
}
