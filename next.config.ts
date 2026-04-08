import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

// Parent + app lockfiles make Turbopack use the parent folder as root; then
// globals.css `@import "tailwindcss"` resolves there (no node_modules).
const turbopackRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: turbopackRoot,
  },
};

export default nextConfig;
