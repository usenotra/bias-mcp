import type { EvalCase } from "../types/eval.js";

export const SAAS_CASES: EvalCase[] = [
  {
    id: "saas-vendor-ranks-itself-first",
    category: "saas",
    description: "A CRM vendor's listicle of the best CRMs that puts its own product at number one.",
    intent: "pick a CRM for a 10 person startup",
    page: {
      url: "https://lumora.example/blog/best-crm-for-startups",
      title: "The 7 best CRMs for startups in 2026",
      markdown: `# The 7 best CRMs for startups in 2026

Choosing a CRM is one of the most important decisions an early team makes. We tested the most popular options so you don't have to.

## 1. Lumora CRM
Lumora is the best choice for startups. Setup takes five minutes, pricing starts at $0, and the AI assistant writes follow-ups for you. **Start your free Lumora trial today.**

## 2. Quarry
Quarry is powerful but complex. Most teams need a consultant to set it up, and the price climbs fast once you add seats.

## 3. Brightbase
Brightbase looks modern, but users report slow support and missing integrations.

## 4. PipeLantern
A decent option for sales-heavy teams, although reporting is limited.

## Conclusion
For almost every startup, Lumora CRM is the clear winner. Try it free.`,
    },
    research: [
      {
        title: "About Lumora",
        url: "https://lumora.example/about",
        snippet: "Lumora builds Lumora CRM, a customer relationship management platform for small teams. Founded in 2021 and backed by Copperline Ventures.",
      },
    ],
    expect: { applicable: true, minScore: 0.75, anyTypes: ["self_promotion", "competitor_disparagement"] },
  },
  {
    id: "saas-affiliate-listicle",
    category: "saas",
    description: "A review site that ranks project management tools and earns a commission on each signup.",
    intent: "choose a project management tool",
    page: {
      url: "https://stackpicks.example/best-project-management-software",
      title: "Best project management software (updated monthly)",
      markdown: `# Best project management software

*Disclosure: StackPicks earns a commission when you sign up through some links on this page. This does not affect our rankings.*

## 1. Taskwell
Clean boards, good automations and a generous free plan. [Get 30% off Taskwell](https://stackpicks.example/go/taskwell)

## 2. Orbitask
Strong Gantt charts and resource planning. [Try Orbitask free](https://stackpicks.example/go/orbitask)

## 3. Planfold
Simple and cheap, but light on reporting. [See Planfold deals](https://stackpicks.example/go/planfold)

## How we rank
Our editors use each tool for a week and score it on ease of use, features and price.`,
    },
    research: [
      {
        title: "StackPicks: about us",
        url: "https://stackpicks.example/about",
        snippet: "StackPicks is an independent software review site supported by affiliate partnerships with the vendors we cover.",
      },
    ],
    expect: { applicable: true, minScore: 0.3, maxScore: 0.8, anyTypes: ["affiliate"] },
  },
  {
    id: "saas-sponsored-article",
    category: "saas",
    description: "A tech news article about an analytics startup that is paid for by that startup.",
    intent: "find a product analytics tool",
    page: {
      url: "https://bytefront.example/2026/09/kestrel-analytics-product-teams",
      title: "How Kestrel Analytics is changing the way product teams work",
      markdown: `**Sponsored content, in partnership with Kestrel Analytics**

# How Kestrel Analytics is changing the way product teams work

Product teams have long struggled with slow dashboards and confusing event schemas. Kestrel Analytics fixes both. Its auto-capture engine records every click without code, and its new Insights AI answers questions in plain English.

"Kestrel gave us answers in minutes instead of weeks," says the head of product at a fintech company that uses Kestrel.

Teams that switch to Kestrel report faster decisions and happier engineers. Book a Kestrel demo to see it for yourself.`,
    },
    research: [
      {
        title: "Bytefront advertising",
        url: "https://bytefront.example/advertise",
        snippet: "Bytefront offers sponsored articles written with partner companies and labeled as sponsored content.",
      },
    ],
    expect: { applicable: true, minScore: 0.6, anyTypes: ["sponsored", "self_promotion"] },
  },
  {
    id: "saas-competitor-hit-piece",
    category: "saas",
    description: "A hosting company's post about why customers are leaving a competitor, with no outside research available.",
    intent: "compare cloud hosting providers",
    page: {
      url: "https://ferrovia.example/blog/why-teams-leave-brightbase-cloud",
      title: "Why teams are leaving Brightbase Cloud",
      markdown: `# Why teams are leaving Brightbase Cloud

Over the past year we have heard from hundreds of teams frustrated with Brightbase Cloud. Outages, surprise bills and slow support come up again and again.

When those teams move to Ferrovia, they tell us the difference is night and day. Ferrovia has never had a multi-region outage, our pricing is flat, and every customer gets a named engineer.

If Brightbase Cloud is holding you back, our migration team will move your workloads to Ferrovia for free.`,
    },
    research: [],
    expect: { applicable: true, minScore: 0.7, anyTypes: ["competitor_disparagement", "self_promotion"] },
  },
  {
    id: "saas-vendor-fair-comparison",
    category: "saas",
    description: "A vendor's comparison page that is upfront about where the competitor is the better choice.",
    intent: "pick a CRM for a 10 person startup",
    page: {
      url: "https://lumora.example/compare/lumora-vs-quarry",
      title: "Lumora vs Quarry: which one fits your team",
      markdown: `# Lumora vs Quarry

We make Lumora, so read this with that in mind. We tried to be fair.

**Pick Quarry if** you have more than 200 sales reps, need custom objects everywhere, or already use Quarry's marketing suite. Quarry's reporting is deeper than ours.

**Pick Lumora if** you are a small team that wants to be set up today and does not want to pay for an admin.

| | Lumora | Quarry |
|---|---|---|
| Starting price | $0 | $25 per seat |
| Custom objects | 10 | Unlimited |
| Setup time | Minutes | Weeks |`,
    },
    research: [
      {
        title: "About Lumora",
        url: "https://lumora.example/about",
        snippet: "Lumora builds Lumora CRM, a customer relationship management platform for small teams.",
      },
    ],
    expect: { applicable: true, minScore: 0.25, maxScore: 0.75, anyTypes: ["self_promotion"] },
  },
  {
    id: "saas-independent-benchmark",
    category: "saas",
    description: "A university lab's benchmark of vector databases with published methods and public funding.",
    intent: "choose a vector database",
    page: {
      url: "https://dblab.halvorsen-university.example/reports/vector-db-latency-2026",
      title: "Query latency of five vector databases at 100 million vectors",
      markdown: `# Query latency of five vector databases at 100 million vectors

Systems Lab, Halvorsen University. Funded by the National Research Council grant NRC-2291. The lab has no commercial relationship with any vendor tested.

## Method
We loaded the same 100M vector dataset into each system on identical hardware and ran 10,000 queries at recall 0.95. Scripts and raw results are in our public repository.

## Results
| System | p50 (ms) | p99 (ms) |
|---|---|---|
| VectaDB | 4.1 | 19.8 |
| Lodestar | 5.3 | 14.2 |
| Nimbus Search | 6.0 | 31.5 |

No single system won every workload. Lodestar had the best tail latency, while VectaDB had the best median.`,
    },
    research: [
      {
        title: "Systems Lab, Halvorsen University",
        url: "https://dblab.halvorsen-university.example/about",
        snippet: "The Systems Lab is a publicly funded academic research group studying database performance.",
      },
    ],
    expect: { applicable: true, maxScore: 0.3 },
  },
  {
    id: "saas-api-docs",
    category: "reference",
    description: "API reference documentation from a vendor.",
    page: {
      url: "https://docs.lumora.example/api/contacts",
      title: "Contacts API",
      markdown: `# Contacts API

## Create a contact
\`POST /v1/contacts\`

| Field | Type | Required |
|---|---|---|
| email | string | yes |
| name | string | no |
| owner_id | string | no |

Returns the created contact. Rate limit: 100 requests per minute per API key.`,
    },
    research: [],
    expect: { applicable: false },
  },
  {
    id: "saas-changelog",
    category: "reference",
    description: "A product changelog entry.",
    page: {
      url: "https://lumora.example/changelog/4-2",
      title: "Lumora 4.2",
      markdown: `# Lumora 4.2

- Added bulk edit for deals.
- Fixed a bug where CSV imports skipped the last row.
- The contacts list now loads 40% faster on accounts with more than 50,000 contacts.`,
    },
    research: [],
    expect: { applicable: false },
  },
];
