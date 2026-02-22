"use client";

import { signIn } from "next-auth/react";

export default function LoginForm() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
    >
      使用 Google 登录
    </button>
  );
}
