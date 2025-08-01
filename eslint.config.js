import playwright from "eslint-plugin-playwright";

export default [
  eslintPluginUnicorn.configs.recommended,
  {
    rules: {
      "unicorn/better-regex": "warn"
    }
  },
  {
    ...playwright.configs["flat/recommended"],
    files: ["tests/**"],
    rules: {
      ...playwright.configs["flat/recommended"].rules
      // Customize Playwright rules
      // ...
    }
  }
];
