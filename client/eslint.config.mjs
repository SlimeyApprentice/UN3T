import { defineConfig } from "eslint/config";
import react from "eslint-plugin-react";
import globals from "globals";
import babelParser from "babel-eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends("plugin:react/recommended"),

    plugins: {
        react,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
            React: true,
            document: true,
            window: true,
            localStorage: true,
            fetch: true,
        },

        // parser: babelParser,
    },

    rules: {
        "react/jsx-filename-extension": [1, {
            extensions: ["js", "jsx"],
        }],

        "react/prefer-stateless-function": 0,
        "react/jsx-wrap-multilines": 0,
        "react/prop-types": 0,
        "react/forbid-prop-types": 0,
        "react/jsx-one-expression-per-line": 0,
        "react/destructuring-assignment": 0,
        "babel/no-unused-expressions": 0,
        "import/no-extraneous-dependencies": 0,
        "class-methods-use-this": 0,
        "global-require": 0,

        "max-len": [2, 80, 2, {
            ignoreUrls: true,
            ignoreComments: false,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
        }],

        "object-curly-spacing": 2,
        camelcase: 1,
        "no-underscore-dangle": 0,
        "consistent-return": 0,
        "no-shadow": 0,
        "no-return-assign": 0,
        "new-cap": 0,
        "no-mixed-operators": 0,
    },
}]);