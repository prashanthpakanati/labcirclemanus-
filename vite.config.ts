import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["4173-ifqrpacm5s7lrhro0y8kc-315bbaef.sg2.manus.computer"],
  },
  test: {
    environment: "jsdom",
    globals: true,
    clearMocks: true,
  },
});
