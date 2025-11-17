import { defineConfig } from "vite";
import compileTime from "vite-plugin-compile-time";

export default defineConfig({
  base: "/hb-index/",
  plugins: [compileTime()],
});
