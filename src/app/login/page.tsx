import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import LoginForm from "./login-form";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "服务配置错误，请检查 NEXTAUTH_URL、NEXTAUTH_SECRET 及 Google OAuth 配置。",
  AccessDenied: "拒绝访问。",
  Verification: "验证失败，链接可能已过期。",
  OAuthCallback: "OAuth 回调失败，请确认 Google 控制台重定向 URI 为：https://你的域名/api/auth/callback/google",
  Default: "登录出错，请重试。",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/dashboard");
  }
  const params = await searchParams;
  const errorMsg = params.error ? (ERROR_MESSAGES[params.error] ?? params.error) : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">音乐聆听追踪</h1>
      <p className="text-muted-foreground">使用 Google 账号登录，支持新用户注册</p>
      {errorMsg && (
        <p className="rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive" role="alert">
          {errorMsg}
        </p>
      )}
      <LoginForm />
    </div>
  );
}
