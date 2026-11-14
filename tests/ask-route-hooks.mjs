// Resolver hooks so plain `node --test` can load app/api/ask/route.ts and the lib/exa modules it imports:
// "server-only" becomes an empty module, "next/server" a small stub, "@/x" the repo path, extensionless
// relative imports get ".ts", and JSON imports become ES modules. Node 24 strips the TypeScript types.
import { readFileSync, statSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = new URL("../", import.meta.url);
const stub = new URL("./ask-route-next-server.mjs", import.meta.url).href;

function withExtension(url) {
  const path = fileURLToPath(url);
  for (const candidate of [path, `${path}.ts`, `${path}.tsx`, `${path}/index.ts`]) {
    if (statSync(candidate, { throwIfNoEntry: false })?.isFile()) return pathToFileURL(candidate).href;
  }
  return url;
}

registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "server-only") return { url: "data:text/javascript,", shortCircuit: true };
    if (specifier === "next/server") return { url: stub, shortCircuit: true };
    if (specifier.startsWith("@/")) return { url: withExtension(new URL(specifier.slice(2), root).href), shortCircuit: true };
    if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
      return { url: withExtension(new URL(specifier, context.parentURL).href), shortCircuit: true };
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith("file:") && url.endsWith(".json")) {
      return { format: "module", source: `export default ${readFileSync(fileURLToPath(url), "utf8")};`, shortCircuit: true };
    }
    return next(url, context);
  },
});
