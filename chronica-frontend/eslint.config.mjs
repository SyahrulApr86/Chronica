import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Ignore files and directories
  {
    ignores: [
      // Next.js build output
      ".next/",
      "out/",

      // Build outputs
      "dist/",
      "build/",

      // Dependencies
      "node_modules/",

      // Environment files
      ".env*",

      // Generated files
      "*.d.ts",

      // Logs
      "*.log",

      // Cache
      ".cache/",
      ".turbo/",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
