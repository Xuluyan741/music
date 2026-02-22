import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { syncUserSpotifyTop } from "@/lib/spotify-sync";

/** 已登录用户手动触发一次同步 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncUserSpotifyTop(session.user.id);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "sync_failed" },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true });
}
