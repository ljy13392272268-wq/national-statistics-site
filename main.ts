// America in Numbers — the hand-in program (Node 22, standard library only).
//
// It copies this repository's app/ (the static site) and screenshots/ (the
// screenshots of the site running) into the output directory and writes
// output/dossier.json, the summary the judge reads, with the vendored
// make.fun library. The library file itself is left exactly as the kit
// shipped it: the scorer rebuilds the dossier with its own copy and the
// two must match byte for byte.
//
// Run it outside the grader like this:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Fail fast with a clear message if the site is not where it should be.
if (!existsSync(join(repoRoot, "app", "index.html"))) {
  throw new Error("app/index.html is missing: nothing to hand in");
}

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });
mkdirSync(join(outputDir, "screenshots"), { recursive: true });
if (existsSync(join(repoRoot, "screenshots"))) {
  cpSync(join(repoRoot, "screenshots"), join(outputDir, "screenshots"), { recursive: true });
}

// The scorer's own caps, as the starter states them: at most 4 screenshots,
// each at most 256 KiB; app/ at most 993 files and directories and 16 MiB;
// the dossier text at most 160 KiB.
writeFileSync(
  join(outputDir, "dossier.json"),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
