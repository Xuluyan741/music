import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import LoginForm from "./login-form";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "服务配置错误，请检查 NEXTAUTH_URL、NEXTAUTH_SECRET 及 Google OAuth 配置。",
  AccessDenied: "拒绝访问。",
  Verification: "验证失败，链接可能已过期。",
  OAuthCallback: "OAuth 回调失败，请见下方应填写的重定向 URI。",
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
  const errorCode = params.error;
  const errorMsg = errorCode ? (ERROR_MESSAGES[errorCode] ?? errorCode) : null;
  const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "";
  const callbackUrl = baseUrl ? `${baseUrl}/api/auth/callback/google` : "";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">音乐聆听追踪</h1>
      <p className="text-muted-foreground">使用 Google 账号登录，支持新用户注册</p>
      {errorMsg && (
        <div className="rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive space-y-2" role="alert">
          <p>{errorMsg}</p>
          {errorCode === "OAuthCallback" && callbackUrl && (
            <p className="mt-2 break-all font-mono text-xs">
              Google 控制台「已授权的重定向 URI」中必须有一条<strong>完全一致</strong>（不能多空格、不能多结尾 /）：
              <br />
              <span className="mt-1 block rounded bg-black/10 p-2">{callbackUrl}</span>
            </p>
          )}
        </div>
      )}
      <LoginForm />
      <a
        href="/api/debug-auth"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 text-xs text-muted-foreground underline hover:text-foreground"
      >
        登录异常？点此查看环境与 session 状态
      </a>
    </div>
  );
}
