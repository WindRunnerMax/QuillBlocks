import swc from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

const resolve = dir => path.resolve(__dirname, dir);
const core = path.resolve(__dirname, "../core/src");
const delta = path.resolve(__dirname, "../delta/src");
const react = path.resolve(__dirname, "../react/src");
const utils = path.resolve(__dirname, "../utils/src");

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve("./example"),
  plugins: [swc()],
  resolve: {
    alias: {
      "block-kit-utils/dist/es": utils,
      "block-kit-core": core,
      "block-kit-delta": delta,
      "block-kit-react": react,
      "block-kit-utils": utils,
    },
  },
});
