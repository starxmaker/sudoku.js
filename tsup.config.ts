import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm", "iife"],
  globalName: "Sudoku",
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  outExtension({ format }) {
    if (format === "iife") return { js: ".global.js" };
    return {};
  },
  esbuildOptions(options) {
    options.footer = {};
  },
});
