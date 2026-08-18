import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      host: true,
      allowedHosts: true,
    },
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});



