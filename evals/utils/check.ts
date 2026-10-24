import type { Bias } from "../../src/types/bias.js";
import { normalizeUrl } from "../../src/utils/url.js";
import type { EvalCase, EvalCheck } from "../types/eval.js";

export function checkCase(testCase: EvalCase, bias: Bias): EvalCheck[] {
  const { expect } = testCase;
  const checks: EvalCheck[] = [];

  checks.push({
    name: "no error",
    pass: !bias.error,
    detail: bias.error ?? "ok",
  });

  if (expect.applicable !== "either") {
    checks.push({
      name: "applicable",
      pass: bias.applicable === expect.applicable,
      detail: `expected ${expect.applicable}, got ${bias.applicable}`,
    });
  }

  if (bias.applicable && expect.minScore !== undefined) {
    checks.push({
      name: "min score",
      pass: bias.score !== null && bias.score >= expect.minScore,
      detail: `expected >= ${expect.minScore}, got ${bias.score}`,
    });
  }

  if (bias.applicable && expect.maxScore !== undefined) {
    checks.push({
      name: "max score",
      pass: bias.score !== null && bias.score <= expect.maxScore,
      detail: `expected <= ${expect.maxScore}, got ${bias.score}`,
    });
  }

  if (bias.applicable && expect.anyTypes?.length) {
    checks.push({
      name: "types",
      pass: bias.types.some((t) => expect.anyTypes!.includes(t)),
      detail: `expected one of [${expect.anyTypes.join(", ")}], got [${bias.types.join(", ")}]`,
    });
  }

  if (bias.applicable && (bias.score ?? 0) >= 0.5) {
    checks.push({
      name: "has sources",
      pass: bias.sources.length > 0,
      detail: `${bias.sources.length} sources`,
    });
  }

  const allowed = new Set([testCase.page.url, ...testCase.research.map((r) => r.url)].map(normalizeUrl));
  const stray = bias.sources.filter((s) => !allowed.has(normalizeUrl(s.url)));
  checks.push({
    name: "sources grounded",
    pass: stray.length === 0,
    detail: stray.length ? `ungrounded: ${stray.map((s) => s.url).join(", ")}` : "ok",
  });

  checks.push({
    name: "has reason",
    pass: bias.reason.trim().length > 20,
    detail: `${bias.reason.length} chars`,
  });

  return checks;
}
