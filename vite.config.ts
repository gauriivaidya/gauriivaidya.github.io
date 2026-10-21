import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// User site gauriivaidya.github.io → base "/"
export default defineConfig({ base: "/", plugins: [react()] });
