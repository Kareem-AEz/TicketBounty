import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  /* config options here */
  // reactCompiler: true,

  rewrites: async () => {
    return [
      {
        source: "/spaghetti/um",
        destination: "https://cloud.umami.is/script.js",
      },
    ];
  },
};

export default nextConfig;
