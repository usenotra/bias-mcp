# web-mcp

One MCP server for web search and web fetch on top of **Exa**, **Firecrawl** and **context.dev**. Every fetched page also gets a **bias score**.

- **`web_search`** queries every configured provider in parallel, removes duplicate URLs, and ranks results with reciprocal rank fusion, so URLs that several providers return rank higher. Each result lists the providers that found it. If one provider fails, the others still return results, and the failure appears in `providerErrors`.
- **`web_fetch`** turns any URL into clean markdown. It tries `firecrawl → context → exa` until one works, or you can pick a provider. **It adds a `bias` object by default**; pass `bias: false` to turn that off.

## The bias score

Some pages have a stake in what they recommend. Say you search for *"best payment provider"* and land on Stripe's *"Top 5 payment companies"* post, which ranks Stripe #1. That page should not count the same as an independent review. In the same way, a news site funded by a political party gets flagged when it covers that party's opponents.

```jsonc
"bias": {
  "applicable": true,
  "score": 0.95,                 // 0 = neutral … 1 = very high
  "level": "very_high",          // none | low | medium | high | very_high
  "types": ["self_promotion", "competitor_disparagement"],
  "publisher": "Stripe, Inc.",
  "favors": ["Stripe"],
  "reason": "Published on stripe.com by Stripe, a payments provider, in a comparison that ranks Stripe first…",
  "sources": [
    { "url": "https://stripe.com/blog/…", "title": "…", "evidence": "\"1. Stripe — the best overall…\"" },
    { "url": "https://en.wikipedia.org/wiki/Stripe,_Inc.", "title": "…", "evidence": "Stripe is a payment processing company" }
  ],
  "model": "claude-haiku-5-5",
  "truncated": false,
  "researched": true
}
```

How it works:

1. **Publisher research** (`research: true`, the default). One extra search looks up the domain's owner, parent company, funding and political affiliation. Results are cached per domain for the life of the process.
2. **Scoring.** A cheap model (Claude Haiku 5.5, about $0.10 per 1M input tokens) reads the page, the reader's `intent` if given, and the research results. It returns structured JSON.
3. **Grounding.** `sources` may only cite the page itself or a research result. Any other URL the model cites is dropped.
4. **Not applicable.** For docs, reference pages, specs and changelogs, `applicable` is `false` and `score` is `null`. Bias isn't a meaningful question for those pages.

Bias types: `self_promotion`, `competitor_disparagement`, `affiliate`, `sponsored`, `political`, `funding`, `ideological`, `other`.

`web_search` takes an optional `bias: true`. It screens every result's snippet in **one** batched call. That's fast and cheap but rough; run `web_fetch` on a result for a sourced assessment.

## Setup

```bash
npm install && npm run build
```

Set at least one provider key. `ANTHROPIC_API_KEY` is needed for bias scoring. See `.env.example`.

| Env var | Purpose |
|---|---|
| `EXA_API_KEY` | Enables Exa |
| `FIRECRAWL_API_KEY` | Enables Firecrawl |
| `CONTEXT_DEV_API_KEY` | Enables context.dev |
| `ANTHROPIC_API_KEY` | Bias scoring |
| `BIAS_MODEL` | Model override (default `claude-haiku-5-5`) |
| `BIAS_MAX_CHARS` | Most page characters sent to the bias model (default 120000). Longer pages are cut and marked `truncated: true` |

### Claude Code / Claude Desktop / Cursor

```json
{
  "mcpServers": {
    "web": {
      "command": "node",
      "args": ["/path/to/web-mcp/dist/index.js"],
      "env": {
        "EXA_API_KEY": "…",
        "FIRECRAWL_API_KEY": "…",
        "CONTEXT_DEV_API_KEY": "…",
        "ANTHROPIC_API_KEY": "…"
      }
    }
  }
}
```

## Tools

### `web_search`
| Param | Default | |
|---|---|---|
| `query` | — | search query |
| `numResults` | 10 | max results after merging |
| `providers` | all configured | e.g. `["exa", "context"]` |
| `includeDomains` / `excludeDomains` | — | domain filters |
| `bias` | `false` | screen each result's snippet for bias |

### `web_fetch`
| Param | Default | |
|---|---|---|
| `url` | — | page to fetch |
| `provider` | `auto` | `auto` \| `firecrawl` \| `context` \| `exa` |
| `bias` | **`true`** | attach the `bias` object |
| `intent` | — | what the reader is deciding, e.g. "pick a payments provider" |
| `research` | `true` | look up the publisher's ownership and funding |
| `maxCharacters` | — | cut the returned markdown. Bias is still scored on the full page |

## Layout

```
src/
  index.ts            stdio entry
  tools/              web_search, web_fetch
  providers/          exa, firecrawl, context.dev adapters + router (merge / fallback)
  bias/               scorer (Claude structured output) + publisher research
  types/ schemas/ constants/ utils/
```
