import { defineConfig } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import base from "./base.js";

/** For shared React packages such as packages/ui. */
export default defineConfig([
  ...base,
  reactHooks.configs.flat.recommended,
  { languageOptions: { globals: { ...globals.browser } } },
]);
