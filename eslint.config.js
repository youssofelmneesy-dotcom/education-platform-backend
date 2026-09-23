import eslintConfigPrettier from "eslint-config-prettier";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts"],

    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },

    rules: {
      "no-console": "warn",

      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  {
  ignores: [
    "**/dist/**",
    "**/node_modules/**",
    "**/coverage/**",
    "prisma.config.*",
  ],
},
  eslintConfigPrettier,
];
