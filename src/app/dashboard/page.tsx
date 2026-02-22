import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import LogoutButton from "./logout-button";
import SpotifySection from "./spotify-section";
import { TopList } from "./top-list";
import SyncButton from "./sync-button";

const SPOTIFY_ERROR_MESSAGES: Record<string, string> = {
  missing_code_or_state: "Spotify 未返回授权码，请重试。",
  invalid_state: "安全校验失败，请重新点击「连接 Spotify」。",
  server_config: "服务未配置 SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET 等环境变量。",
  token_failed: "获取 Spotify 令牌失败，请检查 Client ID/Secret 与 Redirect URI 是否与 Spotify 后台完全一致。",
  user_failed: "获取 Spotify 用户信息失败。",
};

const USER_FAILED_HINTS: Record<string, string> = {
  "401": "Token 无效或已过期，请先「断开 Spotify」再重新「连接 Spotify」。",
  "403": "权限不足，请在 Spotify 应用设置中确认已勾选「查看你的 Spotify 账号数据」等权限。",
  "429": "请求过于频繁，请稍后再试。",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ spotify_error?: string; user_failed_status?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const hasSpotify = session.user.hasSpotify ?? false;
  const params = await searchParams;
  const spotifyError = params.spotify_error;
  const userFailedStatus = params.user_failed_status;
  let spotifyErrorMsg =
    spotifyError && (SPOTIFY_ERROR_MESSAGES[spotifyError] ?? spotifyError);
  if (spotifyError === "user_failed" && userFailedStatus) {
    const hint = USER_FAILED_HINTS[userFailedStatus];
    spotifyErrorMsg = hint
      ? `获取 Spotify 用户信息失败（HTTP ${userFailedStatus}）。${hint}`
      : `获取 Spotify 用户信息失败（HTTP ${userFailedStatus}）。请先「断开 Spotify」再重新「连接 Spotify」试一次。`;
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">仪表盘</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/feed"
            className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
          >
            好友动态
          </Link>
          <Link
            href="/dashboard/follow"
            className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
          >
            发现用户
          </Link>
          <Link
            href="/dashboard/settings"
            className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
          >
            设置
          </Link>
          <LogoutButton />
        </div>
      </div>
      {spotifyErrorMsg && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          Spotify 连接失败：{spotifyErrorMsg}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-[2fr,1.5fr]">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">登录用户</p>
          <p className="font-medium">
            {session.user.name ?? session.user.email}
          </p>
          {session.user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt=""
              className="mt-2 size-12 rounded-full"
            />
          )}
        </div>
        <SpotifySection hasSpotify={hasSpotify} />
      </div>
      {hasSpotify && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">听歌统计</h2>
            <SyncButton />
          </div>
          <TopList userId={session.user.id} timeRange="medium_term" />
        </div>
      )}
    </div>
  );
}
