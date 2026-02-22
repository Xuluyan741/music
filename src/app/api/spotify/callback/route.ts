import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { accounts } from "@/db/schema";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

/**
 * Spotify 授权后回调。用 code 换 token，并把 account 写入当前用户。
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const dashboardUrl = `${origin}/dashboard`;

  if (error) {
    return NextResponse.redirect(
      `${dashboardUrl}?spotify_error=${encodeURIComponent(error)}`,
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${dashboardUrl}?spotify_error=missing_code_or_state`,
    );
  }

  const secret = process.env.NEXTAUTH_SECRET;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  // 必须和发起授权时用的 redirect_uri 完全一致（用 Host 拼，与 connect 一致）
  const host = request.headers.get("host") ?? new URL(request.url).host;
  const proto = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
  const redirectUri = `${proto}://${host}/api/spotify/callback`;

  if (!secret || !clientId || !clientSecret) {
    return NextResponse.redirect(
      `${dashboardUrl}?spotify_error=server_config`,
    );
  }

  const parts = state.split(".");
  if (parts.length !== 3) {
    return NextResponse.redirect(
      `${dashboardUrl}?spotify_error=invalid_state`,
    );
  }

  const [userId, , sig] = parts;
  const payload = `${userId}.${parts[1]}`;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  if (expectedSig !== sig) {
    return NextResponse.redirect(
      `${dashboardUrl}?spotify_error=invalid_state`,
    );
  }

  const tokenRes = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      `${dashboardUrl}?spotify_error=token_failed`,
    );
  }

  const tokenData = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type?: string;
    scope?: string;
  };

  const spotifyUserRes = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!spotifyUserRes.ok) {
    const status = spotifyUserRes.status;
    const params = new URLSearchParams({ spotify_error: "user_failed", user_failed_status: String(status) });
    return NextResponse.redirect(`${dashboardUrl}?${params.toString()}`);
  }

  const spotifyUser = (await spotifyUserRes.json()) as { id: string };
  const expiresAt = tokenData.expires_in
    ? Math.floor(Date.now() / 1000) + tokenData.expires_in
    : null;

  await db
    .insert(accounts)
    .values({
      userId,
      type: "oauth",
      provider: "spotify",
      providerAccountId: spotifyUser.id,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? null,
      expires_at: expiresAt,
      token_type: tokenData.token_type ?? "Bearer",
      scope: tokenData.scope ?? null,
    })
    .onConflictDoUpdate({
      target: [accounts.provider, accounts.providerAccountId],
      set: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token ?? undefined,
        expires_at: expiresAt,
        token_type: tokenData.token_type ?? undefined,
        scope: tokenData.scope ?? undefined,
      },
    });

  return NextResponse.redirect(dashboardUrl);
}
