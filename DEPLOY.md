# 部署说明（Phase 7）

部署后即可获得**公网可访问的链接**，**任何人**都可用 Google 账号注册/登录使用（无邮箱白名单限制）。

## GitHub

- 在 GitHub 创建仓库，将本地项目 push 上去。
- 提交前请运行：`pnpm lint`、`pnpm test`、`pnpm test:e2e`（E2E 需无其他服务占用 3000 端口）。

## Vercel（获得「别人也能访问、能注册」的链接）

1. 在 [Vercel](https://vercel.com) 导入该 GitHub 仓库，部署后得到域名，例如 `https://你的项目.vercel.app`。
2. 在项目 **Settings → Environment Variables** 中配置：
   - `DATABASE_URL`（生产 Postgres，如 Vercel Postgres / Neon / Supabase）
   - `NEXTAUTH_URL` = **你的生产域名**，例如 `https://你的项目.vercel.app`（必须与最终访问地址一致）
   - `NEXTAUTH_SECRET`（随机字符串，如 `openssl rand -base64 32` 生成）
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   - `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`
   - `CRON_SECRET`（随机字符串，用于 Cron 鉴权）
3. **Google 登录要在生产环境可用**：在 [Google Cloud Console](https://console.cloud.google.com/) → 你的项目 → APIs & Services → Credentials → 你的 OAuth 2.0 客户端 ID → **已授权的重定向 URI** 中添加：  
   `https://你的项目.vercel.app/api/auth/callback/google`
4. **Spotify 回调**：在 Spotify Dashboard 的 Redirect URIs 中添加：  
   `https://你的项目.vercel.app/api/spotify/callback`
5. 部署后执行一次数据库迁移：本地执行 `pnpm db:push` 时使用生产 `DATABASE_URL`，或在 CI/脚本中执行。

完成后，把 **https://你的项目.vercel.app** 作为简历上的「在线演示」链接即可，访客可用自己的 Google 账号注册并登录使用。

**若 Google 登录后跳回首页、进不去仪表盘**：  
1. **Vercel 环境变量**（Settings → Environment Variables）：  
   - **NEXTAUTH_URL** = 你的生产地址，**不要尾斜杠**。例如：`https://music-viu6.vercel.app`  
   - **NEXTAUTH_SECRET** = 任意随机长字符串（生产必填，否则 session 无效）  
   - 改完后在 Vercel 里 **Redeploy** 一次。  
2. **Google Cloud Console**：  
   - APIs & Services → Credentials → 你的 OAuth 2.0 客户端 ID → **已授权的重定向 URI**  
   - 必须有一条**完全一致**：`https://music-viu6.vercel.app/api/auth/callback/google`（若域名不同则改成你的 Vercel 域名）。  
3. 若登录后回到登录页且**出现红色错误提示**，根据提示内容排查（如 Configuration = 检查上述配置；OAuthCallback = 检查 Google 重定向 URI）。  
4. 代码里已设置登录后强制跳转 `/dashboard` 和 `trustHost: true`，部署最新代码后重试。

## 每日同步（Vercel Cron）

- 已在 `vercel.json` 中配置 Cron：每天 UTC 2:00 调用 `GET /api/cron/sync-spotify`。
- 请求需带 Header：`Authorization: Bearer <CRON_SECRET>`（与 env 中 `CRON_SECRET` 一致）。

## Sentry（可选）

- 在 [Sentry](https://sentry.io) 创建项目，选择 Next.js。
- 安装 `@sentry/nextjs` 并按官方文档配置 `sentry.client.config.ts` / `sentry.server.config.ts`。
- 在 Vercel 环境变量中设置 `SENTRY_DSN`。
