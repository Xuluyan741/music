import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/db";
import { follows, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import FollowButton from "./follow-button";

export default async function FollowPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const followingIds = await db
    .select({ followingId: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, session.user.id))
    .then((rows) => rows.map((r) => r.followingId));

  const allUsers = await db
    .select({ id: users.id, name: users.name, image: users.image })
    .from(users);

  const list = allUsers.filter((u) => u.id !== session.user.id);

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">发现用户</h1>
        <Link
          href="/dashboard/feed"
          className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
        >
          好友动态
        </Link>
      </div>
      <ul className="space-y-3">
        {list.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              {u.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={u.image}
                  alt=""
                  className="size-10 rounded-full object-cover"
                />
              ) : (
                <div className="size-10 rounded-full bg-muted" />
              )}
              <span className="font-medium">{u.name ?? u.id}</span>
            </div>
            <FollowButton
              userId={u.id}
              initialFollowing={followingIds.includes(u.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
