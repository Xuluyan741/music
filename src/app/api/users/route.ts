import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/db";
import { users, follows } from "@/db/schema";
import { eq, notInArray } from "drizzle-orm";

/** GET: 列出可关注的用户（排除自己和已关注的） */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const followingIds = await db
    .select({ followingId: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, session.user.id))
    .then((rows) => rows.map((r) => r.followingId));

  const exclude = [session.user.id, ...followingIds];
  const list = await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
    })
    .from(users)
    .where(notInArray(users.id, exclude))
    .limit(50);

  return NextResponse.json({ users: list });
}
