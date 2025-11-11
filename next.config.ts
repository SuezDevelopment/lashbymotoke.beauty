import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/trainings",
        destination: "/academy",
        permanent: true,
      },
      {
        source: "/trainings/:path*",
        destination: "/academy/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
