#!/usr/bin/env node
/**
 * ensure-convit-env.mjs
 * Checks .env or .env.local for each CONVIT_* var by name (not value). Appends
 * only missing vars with a dev-only notice. Never prints or exposes values.
 *
 * Usage: node ensure-convit-env.mjs [path-to-project-root]
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const CONVIT_VARS = [
  { name: "CONVIT_URL", line: 'CONVIT_URL="https://api.openai.com/v1"', comment: "# Base URL — used for all LLM requests" },
  { name: "CONVIT_KEY", line: 'CONVIT_KEY="sk-..."', comment: "# API key — required for cloud. Omit for local" },
  { name: "CONVIT_MODEL", line: 'CONVIT_MODEL="gpt-4o-mini"', comment: "# Model ID — omit to auto-detect from LM Studio" },
  { name: "CONVIT_INPUT_COST", line: "# CONVIT_INPUT_COST=\"0.15\"", comment: "# Cost per 1M input tokens (USD)" },
  { name: "CONVIT_OUTPUT_COST", line: "# CONVIT_OUTPUT_COST=\"0.60\"", comment: "# Cost per 1M output tokens (USD)" },
  { name: "CONVIT_TIMEOUT", line: "# CONVIT_TIMEOUT=\"60000\"", comment: "# Request timeout (ms)" },
];

const DEV_BANNER = `# ┌─────────────────────────────────────────────────────────────────────────────
# │ convit — dev only. Do not commit. These vars are for local development
# │ and should not be uploaded or shared with other env vars.
# └─────────────────────────────────────────────────────────────────────────────
`;

const LOCAL_URL_PATTERN = /localhost|127\.0\.0\.1/;

function parseEnvVars(content) {
  const present = new Set();
  const values = {};
  const lines = content.split("\n");
  let lastConvitLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineToParse = trimmed.startsWith("#") ? trimmed.slice(1).trim() : trimmed;
    const match = lineToParse.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) {
      const [, name, val] = match;
      if (name.startsWith("CONVIT_")) {
        present.add(name);
        lastConvitLine = i;
        if (!trimmed.startsWith("#")) {
          values[name] = (val || "").replace(/^["']|["']$/g, "").trim();
        }
      }
    }
  }

  const hasContentAfterConvit = lastConvitLine >= 0 && lines.slice(lastConvitLine + 1).some((l) => l.trim().length > 0);

  return { present, values, totalLines: lines.length, lastConvitLine, hasContentAfterConvit };
}

function isLocalUrl(url) {
  if (!url) return false;
  return LOCAL_URL_PATTERN.test(url);
}

function main() {
  const root = process.argv[2] || process.cwd();
  const envLocal = join(root, ".env.local");
  const env = join(root, ".env");

  const targetFile = existsSync(envLocal) ? envLocal : existsSync(env) ? env : envLocal;
  const content = existsSync(targetFile) ? readFileSync(targetFile, "utf8") : "";

  const { present, values, totalLines, lastConvitLine, hasContentAfterConvit } = parseEnvVars(content);

  const missing = CONVIT_VARS.filter((v) => !present.has(v.name));

  const linesAfterConvit = lastConvitLine >= 0 ? totalLines - lastConvitLine - 1 : 0;

  const warnIfNotLast = () => {
    if (hasContentAfterConvit && lastConvitLine >= 0) {
      const afterStart = lastConvitLine + 2;
      const afterEnd = totalLines;
      console.warn("");
      console.warn(`⚠ ${targetFile}: ${totalLines} lines, convit ends at line ${lastConvitLine + 1}. ${linesAfterConvit} lines follow.`);
      console.warn("  When deploying or sharing other vars (lines " + afterStart + "–" + afterEnd + "), convit vars may be included. Consider moving convit to .env.local or keeping it at the end.");
    }
  };

  if (missing.length === 0) {
    const url = values.CONVIT_URL;
    const local = isLocalUrl(url);
    if (local) {
      console.log("convit vars present. Local URL — no pricing needed.");
    } else {
      console.log("convit vars present. Cloud URL — set CONVIT_INPUT_COST and CONVIT_OUTPUT_COST with your model's pricing for cost display.");
    }
    warnIfNotLast();
    process.exit(0);
  }

  const lines = missing.map((v) => `${v.comment}\n${v.line}`).join("\n\n");
  const block = DEV_BANNER + lines;
  const append = content.trimEnd() ? "\n\n" + block : block;
  writeFileSync(targetFile, content + append, "utf8");

  const added = missing.map((v) => v.name).join(", ");
  console.log(`Appended ${added} to ${targetFile}. Configure values. If using cloud, set CONVIT_INPUT_COST and CONVIT_OUTPUT_COST with your model's pricing.`);
  if (content.trimEnd().length > 0) {
    console.log(`${targetFile}: ${totalLines} lines before append. Convit block added at end.`);
  }
}

main();
