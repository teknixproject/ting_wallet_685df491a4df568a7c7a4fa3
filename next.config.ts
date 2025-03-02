import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|png)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=9999999999, must-revalidate",
          },
        ],
      },
    ];
  },
  webpack(config, { dev }) {
    if (dev) {
      config.cache = false; // Tắt cache trong chế độ phát triển
      config.optimization = {
        ...config.optimization,
        runtimeChunk: false, // Tránh lỗi runtime không đồng bộ
      };
    }
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    styledComponents: true, // Kích hoạt styled-components cho Next.js
  },
};

export default nextConfig;
