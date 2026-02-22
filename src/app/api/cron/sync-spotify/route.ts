import { NextResponse } from "next/server";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { syncUserSpotifyTop } from "@/lib/spotify-sync";

/**
 * 每日定时同步：为所有已连接 Spotify 的用户拉取 Top 并入库。
 * Vercel Cron 可配置 GET 请求此路由（需校验 CRON_SECRET）。
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const spotifyUsers = await db
    .selectDistinct({ userId: accounts.userId })
    .from(accounts)
    .where(eq(accounts.provider, "spotify"));

  const results: { userId: string; ok: boolean; error?: string }[] = [];
  for (const { userId } of spotifyUsers) {
    const result = await syncUserSpotifyTop(userId);
    results.push({ userId, ok: result.ok, error: result.error });
  }

  return NextResponse.json({ synced: results.length, results });
}
