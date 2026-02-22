import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

/**
 * 调试用：查看 NEXTAUTH 环境与 session 状态（不泄露密钥）。
 * 登录失败时打开 /api/debug-auth 可帮助排查。
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const hasNextAuthUrl = !!process.env.NEXTAUTH_URL;
  const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
  const urlValue = process.env.NEXTAUTH_URL ?? "";

  return NextResponse.json(
    {
      hasSession: !!session?.user,
      userId: session?.user?.id ?? null,
      hasNextAuthUrl,
      hasNextAuthSecret,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nextAuthUrlOk: hasNextAuthUrl && urlValue.startsWith("https://") && !urlValue.endsWith("/"),
      hint: !hasNextAuthSecret
        ? "NEXTAUTH_SECRET 未设置，请在 Vercel 环境变量中添加"
        : !hasNextAuthUrl
          ? "NEXTAUTH_URL 未设置，请设为 https://你的域名.vercel.app"
          : urlValue.endsWith("/")
            ? "NEXTAUTH_URL 不要以 / 结尾"
            : !process.env.DATABASE_URL
              ? "DATABASE_URL 未设置，登录需数据库存储用户"
              : !session?.user
                ? "当前无登录 session；若刚点过 Google 登录，请确认 Google 控制台重定向 URI 与 NEXTAUTH_URL 一致"
                : "环境正常，已登录",
    },
    { status: 200 }
  );
}
