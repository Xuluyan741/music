"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FollowButton({
  userId,
  initialFollowing,
}: {
  userId: string;
  initialFollowing: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      if (following) {
        await fetch(`/api/follow?userId=${encodeURIComponent(userId)}`, {
          method: "DELETE",
        });
        setFollowing(false);
      } else {
        await fetch("/api/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        setFollowing(true);
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={
        following
          ? "rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          : "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
      }
    >
      {following ? "已关注" : "关注"}
    </button>
  );
}
