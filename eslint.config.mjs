import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Standalone Node scripts for the pitch video (CommonJS, not app code).
    "docs/pitch/video-build/**",
    // Agent worktrees and local output, not app code.
    ".claude/**",
    "brag-output/**",
  ]),
]);

export default eslintConfig;
