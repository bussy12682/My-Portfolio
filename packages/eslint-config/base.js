import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

/** Shared rules for every TypeScript package in the monorepo. */
export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  globalIgnores(["**/dist/**", "**/.next/**", "**/out/**", "**/build/**", "**/.turbo/**"]),
]);
