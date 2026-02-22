import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/db";
import { follows } from "@/db/schema";
import { and, eq } from "drizzle-orm";

/** POST: 关注 userId（followingId） */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const followingId = body.userId ?? body.followingId;
  if (!followingId || typeof followingId !== "string") {
    return NextResponse.json({ error: "missing userId" }, { status: 400 });
  }
  if (followingId === session.user.id) {
    return NextResponse.json({ error: "cannot follow self" }, { status: 400 });
  }

  try {
    await db.insert(follows).values({
      followerId: session.user.id,
      followingId,
    });
  } catch (e: unknown) {
    // 已关注过则忽略
    const msg = e instanceof Error ? e.message : "";
    if (!msg.includes("unique") && !msg.includes("Unique")) throw e;
  }
  return NextResponse.json({ ok: true });
}

/** DELETE: 取关 userId（followingId） */
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const followingId = searchParams.get("userId");
  if (!followingId) {
    return NextResponse.json({ error: "missing userId" }, { status: 400 });
  }

  await db
    .delete(follows)
    .where(
      and(
        eq(follows.followerId, session.user.id),
        eq(follows.followingId, followingId),
      ),
    );

  return NextResponse.json({ ok: true });
}
