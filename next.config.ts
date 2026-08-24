import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
};

if (process.env.CAPACITOR === "1") {
  nextConfig.output = "export";
  nextConfig.trailingSlash = true;
}

export default nextConfig;
