"use client";

import Link from "next/link";
import { BackgroundCircles } from "@/components/ui/background-circles";

export function HomeHero() {
  return (
    <BackgroundCircles
      title="音乐聆听追踪"
      description="追踪你的听歌数据，查看 Top Artists 与 Top Songs"
      variant="primary"
      actions={
        <Link
          href="/login"
          className="inline-flex rounded-md bg-primary px-5 py-2.5 text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          使用 Google 登录
        </Link>
      }
    />
  );
}
