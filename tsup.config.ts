import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**/*.ts", "!src/**/__tests__/**"],
  outDir: "build",
  format: ["esm"],
  clean: true,
});
