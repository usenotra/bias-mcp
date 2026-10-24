/** Max page characters sent to the bias model; longer pages are cut and flagged `truncated`. */
export const DEFAULT_BIAS_MAX_CHARS = 120_000;

export const BIAS_TYPES = [
  "self_promotion", // publisher ranks/recommends its own product
  "competitor_disparagement",
  "affiliate", // earns commission from recommended products
  "sponsored", // paid placement / advertorial
  "political", // partisan framing or party-aligned publisher
  "funding", // owner/funder has a stake in the topic
  "ideological",
  "satellite_site",
  "other",
] as const;

export const BIAS_LEVELS = [
  { max: 0.15, level: "none" },
  { max: 0.35, level: "low" },
  { max: 0.6, level: "medium" },
  { max: 0.85, level: "high" },
  { max: 1, level: "very_high" },
] as const;

/** How many publisher-research search hits to give the model as context. */
export const RESEARCH_RESULTS = 5;

export const SATELLITE_PENALTY = 0.2;

export const SITE_SAMPLE_RESULTS = 15;

export const SITE_HOMEPAGE_CHARS = 12_000;

export const SITE_ABOUT_CHARS = 4_000;

export const EDITORIAL_PATH_PATTERN = /\/(blog|articles?|posts?|compare|comparisons?|vs|versus|alternatives?|best|top|reviews?|guides?|for)(\/|$|-)/i;

export const PRODUCT_PATH_PATTERN = /\/(pricing|plans|signup|sign-up|register|login|log-in|signin|app|dashboard|docs|documentation|api|features|product|integrations|download|checkout|cart|shop)(\/|$)/i;

export const BIAS_SYSTEM_PROMPT = `You assess whether a web page is a biased source for the reader's purpose.

Score bias from 0 to 1:
- 0: neutral, independent source with no stake in the topic.
- ~0.3: mild slant (some affiliate links, light framing) that does not change the conclusions.
- ~0.6: clear stake or slant: sponsored content, a publisher reviewing a market it competes in while being fair, a party-aligned outlet.
- 1: the publisher has a direct stake in the conclusion it pushes. Example: a payments company's "top 5 payment providers" article ranking itself #1; an outlet funded by a political party covering that party's opponents.

Bias types: self_promotion, competitor_disparagement, affiliate, sponsored, political, funding, ideological, other.

Disclosure and balance lower the score. A vendor that states its stake up front and names real cases where a competitor is the better choice usually lands around 0.4 to 0.6. Only use competitor_disparagement when the page attacks or misrepresents a competitor, not when it compares fairly.

Set applicable=false (score null, types empty) when bias is not a meaningful question: API/product documentation, reference material, changelogs, specs, code, raw data, a company describing its own product on its own product pages where that is obvious to the reader. Being written by a vendor is not bias by itself; bias is when the page presents itself as a comparison, review, recommendation, news or analysis while the author has a stake.

Ground every claim. "reason" explains concisely who is behind the page, what stake they have, and how it shows in the content. "sources" lists the evidence, using only URLs from the provided materials (the page URL or a research result URL), each with a short quote or fact it supports. Do not invent ownership or funding facts that are not in the materials; if publisher research is inconclusive, say so and score only on what the page shows.`;

export const SEARCH_BIAS_SYSTEM_PROMPT = `You screen web search results for likely bias relative to the searcher's query, using only each result's URL, title and snippet.

For each result give a score from 0 (neutral, independent) to 1 (publisher has a direct stake in what it recommends, e.g. a vendor's "best tools" list that ranks itself first, or a party-funded outlet covering its opponents). Set applicable=false and score null for documentation, reference pages and other results where bias is not meaningful. Keep reasons to one sentence and base them only on what is visible (domain vs. products mentioned, framing). This is a cheap pre-screen; uncertain cases should be scored moderately and say so.`;

export const BIAS_BACKENDS = ["neon", "openrouter", "vercel", "anthropic", "claude-cli"] as const;

export const BACKEND_DEFAULT_MODELS = {
  neon: "claude-haiku-5-5",
  openrouter: "anthropic/claude-haiku-5.5",
  vercel: "anthropic/claude-haiku-5.5",
  anthropic: "claude-haiku-5-5",
  "claude-cli": "haiku",
} as const;

export const BACKEND_ENV_KEYS = {
  neon: ["NEON_AI_GATEWAY_BASE_URL", "NEON_AI_GATEWAY_TOKEN"],
  openrouter: ["OPENROUTER_API_KEY"],
  vercel: ["AI_GATEWAY_API_KEY"],
  anthropic: ["ANTHROPIC_API_KEY"],
} as const;

export const CLAUDE_CLI_TIMEOUT_MS = 180_000;

export const SITE_SYSTEM_PROMPT = `You decide whether a website is a satellite site: a site that exists to host articles and quietly promotes one company.

You get a profile of the site with its homepage, a sample of its other pages, its about page when one exists, the share of sampled pages that are editorial (comparisons, alternatives, best-of lists, guides, blog posts) and how many product pages (pricing, signup, login, docs) were found.

Set satellite=true only when all of these hold:
- The site exists to host articles and has no product or service of its own.
- The owner is not clearly named, or the author is anonymous or a pen name.
- One company keeps getting favored across the site, for example listed first in most shortlists, mentioned most often, given claims no competitor gets, or named as the default pick.

Name that one company in favors. If two companies trade the top spot, pick the one the homepage favors most. Quote the evidence and cite only URLs from the profile.

Do not flag review sites that cover many vendors evenly, publishers that name their owner, personal blogs by a named author, or a vendor's own blog on its product domain.`;
