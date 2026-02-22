import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import SpotifySection from "../spotify-section";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const hasSpotify = session.user.hasSpotify ?? false;

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">设置</h1>
        <Link
          href="/dashboard"
          className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
        >
          返回仪表盘
        </Link>
      </div>
      <div className="max-w-md space-y-6">
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium text-muted-foreground">账号</p>
          <p className="font-medium">{session.user.name ?? session.user.email}</p>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
        </div>
        <SpotifySection hasSpotify={hasSpotify} />
      </div>
    </div>
  );
}
