import { PROVIDER_ENV_KEYS, PROVIDER_IDS, type ProviderId } from "../constants/providers.js";
import type { Provider } from "../types/provider.js";
import { createContextProvider } from "./context.js";
import { createExaProvider } from "./exa.js";
import { createFirecrawlProvider } from "./firecrawl.js";

const FACTORIES: Record<ProviderId, (apiKey: string) => Provider> = {
  exa: createExaProvider,
  firecrawl: createFirecrawlProvider,
  context: createContextProvider,
};

/** Build every provider whose API key is present in the environment. */
export function loadProviders(env: NodeJS.ProcessEnv = process.env): Map<ProviderId, Provider> {
  const providers = new Map<ProviderId, Provider>();
  for (const id of PROVIDER_IDS) {
    const key = env[PROVIDER_ENV_KEYS[id]];
    if (key) providers.set(id, FACTORIES[id](key));
  }
  return providers;
}
