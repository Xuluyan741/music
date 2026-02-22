import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import crypto from "crypto";

const SPOTIFY_SCOPES =
  "user-read-private user-read-email user-top-read user-read-recently-played";

/**
 * 已登录用户点击「连接 Spotify」时调用。
 * 重定向到 Spotify 授权页，state 中携带当前用户 id（签名防篡改）。
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.NEXTAUTH_SECRET;
  // 用请求的 Host 拼 redirect_uri，与浏览器地址栏一致，避免 Spotify 返回 400
  const host = request.headers.get("host") ?? new URL(request.url).host;
  const proto = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
  const redirectUri = `${proto}://${host}/api/spotify/callback`;

  if (!clientId || !secret) {
    const dashboardUrl = new URL("/dashboard", request.url);
    dashboardUrl.searchParams.set("spotify_error", "server_config");
    return NextResponse.redirect(dashboardUrl);
  }

  const userId = session.user.id;
  const nonce = crypto.randomBytes(16).toString("hex");
  const statePayload = `${userId}.${nonce}`;
  const state = `${statePayload}.${crypto.createHmac("sha256", secret).update(statePayload).digest("hex")}`;

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES,
    state,
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}
