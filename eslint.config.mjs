import { defineConfig } from "eslint/config";
import oclif from 'eslint-config-oclif'
import prettier from 'eslint-config-prettier'

export default defineConfig([
    ...oclif,
    prettier,
    {
        rules: {
            "unicorn/prefer-module": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "no-bitwise": "off",
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/no-unused-expressions": "off",
        },
    },
]);
