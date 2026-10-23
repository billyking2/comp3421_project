import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";


export default [
  {
    ignores: ["dist/**"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs["flat/recommended"],

  eslintConfigPrettier,
  
];
