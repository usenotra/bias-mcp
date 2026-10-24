import { spawn } from "node:child_process";
import { z } from "zod";
import { CLAUDE_CLI_TIMEOUT_MS } from "../constants/bias.js";
import type { StructuredLlm } from "../types/llm.js";

interface ClaudeCliResult {
  is_error?: boolean;
  subtype?: string;
  result?: string;
  structured_output?: unknown;
}

function runClaude(args: string[], input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.env.CLAUDE_CLI_PATH ?? "claude", args, {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: CLAUDE_CLI_TIMEOUT_MS,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`claude exited with code ${code}: ${(stderr || stdout).slice(0, 500)}`));
    });
    child.stdin.end(input);
  });
}

export function createClaudeCliLlm(model: string): StructuredLlm {
  return {
    backend: "claude-cli",
    model,
    async generate({ system, prompt, schema }) {
      const { $schema: _, ...jsonSchema } = z.toJSONSchema(schema);
      const stdout = await runClaude(
        [
          "-p",
          "--model",
          model,
          "--output-format",
          "json",
          "--json-schema",
          JSON.stringify(jsonSchema),
          "--system-prompt",
          system,
          "--tools",
          "",
          "--strict-mcp-config",
          "--no-session-persistence",
        ],
        prompt,
      );
      const result = JSON.parse(stdout) as ClaudeCliResult;
      if (result.is_error || result.structured_output === undefined) {
        throw new Error(`claude returned no structured output (${result.subtype ?? "unknown"}): ${String(result.result ?? "").slice(0, 300)}`);
      }
      return schema.parse(result.structured_output);
    },
  };
}
