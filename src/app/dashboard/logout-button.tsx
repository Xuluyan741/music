"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
    >
      退出登录
    </button>
  );
}
