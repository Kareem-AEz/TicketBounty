import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pino", "pino-pretty"],
  reactCompiler: true,
  /* config options here */
  // reactCompiler: true,
};

export default nextConfig;
