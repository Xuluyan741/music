# 部署说明（Phase 7）

## GitHub

- 在 GitHub 创建仓库，将本地项目 push 上去。
- 提交前请运行：`pnpm lint`、`pnpm test`、`pnpm test:e2e`（E2E 需无其他服务占用 3000 端口）。

## Vercel

1. 在 [Vercel](https://vercel.com) 导入该 GitHub 仓库。
2. 在项目 Settings → Environment Variables 中配置：
   - `DATABASE_URL`（生产 Postgres，如 Vercel Postgres / Neon / Supabase）
   - `NEXTAUTH_URL`（生产域名，如 `https://xxx.vercel.app`）
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   - `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`
   - `CRON_SECRET`（随机字符串，用于 Cron 鉴权）
3. 在 Spotify Dashboard 的 Redirect URIs 中添加生产回调，例如：  
   `https://你的域名.vercel.app/api/spotify/callback`
4. 部署后执行一次数据库迁移：本地执行 `pnpm db:push` 时使用生产 `DATABASE_URL`，或在 CI/脚本中执行。

## 每日同步（Vercel Cron）

- 已在 `vercel.json` 中配置 Cron：每天 UTC 2:00 调用 `GET /api/cron/sync-spotify`。
- 请求需带 Header：`Authorization: Bearer <CRON_SECRET>`（与 env 中 `CRON_SECRET` 一致）。

## Sentry（可选）

- 在 [Sentry](https://sentry.io) 创建项目，选择 Next.js。
- 安装 `@sentry/nextjs` 并按官方文档配置 `sentry.client.config.ts` / `sentry.server.config.ts`。
- 在 Vercel 环境变量中设置 `SENTRY_DSN`。
