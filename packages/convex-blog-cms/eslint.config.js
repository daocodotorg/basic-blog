import convexEslint from "@convex-dev/eslint-plugin";
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

// Mirrors @convex-dev/eslint-plugin recommended (upstream default targets convex/ tree).
const convexRecommendedRules = {
  "@convex-dev/import-wrong-runtime": "off",
  "@convex-dev/no-old-registered-function-syntax": "error",
  "@convex-dev/require-args-validator": "error",
  "@convex-dev/explicit-table-ids": "error",
};

export default [
  {
    ignores: [
      "dist/**",
      "*.config.{js,mjs,cjs,ts,tsx}",
      "admin-spa/**/*.config.{js,mjs,cjs,ts,tsx}",
      "**/_generated/",
      "initTemplate.mjs",
    ],
  },
  {
    files: [
      "src/**/*.{js,mjs,cjs,ts,tsx}",
      "admin-spa/**/*.{js,mjs,cjs,ts,tsx}",
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.json", "./admin-spa/tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  // Node CLI
  {
    files: ["bin/**/*.mjs", "scripts/**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: globals.node,
    },
  },
  // Convex code - Worker environment
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.worker,
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
    },
  },
  // Convex component implementation (same rules as plugin default for `convex/**`)
  {
    files: ["src/component/**/*.ts"],
    ignores: ["**/src/component/_generated/**"],
    plugins: {
      "@convex-dev": convexEslint,
    },
    rules: convexRecommendedRules,
  },
  // React app code - Browser environment
  {
    files: ["admin-spa/src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
          allowExportNames: ["useAdminConfig", "useWrapAdminKey", "buttonVariants"],
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
];
