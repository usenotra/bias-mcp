import { mkdir, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { BiasScorer } from "../src/bias/scorer.js";
import { createBiasLlm } from "../src/bias/llm-factory.js";
import { DEFAULT_BIAS_MAX_CHARS } from "../src/constants/bias.js";
import { POLITICAL_CASES } from "./cases/political.js";
import { SAAS_CASES } from "./cases/saas.js";
import { SATELLITE_CASES } from "./cases/satellite.js";
import type { EvalCase, EvalRun } from "./types/eval.js";
import { checkCase } from "./utils/check.js";

const { values } = parseArgs({
  options: {
    runs: { type: "string", default: "1" },
    filter: { type: "string" },
    concurrency: { type: "string", default: "4" },
    threshold: { type: "string", default: "0.85" },
  },
});

const llm = createBiasLlm();
if (!llm) {
  console.error("Set NEON_AI_GATEWAY_BASE_URL and NEON_AI_GATEWAY_TOKEN, OPENROUTER_API_KEY, AI_GATEWAY_API_KEY or ANTHROPIC_API_KEY to run the bias evals.");
  process.exit(1);
}

const runs = Number(values.runs);
const concurrency = Number(values.concurrency);
const threshold = Number(values.threshold);
const cases = [...SAAS_CASES, ...POLITICAL_CASES, ...SATELLITE_CASES].filter((c) => !values.filter || c.id.includes(values.filter));
const scorer = new BiasScorer(llm!, { maxChars: Number(process.env.BIAS_MAX_CHARS) || DEFAULT_BIAS_MAX_CHARS });

const jobs: { testCase: EvalCase; run: number }[] = cases.flatMap((testCase) =>
  Array.from({ length: runs }, (_, run) => ({ testCase, run: run + 1 })),
);

async function execute({ testCase, run }: { testCase: EvalCase; run: number }): Promise<EvalRun> {
  const started = Date.now();
  const bias = await scorer.scorePage(testCase.page, testCase.research, testCase.intent, testCase.site);
  const checks = checkCase(testCase, bias);
  return {
    id: testCase.id,
    category: testCase.category,
    run,
    pass: checks.every((c) => c.pass),
    checks,
    bias,
    ms: Date.now() - started,
  };
}

const results: EvalRun[] = [];
let next = 0;
await Promise.all(
  Array.from({ length: Math.min(concurrency, jobs.length) }, async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      const result = await execute(job);
      results.push(result);
      const score = result.bias.applicable ? result.bias.score?.toFixed(2) : "n/a";
      const failed = result.checks.filter((c) => !c.pass).map((c) => `${c.name}: ${c.detail}`);
      console.log(
        `${result.pass ? "PASS" : "FAIL"}  ${result.id}${runs > 1 ? ` #${result.run}` : ""}  score=${score}  types=[${result.bias.types.join(",")}]  ${result.ms}ms${failed.length ? `\n      ${failed.join("\n      ")}` : ""}`,
      );
    }
  }),
);

const passed = results.filter((r) => r.pass).length;
const rate = passed / results.length;
const categories = [...new Set(results.map((r) => r.category))];
const byCategory = categories.map((category) => {
  const rs = results.filter((r) => r.category === category);
  return `${category} ${rs.filter((r) => r.pass).length}/${rs.length}`;
});

console.log(`\n${passed}/${results.length} passed (${(rate * 100).toFixed(0)}%)  ·  ${byCategory.join("  ·  ")}  ·  model ${scorer.model} via ${scorer.backend}`);

await mkdir("evals/results", { recursive: true });
const file = `evals/results/${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
await writeFile(file, JSON.stringify({ model: scorer.model, backend: scorer.backend, runs, rate, results }, null, 2));
console.log(`Saved ${file}`);

process.exit(rate >= threshold ? 0 : 1);
