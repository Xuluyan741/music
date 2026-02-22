import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 用 127.0.0.1 打开时避免跨源警告（与 localhost 视为同源）
  allowedDevOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"],
};

export default nextConfig;
