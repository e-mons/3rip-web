import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['paystack-node', 'got'],
};

export default nextConfig;
