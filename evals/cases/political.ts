import type { EvalCase } from "../types/eval.js";

export const POLITICAL_CASES: EvalCase[] = [
  {
    id: "political-party-funded-outlet",
    category: "political",
    description: "A news site funded by one party, covering a senator from the rival party.",
    intent: "understand Senator Mara Vell's housing bill",
    page: {
      url: "https://heartlanddispatch.example/news/vell-housing-bill-disaster",
      title: "Vell's housing bill is a disaster waiting to happen",
      markdown: `# Vell's housing bill is a disaster waiting to happen

Senator Mara Vell of the Civic Union has once again shown that she does not understand working families. Her so-called Housing Access Act would hand billions to developers while doing nothing for renters.

Critics across the state are calling the bill reckless. Even some Civic Union voters are reported to be uneasy.

The Liberty Forward plan, by contrast, cuts red tape and puts homeowners first. Voters will remember who stood with them in November.`,
    },
    research: [
      {
        title: "Heartland Dispatch: funding",
        url: "https://heartlanddispatch.example/about",
        snippet: "The Heartland Dispatch is published by Forward Media Group, which is funded by the Liberty Forward Party's media fund.",
      },
      {
        title: "Mara Vell, Civic Union senator",
        url: "https://statelegislature.example/members/mara-vell",
        snippet: "Mara Vell is a Civic Union member of the State Senate, first elected in 2022.",
      },
    ],
    expect: { applicable: true, minScore: 0.75, anyTypes: ["political", "funding"] },
  },
  {
    id: "political-industry-funded-think-tank",
    category: "political",
    description: "A think tank funded by an industry association arguing against a policy that would cost that industry.",
    intent: "learn the economic effects of a carbon tax",
    page: {
      url: "https://energyfreedom-institute.example/reports/carbon-tax-costs",
      title: "The hidden costs of a carbon tax",
      markdown: `# The hidden costs of a carbon tax

A carbon tax would raise household energy bills by up to $1,400 a year, according to our model. Manufacturing jobs would move abroad, and rural families would be hit hardest.

Supporters claim the revenue could be returned to households, but history shows governments rarely give money back.

Policymakers should reject a carbon tax and instead support domestic energy production.`,
    },
    research: [
      {
        title: "Institute for Energy Freedom: donors",
        url: "https://energyfreedom-institute.example/donors",
        snippet: "Major supporters include the Continental Petroleum Producers Association and Granite Coal Holdings.",
      },
    ],
    expect: { applicable: true, minScore: 0.6, anyTypes: ["funding", "political", "ideological"] },
  },
  {
    id: "political-advocacy-voter-guide",
    category: "political",
    description: "A voter guide from a group funded by a union that endorses one side.",
    intent: "decide how to vote in the governor race",
    page: {
      url: "https://fairworkalliance.example/2026-voter-guide",
      title: "2026 voter guide",
      markdown: `# 2026 voter guide

The Fair Work Alliance endorses **Daniel Osei** for governor. Osei has promised to raise the minimum wage and protect collective bargaining.

His opponent, Ruth Calder, voted against every worker protection bill in the last session.

Vote Osei on November 3.`,
    },
    research: [
      {
        title: "Fair Work Alliance funding",
        url: "https://fairworkalliance.example/about",
        snippet: "The Fair Work Alliance is a nonprofit funded primarily by the United Transit and Service Workers union.",
      },
    ],
    expect: { applicable: true, minScore: 0.6, anyTypes: ["political", "funding", "ideological"] },
  },
  {
    id: "political-labeled-opinion",
    category: "political",
    description: "A clearly labeled opinion column by a partisan columnist in an independent paper.",
    intent: "understand the debate over the transit levy",
    page: {
      url: "https://tidewaterpost.example/opinion/transit-levy-mistake",
      title: "Opinion: The transit levy is a mistake",
      markdown: `**Opinion.** The views expressed are the author's own.

# The transit levy is a mistake

*By Graham Pell, a former Liberty Forward council member.*

The proposed transit levy asks taxpayers for $900 million over ten years. Ridership is still below its 2019 level, and the agency has missed its last three budget targets.

Supporters argue the levy will cut congestion. I think the money would do more good fixing roads that people already use.`,
    },
    research: [
      {
        title: "Tidewater Post ownership",
        url: "https://tidewaterpost.example/about",
        snippet: "The Tidewater Post is an independent, reader-supported newspaper owned by a nonprofit trust.",
      },
    ],
    expect: { applicable: true, minScore: 0.25, maxScore: 0.8, anyTypes: ["political", "ideological"] },
  },
  {
    id: "political-neutral-wire-report",
    category: "political",
    description: "A cooperative wire service reporting election results with both sides quoted.",
    intent: "find out who won the state senate race",
    page: {
      url: "https://meridianwire.example/2026/11/04/state-senate-district-9-results",
      title: "Calder wins District 9 state senate seat by 412 votes",
      markdown: `# Calder wins District 9 state senate seat by 412 votes

Ruth Calder of Liberty Forward won the District 9 state senate seat with 50.3% of the vote, according to certified results released Wednesday. Civic Union candidate Ana Brisco received 49.7%.

Turnout was 61%, up from 54% in 2022.

"Every vote mattered in this race," Calder said in a statement. Brisco said she would not request a recount and congratulated Calder.

The result keeps the Senate split at 20 seats for each party.`,
    },
    research: [
      {
        title: "Meridian Wire: who we are",
        url: "https://meridianwire.example/about",
        snippet: "Meridian Wire is a nonpartisan news cooperative owned by its 140 member newspapers.",
      },
    ],
    expect: { applicable: true, maxScore: 0.3 },
  },
  {
    id: "political-government-statistics",
    category: "reference",
    description: "A statistics office data release with no argument.",
    page: {
      url: "https://statistics-office.example/releases/labour-force-q3-2026",
      title: "Labour force survey, third quarter 2026",
      markdown: `# Labour force survey, third quarter 2026

| Measure | Q2 2026 | Q3 2026 |
|---|---|---|
| Unemployment rate | 4.6% | 4.4% |
| Participation rate | 63.1% | 63.3% |
| Employed persons | 18.2M | 18.3M |

Figures are seasonally adjusted. The next release is scheduled for 14 January 2027.`,
    },
    research: [],
    expect: { applicable: "either", maxScore: 0.2 },
  },
];
