import { fileURLToPath, URL } from "node:url";
import mkcert from "vite-plugin-mkcert";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
import vuetify from "vite-plugin-vuetify";

import { terser } from "rollup-plugin-terser";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    https: true,
  },
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    mkcert(),
    terser({
      compress: {
        unsafe_arrows: true,
        unsafe_comps: true,
        passes: 2,
      },
      format: {
        comments: false,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
