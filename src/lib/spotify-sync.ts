import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, topArtists, topTracks, syncLogs } from "@/db/schema";

const SPOTIFY_TOP = "https://api.spotify.com/v1/me/top";
const TIME_RANGES = [
  "short_term",
  "medium_term",
  "long_term",
] as const;

export type SpotifyTopArtistItem = {
  id: string;
  name: string;
  images?: Array<{ url: string }>;
};

export type SpotifyTopTrackItem = {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album?: { images?: Array<{ url: string }> };
};

/**
 * 将 Spotify API 的 top artists 响应转为可写入 DB 的行（用于单元测试与同步逻辑）
 */
export function mapTopArtistsToRows(
  userId: string,
  snapshotDate: string,
  timeRange: string,
  items: SpotifyTopArtistItem[],
) {
  return items.slice(0, 20).map((item, index) => ({
    userId,
    snapshotDate,
    timeRange,
    rank: index + 1,
    spotifyId: item.id,
    name: item.name,
    imageUrl: item.images?.[0]?.url ?? null,
  }));
}

/**
 * 将 Spotify API 的 top tracks 响应转为可写入 DB 的行
 */
export function mapTopTracksToRows(
  userId: string,
  snapshotDate: string,
  timeRange: string,
  items: SpotifyTopTrackItem[],
) {
  return items.slice(0, 20).map((item, index) => ({
    userId,
    snapshotDate,
    timeRange,
    rank: index + 1,
    spotifyId: item.id,
    name: item.name,
    artistNames: item.artists.map((a) => a.name).join(", "),
    imageUrl: item.album?.images?.[0]?.url ?? null,
  }));
}

async function getSpotifyToken(userId: string): Promise<string | null> {
  const row = await db.query.accounts.findFirst({
    where: and(
      eq(accounts.userId, userId),
      eq(accounts.provider, "spotify"),
    ),
    columns: { access_token: true, refresh_token: true, expires_at: true },
  });
  if (!row?.access_token) return null;
  // 简单判断：若已过期则尝试刷新（此处可后续接入 refresh 逻辑）
  if (row.expires_at && row.expires_at < Math.floor(Date.now() / 1000)) {
    if (!row.refresh_token) return null;
    // TODO: 调用 Spotify token 刷新接口后更新 DB 并返回新 access_token
    return row.access_token;
  }
  return row.access_token;
}

export async function syncUserSpotifyTop(userId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const token = await getSpotifyToken(userId);
  if (!token) return { ok: false, error: "no_spotify_token" };

  const snapshotDate = new Date().toISOString().slice(0, 10);

  try {
    for (const timeRange of TIME_RANGES) {
      await db
        .delete(topArtists)
        .where(
          and(
            eq(topArtists.userId, userId),
            eq(topArtists.snapshotDate, snapshotDate),
            eq(topArtists.timeRange, timeRange),
          ),
        );
      await db
        .delete(topTracks)
        .where(
          and(
            eq(topTracks.userId, userId),
            eq(topTracks.snapshotDate, snapshotDate),
            eq(topTracks.timeRange, timeRange),
          ),
        );

      const [artistsRes, tracksRes] = await Promise.all([
        fetch(`${SPOTIFY_TOP}/artists?time_range=${timeRange}&limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${SPOTIFY_TOP}/tracks?time_range=${timeRange}&limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (artistsRes.ok) {
        const data = (await artistsRes.json()) as { items: SpotifyTopArtistItem[] };
        const rows = mapTopArtistsToRows(userId, snapshotDate, timeRange, data.items ?? []);
        if (rows.length) await db.insert(topArtists).values(rows);
      }
      if (tracksRes.ok) {
        const data = (await tracksRes.json()) as { items: SpotifyTopTrackItem[] };
        const rows = mapTopTracksToRows(userId, snapshotDate, timeRange, data.items ?? []);
        if (rows.length) await db.insert(topTracks).values(rows);
      }
    }

    await db.insert(syncLogs).values({
      userId,
      snapshotDate,
    });

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "sync_failed",
    };
  }
}