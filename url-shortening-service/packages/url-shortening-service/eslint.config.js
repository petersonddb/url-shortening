import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import {globalIgnores} from "eslint/config";

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ["**/*.{ts,mts,cts}"],
    plugins: {js},
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked
    ],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      }
    }
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: {js},
    extends: [js.configs.recommended],
    languageOptions: {globals: globals.node}
  },
]);
