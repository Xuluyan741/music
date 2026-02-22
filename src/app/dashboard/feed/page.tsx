import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/db";
import { follows, users, topArtists, topTracks, syncLogs } from "@/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const followingList = await db
    .select({ followingId: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, session.user.id));

  const followingIds = followingList.map((r) => r.followingId);
  if (followingIds.length === 0) {
    return (
      <div className="flex min-h-screen flex-col gap-6 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">好友动态</h1>
          <Link
            href="/dashboard/follow"
            className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
          >
            去关注
          </Link>
        </div>
        <p className="text-muted-foreground">暂无关注，先去关注一些人吧。</p>
      </div>
    );
  }

  const latestSyncs = await db
    .select({ userId: syncLogs.userId, snapshotDate: syncLogs.snapshotDate })
    .from(syncLogs)
    .where(inArray(syncLogs.userId, followingIds))
    .orderBy(desc(syncLogs.syncedAt));

  const userSnapshots = new Map<string, string>();
  for (const row of latestSyncs) {
    if (!userSnapshots.has(row.userId)) userSnapshots.set(row.userId, row.snapshotDate);
  }

  const userRows = await db
    .select({ id: users.id, name: users.name, image: users.image })
    .from(users)
    .where(inArray(users.id, followingIds));

  const feed: Array<{
    user: { id: string; name: string | null; image: string | null };
    artists: { name: string; rank: number }[];
    tracks: { name: string; artistNames: string | null; rank: number }[];
  }> = [];

  for (const user of userRows) {
    const snapshotDate = userSnapshots.get(user.id);
    if (!snapshotDate) {
      feed.push({ user, artists: [], tracks: [] });
      continue;
    }
    const [artists, tracks] = await Promise.all([
      db.query.topArtists.findMany({
        where: and(
          eq(topArtists.userId, user.id),
          eq(topArtists.snapshotDate, snapshotDate),
          eq(topArtists.timeRange, "medium_term"),
        ),
        orderBy: topArtists.rank,
        limit: 5,
      }),
      db.query.topTracks.findMany({
        where: and(
          eq(topTracks.userId, user.id),
          eq(topTracks.snapshotDate, snapshotDate),
          eq(topTracks.timeRange, "medium_term"),
        ),
        orderBy: topTracks.rank,
        limit: 5,
      }),
    ]);
    feed.push({
      user,
      artists: artists.map((a) => ({ name: a.name, rank: a.rank })),
      tracks: tracks.map((t) => ({ name: t.name, artistNames: t.artistNames, rank: t.rank })),
    });
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">好友动态</h1>
        <Link
          href="/dashboard/follow"
          className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
        >
          管理关注
        </Link>
      </div>
      <div className="space-y-6">
        {feed.map(({ user, artists, tracks }) => (
          <div key={user.id} className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-3">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt=""
                  className="size-10 rounded-full object-cover"
                />
              ) : (
                <div className="size-10 rounded-full bg-muted" />
              )}
              <span className="font-medium">{user.name ?? user.id}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Top 艺人</p>
                <ul className="text-sm">
                  {artists.length === 0
                    ? "暂无"
                    : artists.map((a) => (
                        <li key={a.rank}>
                          {a.rank}. {a.name}
                        </li>
                      ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Top 歌曲</p>
                <ul className="text-sm">
                  {tracks.length === 0
                    ? "暂无"
                    : tracks.map((t) => (
                        <li key={t.rank}>
                          {t.rank}. {t.name}
                          {t.artistNames ? ` · ${t.artistNames}` : ""}
                        </li>
                      ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
