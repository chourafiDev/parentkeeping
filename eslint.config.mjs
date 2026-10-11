import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Vendored from tablecn (https://tablecn.com). It intentionally uses the
  // "latest ref" pattern, which React Compiler's refs rule flags. Kept as-is
  // so the files can be updated from the registry.
  {
    files: [
      "src/components/data-table/**",
      "src/components/ui/faceted.tsx",
      "src/hooks/use-data-table.ts",
      "src/hooks/use-debounced-callback.ts",
      "src/lib/data-table-*.ts",
    ],
    rules: {
      "react-hooks/refs": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
