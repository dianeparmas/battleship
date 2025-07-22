import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";

export default tseslint.config(
  { ignores: ["dist"] },
  // eslintPluginPrettierRecommended,
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      importPlugin.flatConfigs.recommended,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      react,
    },
    rules: {
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
);
