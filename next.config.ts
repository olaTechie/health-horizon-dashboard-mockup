import type { NextConfig } from "next";

const repo = 'health-horizon-dashboard-mockup';
const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? `/${repo}` : '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  assetPrefix: isProd ? `/${repo}/` : '',
  images: { unoptimized: true },
  trailingSlash: true,
  // Expose basePath to the client bundle so client-side fetches of static
  // assets (topojson, JSON data files) can prepend it. Without this, fetches
  // like `/data/world-110m.json` resolve to the GH Pages domain root and 404.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
