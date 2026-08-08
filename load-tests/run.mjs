import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import process from "node:process";

const K6 = process.env.K6_BIN || "k6";
const SKIP_SUFFIX = ".opt.";

const args = process.argv.slice(2);
const splitIdx = args.indexOf("--");
const targets = splitIdx === -1 ? args : args.slice(0, splitIdx);
const k6Args = splitIdx === -1 ? [] : args.slice(splitIdx + 1);

function* discover(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      yield* discover(full);
    } else if (name.endsWith(".js") && !name.includes(SKIP_SUFFIX)) {
      yield full;
    }
  }
}

/** Minimal dotenv parser: KEY=VALUE, comments/#, blank lines, quoted values. */
function parseDotEnv(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    const isQuoted = (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (isQuoted) value = value.slice(1, -1);
    if (key) out[key] = value;
  }
  return out;
}

const dotenv = parseDotEnv(join(process.cwd(), ".env"));
if (Object.keys(dotenv).length > 0) {
  console.log(`Loaded ${Object.keys(dotenv).length} variable(s) from .env`);
} else {
  console.log("No .env found — using system/CLI --env variables only.");
}

const files = [];
for (const target of targets) {
  const stat = statSync(target);
  if (stat.isDirectory()) {
    files.push(...discover(target));
  } else if (target.endsWith(".js")) {
    files.push(target);
  }
}
if (files.length === 0) {
  console.error("No k6 test files to run. Usage: node run.mjs <file|dir> [-- <k6 args>]");
  process.exit(1);
}

console.log(`Running ${files.length} k6 script(s) with "${K6}"`);
let failed = false;
for (const file of files) {
  console.log(`\n=== ${relative(process.cwd(), file)} ===`);
  const res = spawnSync(K6, ["run", ...k6Args, file], {
    env: { ...process.env, ...dotenv },
    stdio: "inherit",
  });
  if (res.status !== 0) failed = true;
}
process.exit(failed ? 1 : 0);