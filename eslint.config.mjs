import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import jsdoc from 'eslint-plugin-jsdoc';


export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];

// extends eslint-plugin-jsdoc's recommended config
const jsdocConfigs = [jsdoc.configs["flat/recommended"], {
  name: "eslint-config-eslint/jsdoc",
  settings: {
      jsdoc: {
          mode: "typescript",
          tagNamePreference: {
              file: "fileoverview",
              augments: "extends",
              class: "constructor"
          },
          preferredTypes: {
              "*": {
                  message: "Use a more precise type or if necessary use `any` or `ArbitraryCallbackResult`",
                  replacement: "any"
              },
              Any: {
                  message: "Use a more precise type or if necessary use `any` or `ArbitraryCallbackResult`",
                  replacement: "any"
              },
              function: {
                  message: "Point to a `@callback` namepath or `Function` if truly arbitrary in form",
                  replacement: "Function"
              },
              Promise: {
                  message: "Specify the specific Promise type, including, if necessary, the type `any`"
              },
              ".<>": {
                  message: "Prefer type form without dot",
                  replacement: "<>"
              },
              object: {
                  message: "Use the specific object type or `Object` if truly arbitrary",
                  replacement: "Object"
              },
              array: "Array"
          }
      }
  },
  rules: {
      "jsdoc/check-syntax": "error",
      "jsdoc/check-values": ["error", { allowedLicenses: true }],
      "jsdoc/no-bad-blocks": "error",
      "jsdoc/no-defaults": "off",
      "jsdoc/require-asterisk-prefix": "error",
      "jsdoc/require-description": ["error", { checkConstructors: false }],
      "jsdoc/require-hyphen-before-param-description": ["error", "never"],
      "jsdoc/require-returns": ["error",
          {
              forceRequireReturn: true,
              forceReturnsWithAsync: true
          }
      ],
      "jsdoc/require-throws": "error",
      "jsdoc/tag-lines": ["error", "never",
          {
              tags: {
                  example: { lines: "always" },
                  fileoverview: { lines: "any" }
              },
              startLines: 0
          }
      ],
      "jsdoc/no-undefined-types": "off",
      "jsdoc/require-yields": "off",
      "jsdoc/check-access": "error",
      "jsdoc/check-alignment": "error",
      "jsdoc/check-param-names": "error",
      "jsdoc/check-property-names": "error",
      "jsdoc/check-tag-names": "error",
      "jsdoc/check-types": "error",
      "jsdoc/empty-tags": "error",
      "jsdoc/implements-on-classes": "error",
      "jsdoc/multiline-blocks": "error",
      "jsdoc/no-multi-asterisks": ["error", { allowWhitespace: true }],
      "jsdoc/require-jsdoc": ["error", { require: { ClassDeclaration: true } }],
      "jsdoc/require-param": "error",
      "jsdoc/require-param-description": "error",
      "jsdoc/require-param-name": "error",
      "jsdoc/require-param-type": "error",
      "jsdoc/require-property": "error",
      "jsdoc/require-property-description": "error",
      "jsdoc/require-property-name": "error",
      "jsdoc/require-property-type": "error",
      "jsdoc/require-returns-check": "error",
      "jsdoc/require-returns-description": "error",
      "jsdoc/require-returns-type": "error",
      "jsdoc/require-yields-check": "error",
      "jsdoc/valid-types": "error"
  }
}];

module.exports = [
  { name: "eslint-config-eslint/base", linterOptions: { reportUnusedDisableDirectives: "error" } },
  ...jsdocConfigs
]