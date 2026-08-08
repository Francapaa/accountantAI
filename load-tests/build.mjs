import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { build } from "esbuild";

const SRC = "src";
const OUTDIR = "dist";

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (name.endsWith(".test.ts")) {
      out.push(full.replaceAll(sep, "/"));
    }
  }
  return out;
}

const entryPoints = walk(SRC);
const outbase = SRC;

if (entryPoints.length === 0) {
  console.error("No *.test.ts files found under src/");
  process.exit(1);
}

await build({
  entryPoints,
  outdir: OUTDIR,
  outbase,
  bundle: true,
  format: "cjs",
  platform: "neutral",
  target: "es2020",
  external: ["k6", "k6/*"],
  sourcemap: false,
  logLevel: "info",
}).catch(() => process.exit(1));

console.log(`Built ${entryPoints.length} k6 script(s) into ${OUTDIR}/`);