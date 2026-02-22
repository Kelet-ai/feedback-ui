import { resolve } from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      insertTypesEntry: true,
      entryRoot: "src",
      tsconfigPath: "./tsconfig.build.json",
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@kelet-ai/feedback-ui": resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "@kelet-ai/feedback-ui",
      formats: ["es", "umd"],
      fileName: (format) => {
        const isDev = mode === "development"
        const suffix = isDev ? "" : ".min"
        return `feedback-ui.${format}${suffix}.js`
      },
    },
    minify: mode !== "development",
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        sourcemapExcludeSources: false, // Include source content for OSS
      },
    },
  },
}))
