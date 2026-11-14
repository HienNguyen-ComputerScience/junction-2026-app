// Lets plain `node` import lib/exa/config.ts for tests, with no extra dependencies:
//  - "server-only" (throws outside a React Server bundle) becomes an empty module;
//  - "@/..." resolves from the repo root, like the tsconfig path alias;
//  - repo JSON files load as `export default <json>` (config.ts imports them without `with { type: "json" }`).
// Import this module first, then import config.ts dynamically.

import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);

registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "server-only") return { url: "data:text/javascript,export {};", shortCircuit: true };
    if (specifier.startsWith("@/")) return next(new URL(specifier.slice(2), root).href, context);
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith(root.href) && url.endsWith(".json")) {
      const json = readFileSync(fileURLToPath(url), "utf8");
      return { format: "module", source: `export default ${json};`, shortCircuit: true };
    }
    return next(url, context);
  },
});
