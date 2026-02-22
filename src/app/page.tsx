import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">音乐聆听追踪</h1>
      <p className="text-muted-foreground text-center">
        追踪你的听歌数据，查看 Top Artists 与 Top Songs
      </p>
      <div className="flex gap-4">
        {session?.user ? (
          <Link
            href="/dashboard"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          >
            进入仪表盘
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          >
            登录
          </Link>
        )}
      </div>
    </div>
  );
}
