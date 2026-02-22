"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface SpotifySectionProps {
  hasSpotify: boolean;
}

export default function SpotifySection({ hasSpotify }: SpotifySectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const busy = isPending || loading;

  const handleConnect = () => {
    setLoading(true);
    // 使用自定义「连接 Spotify」流程，保证关联到当前已登录用户
    window.location.href = "/api/spotify/connect";
  };

  const handleDisconnect = () => {
    setLoading(true);
    startTransition(async () => {
      try {
        await fetch("/api/spotify/disconnect", {
          method: "POST",
        });
        router.refresh();
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Spotify 连接</p>
          <p className="text-xs text-muted-foreground">
            连接后将定期同步你的听歌记录和 Top Artists / Songs。
          </p>
        </div>
        {hasSpotify ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
            已连接
          </span>
        ) : (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
            未连接
          </span>
        )}
      </div>
      <div className="mt-4 flex gap-3">
        {hasSpotify ? (
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={busy}
            className="rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            断开 Spotify
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConnect}
            disabled={busy}
            className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            连接 Spotify
          </button>
        )}
      </div>
    </div>
  );
}

