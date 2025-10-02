import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/supervision",
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/calls",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
