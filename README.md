# bias-mcp

One MCP server for web search and web fetch on top of **Context.dev**, **Firecrawl** and **Exa**. Every fetched page also gets a **bias score**.

- **`web_search`** uses one provider, picked from the keys you set in the order Context.dev, Firecrawl, Exa. It moves to the next configured provider only when a call fails, and reports the failure in `providerErrors`. Pass several providers in `providers` to query them in parallel, remove duplicate URLs and rank the merged list with reciprocal rank fusion.
- **`web_fetch`** turns any URL into clean markdown with the same provider order and fallback, or a provider you name. **It adds a `bias` object by default**; pass `bias: false` to turn that off.

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
2. **Scoring.** A cheap model (Claude Haiku 5.5 by default, about $0.10 per 1M input tokens, called through the [AI SDK](https://ai-sdk.dev)) reads the page, the reader's `intent` if given, and the research results. It returns structured JSON.
3. **Grounding.** `sources` may only cite the page itself or a research result. Any other URL the model cites is dropped.
4. **Not applicable.** For docs, reference pages, specs and changelogs, `applicable` is `false` and `score` is `null`. Bias isn't a meaningful question for those pages.

Bias types: `self_promotion`, `competitor_disparagement`, `affiliate`, `sponsored`, `political`, `funding`, `ideological`, `satellite_site`, `other`.

### Satellite sites

Some sites exist only to host comparison and "alternatives" articles, have an anonymous or pen-name editor, and keep putting one company first across the whole site, while the page you land on may not mention that company at all. A single page can't show this, so with `research: true` the server also profiles the site once per domain. It reads the homepage, a sample of other pages from a `site:` search, the about page, the share of editorial URLs and whether any product pages exist. A separate model call then decides whether the site is a satellite and which company it favors.

When it is, the page keeps its own score plus a fixed **+0.2**, gets the `satellite_site` type, and the `bias` object gains:

```jsonc
"satellite": {
  "favors": "Sequenzy",
  "evidence": "Owner is a pen name ... Sequenzy is listed first in the shortlist and the comparison table ...",
  "sources": ["https://www.saasemailmarketingtools.com/", "https://www.saasemailmarketingtools.com/about/"],
  "penalty": 0.2
}
```

The verdict is cached per domain, so every page on the site gets the same answer. Review sites that cover many vendors evenly, publishers that name their owner, personal blogs and a vendor's own blog are not flagged.

`web_search` takes an optional `bias: true`. It screens every result's snippet in **one** batched call. That's fast and cheap but rough; run `web_fetch` on a result for a sourced assessment.

## Setup

```bash
pnpm install && pnpm build
```

Set one provider key. With more than one, the first in the order Context.dev, Firecrawl, Exa does the work and the others are fallbacks. Bias scoring needs one model gateway. The server checks for these in order and uses the first one that is fully set:

1. **Neon AI Gateway:** `NEON_AI_GATEWAY_BASE_URL` and `NEON_AI_GATEWAY_TOKEN`. Both are required, and `neon env pull` writes them for you.
2. **OpenRouter:** `OPENROUTER_API_KEY`.
3. **Vercel AI Gateway:** `AI_GATEWAY_API_KEY`.
4. **Anthropic API:** `ANTHROPIC_API_KEY`.
5. **The `claude` CLI**, if it is installed, which runs on your Claude Code login.

See `.env.example`.

| Env var | Purpose |
|---|---|
| `CONTEXT_DEV_API_KEY` or `CONTEXT_API_KEY` | Enables Context.dev |
| `FIRECRAWL_API_KEY` | Enables Firecrawl |
| `EXA_API_KEY` | Enables Exa |
| `NEON_AI_GATEWAY_BASE_URL` + `NEON_AI_GATEWAY_TOKEN` | Bias scoring through the Neon AI Gateway (first choice) |
| `OPENROUTER_API_KEY` | Bias scoring through OpenRouter |
| `AI_GATEWAY_API_KEY` | Bias scoring through the Vercel AI Gateway |
| `ANTHROPIC_API_KEY` | Bias scoring through the Anthropic API |
| `BIAS_BACKEND` | Force one of `neon`, `openrouter`, `vercel`, `anthropic` or `claude-cli` |
| `BIAS_MODEL` | Model override. Defaults to Claude Haiku 5.5 in each gateway's naming: `claude-haiku-5-5` on Neon and Anthropic, `anthropic/claude-haiku-5.5` on OpenRouter and Vercel |
| `BIAS_MAX_CHARS` | Most page characters sent to the bias model (default 120000). Longer pages are cut and marked `truncated: true` |

### Claude Code / Claude Desktop / Cursor

```json
{
  "mcpServers": {
    "web": {
      "command": "node",
      "args": ["/path/to/bias-mcp/dist/index.js"],
      "env": {
        "CONTEXT_DEV_API_KEY": "…",
        "FIRECRAWL_API_KEY": "…",
        "EXA_API_KEY": "…",
        "NEON_AI_GATEWAY_BASE_URL": "…",
        "NEON_AI_GATEWAY_TOKEN": "…"
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
| `providers` | first configured | one to force it, several to merge, e.g. `["exa", "context"]` |
| `includeDomains` / `excludeDomains` | — | domain filters |
| `bias` | `false` | screen each result's snippet for bias |

### `web_fetch`
| Param | Default | |
|---|---|---|
| `url` | — | page to fetch |
| `provider` | `auto` | `auto` \| `context` \| `firecrawl` \| `exa` |
| `bias` | **`true`** | attach the `bias` object |
| `intent` | — | what the reader is deciding, e.g. "pick a payments provider" |
| `research` | `true` | look up the publisher's ownership and funding |
| `maxCharacters` | — | cut the returned markdown. Bias is still scored on the full page |

## Evals

```bash
pnpm eval    # bias evals against the real model, needs a model gateway from the list above
```

The evals in `evals/cases` are fictional pages with an expected outcome. Every company, outlet, party and person in them is made up. The SaaS set covers a vendor ranking itself first, an affiliate listicle, a sponsored article, a competitor hit piece, a vendor comparison that is honest about the competitor, an independent benchmark, API docs and a changelog. The satellite set covers two pages from an article-only site that favors one company (one of them never mentions it) and three look-alikes that must not be flagged: a review site with a named owner, a vendor's own blog and a personal engineering blog. The political set covers a party-funded outlet, an industry-funded think tank, a union-funded voter guide, a labeled opinion column, a nonpartisan wire report and a statistics release.

Each case checks that `applicable` matches, the score falls in the expected range, at least one expected bias type appears, high scores come with sources, every source points to the page or a research result, and the reason is not empty.

```bash
pnpm eval --runs 3              # run every case three times to measure stability
pnpm eval --filter political    # only cases whose id contains "political"
pnpm eval --threshold 0.9       # exit 1 when fewer than 90% of runs pass
```

Results are written to `evals/results/<timestamp>.json`. `pnpm eval` reads `.env` when it exists.

The last run on Claude Haiku 5.5 through the `claude` CLI passed 38 of 38 runs (19 cases, two runs each).

## Layout

```
src/
  index.ts            stdio entry
  tools/              web_search, web_fetch
  providers/          Context.dev, firecrawl, exa adapters + router (merge / fallback)
  bias/               scorer (Claude structured output) + publisher research
  types/ schemas/ constants/ utils/
evals/                fictional SaaS and political cases, checks and the runner
```
