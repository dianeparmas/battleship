import { fileURLToPath } from "url";
import { dirname } from "path";

import globals from "globals";
import pluginJs from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

// import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

import eslintPluginPrettier from "eslint-plugin-prettier";

import importPlugin from "eslint-plugin-import";
import typescriptEslintParser from "@typescript-eslint/parser"; // Import the parser

// this is using flat config system

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("ESLint config __dirname:", __dirname); // Log the directory path

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  },
  {
    ignores: ["other_eslint_conf_files"],
  },
  {
    languageOptions: {
      globals: globals.browser,
      parser: typescriptEslintParser, // Set the parser for TypeScript
      parserOptions: {
        // project: "./tsconfig.json", // Path to your tsconfig.json

        // project: "./tsconfig.eslint.json", // Point to your ESLint config
        // project: `${__dirname}/tsconfig.eslint.json`, // Absolute path

        // tsconfigRootDir: "./", // Ensure the root directory is set correctly
        tsconfigRootDir: __dirname, // Set the root directory
        sourceType: "module", // Allow using ES modules
      },
    },
  },
  // below is the 'extends: ..
  //
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  importPlugin.flatConfigs.recommended,
  {
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "@typescript-eslint": typescriptEslint,
      prettier: eslintPluginPrettier, // This is how to add the Prettier plugin
    },
  },
  {
    settings: {
      react: {
        version: "detect", // Automatically picks the React version
      },
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
  },
  {
    rules: {
      // TypeScript ESLint recommended rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-inferrable-types": "warn",
      // "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/consistent-type-definitions": ["warn", "interface"],
      // Add more rules as needed
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "no-unused-vars": [
        "error",
        {
          ignoreRestSiblings: true,
          varsIgnorePattern: "React",
        },
      ],
      "no-param-reassign": "off",
      "react-hooks/exhaustive-deps": "off",
      "no-console": "off",
      camelcase: "off",
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
      "react/react-in-jsx-scope": "off",
      "react/jsx-props-no-spreading": "off",
      "react/require-default-props": "off",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "redux/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "components/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "constants/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "utils/**",
              group: "internal",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always-and-inside-groups",
        },
      ],
      "react/jsx-wrap-multilines": [
        "error",
        {
          declaration: false,
          assignment: false,
        },
      ],
    },
  },
];
