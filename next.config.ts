import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
