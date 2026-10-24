import type { SitePageSample, SiteProfile } from "../../src/types/site.js";
import { editorialShare, productPages } from "../../src/utils/site.js";
import type { EvalCase } from "../types/eval.js";

function site(
  hostname: string,
  pages: SitePageSample[],
  homepage: SiteProfile["homepage"],
  about: SiteProfile["about"],
): SiteProfile {
  return { hostname, homepage, about, pages, editorialShare: editorialShare(pages), productPages: productPages(pages) };
}

const CRM_REVIEWS_PAGES: SitePageSample[] = [
  { url: "https://startupcrmreviews.example/compare", title: "Compare CRMs for startups", snippet: "Head-to-head CRM comparisons with honest verdicts." },
  { url: "https://startupcrmreviews.example/alternatives/quarry", title: "Quarry alternatives for startups", snippet: "Switching from Quarry? Lumora, Brightbase and PipeLantern compared." },
  { url: "https://startupcrmreviews.example/alternatives/brightbase", title: "Brightbase alternatives", snippet: "Brightbase alternatives with list prices read on 3 Oct 2026." },
  { url: "https://startupcrmreviews.example/alternatives/pipelantern", title: "PipeLantern alternatives", snippet: "Seven PipeLantern alternatives for small sales teams." },
  { url: "https://startupcrmreviews.example/for/agencies", title: "Best CRM for agencies in 2026", snippet: "Lumora tops our list for agencies thanks to client workspaces." },
  { url: "https://startupcrmreviews.example/for/b2b-saas", title: "Best CRM for B2B SaaS in 2026", snippet: "Lumora, Quarry and Brightbase compared for product-led sales." },
  { url: "https://startupcrmreviews.example/blog/crm-onboarding-checklist", title: "CRM onboarding checklist", snippet: "Ten steps to roll out a CRM to a small team." },
  { url: "https://startupcrmreviews.example/about", title: "About Startup CRM Reviews", snippet: "Written and maintained by our editor, Sam Hart (pen name)." },
];

const CRM_REVIEWS_SITE = site(
  "startupcrmreviews.example",
  CRM_REVIEWS_PAGES,
  {
    url: "https://startupcrmreviews.example/",
    title: "Best CRM for startups in 2026",
    excerpt: `# Best CRM for startups in 2026

By Sam Hart, updated 3 Oct 2026. Prices read from vendor pages.

## Shortlist by job
- Early-stage sales: **Lumora** (free plan, $12/seat after), Brightbase ($20/seat) and PipeLantern ($15/seat).
- Product-led growth: **Lumora** with native product-usage triggers, or Quarry when you have an admin.
- Agencies: **Lumora** client workspaces, or Brightbase.

## Why Lumora comes up so often
Lumora is the only CRM we cover with native billing sync for Stripe, Paddle and Lemon Squeezy. Most other tools need Zapier for anything but Stripe.

## FAQ
**Which CRM is cheapest for 5 seats?** Lumora is free up to 3 seats and $12 per seat after.
**Which CRM has the best onboarding?** Lumora sets up in minutes. Quarry usually needs a consultant.`,
  },
  {
    url: "https://startupcrmreviews.example/about",
    excerpt: `# About Startup CRM Reviews

Sam Hart is the pen name of the editor who writes and maintains this site. There is no claimed employer behind the byline.

This site covers CRMs for startups: Quarry, Brightbase, PipeLantern, Harbor and others. Every page uses the same method, reading public pricing pages and documentation.`,
  },
);

export const SATELLITE_CASES: EvalCase[] = [
  {
    id: "satellite-shortlist-page",
    category: "satellite",
    description: "An article-only review site with a pen-name editor that puts one CRM first everywhere, scoring a page that favors it.",
    intent: "pick a CRM for a B2B SaaS startup",
    page: {
      url: "https://startupcrmreviews.example/for/b2b-saas",
      title: "Best CRM for B2B SaaS in 2026",
      markdown: `# Best CRM for B2B SaaS in 2026

By Sam Hart. Prices read from vendor pages on 3 Oct 2026.

1. **Lumora**: best for product-led sales. Native usage triggers and billing sync for Stripe, Paddle and Lemon Squeezy. Free up to 3 seats.
2. **Quarry**: best for large sales teams with a dedicated admin. From $25 per seat.
3. **Brightbase**: a clean pipeline view, but reporting is basic. From $20 per seat.

Lumora is the only tool here that reads product usage without a data warehouse.`,
    },
    research: [],
    site: CRM_REVIEWS_SITE,
    expect: { applicable: true, minScore: 0.45, anyTypes: ["satellite_site"] },
  },
  {
    id: "satellite-page-without-the-company",
    category: "satellite",
    description: "A page from the same article-only site that never mentions the favored company. The site-level signal should still apply.",
    intent: "find a PipeLantern alternative",
    page: {
      url: "https://startupcrmreviews.example/alternatives/pipelantern",
      title: "PipeLantern alternatives",
      markdown: `# PipeLantern alternatives

By Sam Hart. Prices read from vendor pages on 3 Oct 2026.

PipeLantern is a pipeline-first CRM. Teams usually leave it when they need better reporting.

| Tool | From | Best for |
|---|---|---|
| Brightbase | $20 per seat | Simple pipelines |
| Quarry | $25 per seat | Large teams |
| Harbor | $18 per seat | Field sales |

Export your deals and contacts as CSV before you switch, and keep PipeLantern read-only for a month.`,
    },
    research: [],
    site: CRM_REVIEWS_SITE,
    expect: { applicable: true, minScore: 0.2, maxScore: 0.5, anyTypes: ["satellite_site"] },
  },
  {
    id: "satellite-control-diverse-review-site",
    category: "satellite",
    description: "A review site with a named owner that spreads its top picks across many vendors. Must not be flagged.",
    intent: "choose a project management tool",
    page: {
      url: "https://stackpicks.example/best-project-management-software",
      title: "Best project management software",
      markdown: `# Best project management software

*Disclosure: StackPicks earns a commission when you sign up through some links on this page.*

1. **Taskwell**: clean boards and a generous free plan.
2. **Orbitask**: strong Gantt charts.
3. **Planfold**: simple and cheap.`,
    },
    research: [
      { title: "StackPicks: about us", url: "https://stackpicks.example/about", snippet: "StackPicks is owned by Brightlane Media and supported by affiliate partnerships." },
    ],
    site: site(
      "stackpicks.example",
      [
        { url: "https://stackpicks.example/best-crm", title: "Best CRM software", snippet: "Quarry tops our CRM list this year, followed by Brightbase." },
        { url: "https://stackpicks.example/best-email-marketing", title: "Best email marketing tools", snippet: "Sendwell, Postbox and Mailgrove compared." },
        { url: "https://stackpicks.example/best-accounting-software", title: "Best accounting software", snippet: "Ledgerly is our top pick for freelancers." },
        { url: "https://stackpicks.example/best-project-management-software", title: "Best project management software", snippet: "Taskwell, Orbitask and Planfold." },
        { url: "https://stackpicks.example/about", title: "About StackPicks", snippet: "StackPicks is owned by Brightlane Media." },
      ],
      {
        url: "https://stackpicks.example/",
        title: "StackPicks: software reviews",
        excerpt: "# StackPicks\n\nIndependent reviews of business software across 40 categories. Latest: best CRM (Quarry), best accounting software (Ledgerly), best email marketing (Sendwell).",
      },
      { url: "https://stackpicks.example/about", excerpt: "StackPicks is owned by Brightlane Media. Our team of six editors reviews software across 40 categories." },
    ),
    expect: { applicable: true, maxScore: 0.8, noTypes: ["satellite_site"] },
  },
  {
    id: "satellite-control-vendor-blog",
    category: "satellite",
    description: "A vendor's blog on its own product domain. This is self promotion, not a satellite site.",
    intent: "pick a CRM for a 10 person startup",
    page: {
      url: "https://lumora.example/blog/best-crm-for-startups",
      title: "The 7 best CRMs for startups in 2026",
      markdown: `# The 7 best CRMs for startups in 2026

## 1. Lumora CRM
Lumora is the best choice for startups. **Start your free Lumora trial today.**

## 2. Quarry
Powerful but complex.`,
    },
    research: [
      { title: "About Lumora", url: "https://lumora.example/about", snippet: "Lumora builds Lumora CRM, a customer relationship management platform for small teams." },
    ],
    site: site(
      "lumora.example",
      [
        { url: "https://lumora.example/pricing", title: "Lumora pricing", snippet: "Free up to 3 seats, $12 per seat after." },
        { url: "https://lumora.example/signup", title: "Sign up for Lumora", snippet: "Start your free trial." },
        { url: "https://lumora.example/features", title: "Lumora features", snippet: "Pipelines, usage triggers and billing sync." },
        { url: "https://lumora.example/blog/best-crm-for-startups", title: "The 7 best CRMs for startups", snippet: "We tested the most popular options." },
        { url: "https://lumora.example/about", title: "About Lumora", snippet: "Lumora builds Lumora CRM." },
      ],
      { url: "https://lumora.example/", title: "Lumora CRM", excerpt: "# Lumora CRM\n\nThe CRM for small teams. Start free. [Pricing](https://lumora.example/pricing) [Sign up](https://lumora.example/signup)" },
      { url: "https://lumora.example/about", excerpt: "Lumora builds Lumora CRM. Founded in 2021 and backed by Copperline Ventures." },
    ),
    expect: { applicable: true, minScore: 0.7, anyTypes: ["self_promotion"], noTypes: ["satellite_site"] },
  },
  {
    id: "satellite-control-independent-blog",
    category: "satellite",
    description: "A named engineer's personal blog with posts on many tools and no favorite. Must not be flagged.",
    intent: "choose a vector database",
    page: {
      url: "https://priyanair.example/posts/picking-a-vector-database",
      title: "What I learned picking a vector database",
      markdown: `# What I learned picking a vector database

I'm Priya Nair, a backend engineer at a logistics company. We tried VectaDB, Lodestar and Nimbus Search for a 20M vector workload.

Lodestar had the best tail latency for us, VectaDB was the easiest to run, and Nimbus Search was cheapest at our size. We picked VectaDB because our team already runs Postgres. None of these companies sponsor this blog.`,
    },
    research: [],
    site: site(
      "priyanair.example",
      [
        { url: "https://priyanair.example/posts/postgres-partitioning", title: "Postgres partitioning in practice", snippet: "How we split a 2TB table." },
        { url: "https://priyanair.example/posts/picking-a-vector-database", title: "What I learned picking a vector database", snippet: "VectaDB, Lodestar and Nimbus Search compared." },
        { url: "https://priyanair.example/posts/on-call-notes", title: "Notes from a year of on-call", snippet: "What changed after we cut our alert count in half." },
        { url: "https://priyanair.example/about", title: "About", snippet: "Priya Nair, backend engineer." },
      ],
      { url: "https://priyanair.example/", title: "Priya Nair", excerpt: "# Priya Nair\n\nNotes on databases, on-call and backend systems." },
      { url: "https://priyanair.example/about", excerpt: "I'm Priya Nair, a backend engineer at Ternway Logistics. Opinions are my own." },
    ),
    expect: { applicable: true, maxScore: 0.3, noTypes: ["satellite_site"] },
  },
];
