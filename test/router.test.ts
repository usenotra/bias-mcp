import assert from "node:assert/strict";
import { test } from "node:test";
import type { ProviderId } from "../src/constants/providers.js";
import { ProviderRouter } from "../src/providers/router.js";
import type { Provider } from "../src/types/provider.js";

function fakeProvider(id: ProviderId, urls: string[], fail = false): Provider {
  return {
    id,
    async search() {
      if (fail) throw new Error(`${id} down`);
      return urls.map((url) => ({ url, title: url, snippet: "" }));
    },
    async fetch({ url }) {
      if (fail) throw new Error(`${id} down`);
      return { url, markdown: `from ${id}` };
    },
  };
}

test("search reports failed providers without failing the call", async () => {
  const router = new ProviderRouter(
    new Map<ProviderId, Provider>([
      ["exa", fakeProvider("exa", ["https://a.example"])],
      ["firecrawl", fakeProvider("firecrawl", [], true)],
    ]),
  );
  const { results, errors } = await router.search({ query: "q", numResults: 5 });
  assert.equal(results.length, 1);
  assert.deepEqual(errors.map((e) => e.provider), ["firecrawl"]);
});

test("search throws when every provider fails", async () => {
  const router = new ProviderRouter(new Map([["exa", fakeProvider("exa", [], true)]]));
  await assert.rejects(router.search({ query: "q", numResults: 5 }), /All providers failed/);
});

test("auto fetch falls back in order firecrawl, context, exa", async () => {
  const router = new ProviderRouter(
    new Map<ProviderId, Provider>([
      ["exa", fakeProvider("exa", [])],
      ["firecrawl", fakeProvider("firecrawl", [], true)],
      ["context", fakeProvider("context", [])],
    ]),
  );
  const { provider, errors } = await router.fetch("https://a.example", "auto");
  assert.equal(provider, "context");
  assert.deepEqual(errors.map((e) => e.provider), ["firecrawl"]);
});

test("requesting only unconfigured providers throws", async () => {
  const router = new ProviderRouter(new Map([["exa", fakeProvider("exa", [])]]));
  await assert.rejects(router.fetch("https://a.example", "firecrawl"), /None of the requested providers/);
});
