
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// 显式加载根目录的 .env
dotenv.config({ path: ".env" });

export default defineConfig({
  schema: "./src/db/schema.ts", // 检查这个路径是否正确
  out: "./drizzle",
  dialect: "postgresql", // 注意：新版用 dialect 代替 driver
  dbCredentials: {
    url: process.env.DATABASE_URL!, // 确保变量名和 .env 里一模一样
  },
});