import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@features":   path.resolve(__dirname, "src/features"),
      "@components": path.resolve(__dirname, "src/components"),
      "@constants":  path.resolve(__dirname, "src/constants"),
      "@app":        path.resolve(__dirname, "src/app"),
      "@theme":      path.resolve(__dirname, "src/theme"),
      "@assets":     path.resolve(__dirname, "src/assets"),
      "@services":   path.resolve(__dirname, "src/services"),  // ← ajouté
      "@hooks":      path.resolve(__dirname, "src/hooks"),     // ← ajouté
    },
  },
});