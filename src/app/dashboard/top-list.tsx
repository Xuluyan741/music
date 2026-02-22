import { db } from "@/db";
import { topArtists, topTracks, syncLogs } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";

const LABELS: Record<string, string> = {
  short_term: "最近 4 周",
  medium_term: "最近 6 个月",
  long_term: "全部时间",
};

export async function TopList({
  userId,
  timeRange = "medium_term",
}: {
  userId: string;
  timeRange?: string;
}) {
  const latest = await db.query.syncLogs.findFirst({
    where: eq(syncLogs.userId, userId),
    columns: { snapshotDate: true },
    orderBy: desc(syncLogs.syncedAt),
  });
  const snapshotDate = latest?.snapshotDate;

  if (!snapshotDate) {
    return (
      <p className="text-sm text-muted-foreground">
        暂无数据，点击「立即同步」从 Spotify 拉取 Top 艺人/歌曲。
      </p>
    );
  }

  const [artists, tracks] = await Promise.all([
    db.query.topArtists.findMany({
      where: and(
        eq(topArtists.userId, userId),
        eq(topArtists.snapshotDate, snapshotDate),
        eq(topArtists.timeRange, timeRange),
      ),
      orderBy: topArtists.rank,
      limit: 10,
    }),
    db.query.topTracks.findMany({
      where: and(
        eq(topTracks.userId, userId),
        eq(topTracks.snapshotDate, snapshotDate),
        eq(topTracks.timeRange, timeRange),
      ),
      orderBy: topTracks.rank,
      limit: 10,
    }),
  ]);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
          Top 艺人 · {LABELS[timeRange] ?? timeRange}
        </h3>
        <ul className="space-y-2">
          {artists.length === 0 ? (
            <li className="text-sm text-muted-foreground">暂无</li>
          ) : (
            artists.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded-lg border bg-card p-2"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded bg-primary/20 text-xs font-medium text-primary">
                  {a.rank}
                </span>
                {a.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.imageUrl}
                    alt=""
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-10 rounded-full bg-muted" />
                )}
                <span className="truncate font-medium">{a.name}</span>
              </li>
            ))
          )}
        </ul>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
          Top 歌曲 · {LABELS[timeRange] ?? timeRange}
        </h3>
        <ul className="space-y-2">
          {tracks.length === 0 ? (
            <li className="text-sm text-muted-foreground">暂无</li>
          ) : (
            tracks.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-lg border bg-card p-2"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded bg-primary/20 text-xs font-medium text-primary">
                  {t.rank}
                </span>
                {t.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.imageUrl}
                    alt=""
                    className="size-10 rounded object-cover"
                  />
                ) : (
                  <div className="size-10 rounded bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{t.name}</p>
                  {t.artistNames && (
                    <p className="truncate text-xs text-muted-foreground">
                      {t.artistNames}
                    </p>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
