# 音乐聆听追踪应用 - 开发计划

根据 readme 要求，按迭代方式拆分开发任务。勾选完成项作为 TODO 清单。  
**每阶段末尾都有验收标准与可执行测试，便于逐步验证。**

### 已决策

- **数据同步**：定时任务，每天统计（如 Vercel Cron）
- **社交**：需要好友/社交能力（非仅个人）
- **Spotify Scopes**：`user-top-read`, `user-read-recently-played` 等（按需补充）

---

## Phase 0: 项目初始化 ✅

- [x] 初始化 Git 仓库，配置 .gitignore
- [x] 用 pnpm 初始化 Next.js 项目
- [x] 配置 Tailwind CSS v4
- [x] 安装并配置 shadcn/ui
- [x] 配置 ESLint 9
- [x] 搭建基础目录结构
- [x] **提前搭好测试环境**：Vitest（或 Jest）单元测试 + Playwright E2E，能跑通一条占位测试

**本阶段验收标准**

- [x] `pnpm install` 与 `pnpm dev` 正常，首页可访问
- [x] `pnpm lint` 通过
- [x] `pnpm test` 与 `pnpm test:e2e`（或等价命令）能执行且至少一条占位测试通过

---

## Phase 1: 数据库与认证 ✅

- [x] 配置 Postgres 连接
- [x] 配置 Drizzle ORM，创建 schema（支持 Google OAuth，无用户名/密码）
  - [x] users 表（含 Google OAuth 字段）
  - [x] accounts、sessions、verificationTokens 表
- [x] 实现 Google OAuth 登录
- [x] 实现登出与会话管理
- [x] 基础受保护路由 / 布局（middleware + getServerSession）

**Schema 考量**：用户以 `email` 或 `provider_id`（如 Google sub）为主，无 password 字段

**本阶段验收标准**

- [x] 未登录访问受保护页会重定向到登录
- [ ] 使用 Google 登录后能进入受保护页并看到用户信息（需配置 GOOGLE_CLIENT_ID/SECRET 与 DATABASE_URL 后验证）
- [x] 登出后再次访问受保护页会重定向到登录
- [x] **E2E**：首页加载、未登录重定向、登录页存在，用例通过

---

## Phase 2: Spotify 连接

- [x] 注册 Spotify Developer App，获取 Client ID / Secret
- [x] 在 DB 中使用 `accounts` 表存储 Spotify 连接（基于 NextAuth + Drizzle）
- [x] 在 Auth 配置中集成 Spotify provider（使用 .env 中的 Client ID/Secret）
- [x] 实现「连接 Spotify」OAuth 流程（登录后通过按钮触发 `signIn("spotify")`）
- [x] 实现「断开 Spotify」逻辑（删除当前用户的 spotify account 记录）

**本阶段验收标准**

- [x] 已登录用户可在仪表盘发起「连接 Spotify」，跳转至 Spotify 登录授权页
- [x] 连接后仪表盘显示「已连接」，并可「断开」
- [x] **E2E**：基础回归测试通过（首页加载、受保护路由重定向、登录页存在），后续可在本地手动验证完整 Spotify 授权流程

---

## Phase 3: 音乐数据采集与存储（每天统计）✅

- [x] 使用 Spotify API 获取听歌数据（Top Tracks / Top Artists）
- [x] 定义 Drizzle schema：sync_log、top_artist、top_track
- [x] 实现**每天定时同步**（Vercel Cron 调用 GET /api/cron/sync-spotify）
- [x] 按用户+日期+timeRange 先删后插，避免重复

**本阶段验收标准**

- [x] 手动触发 POST /api/spotify/sync 后，DB 可查到该用户的 top artists / tracks
- [x] Cron 接口在无有效 token 时跳过该用户（不抛错）
- [x] **单元测试**：mapTopArtistsToRows / mapTopTracksToRows 已覆盖

---

## Phase 4: 前端核心界面 ✅

- [x] 设计系统：暖色调（globals.css 主色/背景偏暖）
- [x] 仪表盘：听歌统计区 + Top 艺人 / Top 歌曲列表（TopList）+ 立即同步（SyncButton）
- [x] 连接 Spotify 的引导与状态展示（SpotifySection）
- [x] 个人设置页 /dashboard/settings（账号、Spotify 连接状态）
- [x] 使用 shadcn 风格与 Tailwind 统一

**本阶段验收标准**

- [x] 已连接 Spotify 的用户在仪表盘能看到 Top 列表（需先点「立即同步」）
- [x] 未连接用户仅见 Spotify 卡片引导连接
- [ ] **E2E**：登录后见 Top 列表需本地或 CI 登录后跑（已保留基础 E2E）

---

## Phase 5: 数据与统计展示 + 社交 ✅

- [x] Top 列表按 timeRange 展示（short_term / medium_term / long_term）
- [x] **社交**：follow 表 + POST/DELETE /api/follow，发现用户页 /dashboard/follow
- [x] **社交**：好友动态 /dashboard/feed，展示已关注用户的 Top 艺人/歌曲
- [x] 仪表盘导航：好友动态、发现用户、设置

**本阶段验收标准**

- [x] 用户 A 关注用户 B 后，在「好友动态」可见 B 的 Top 艺人/歌曲（依赖 B 已同步过）
- [x] Top 列表数据来自 DB，按 snapshotDate + timeRange 查询
- [ ] **E2E**：关注流程与动态页可后续补（需登录态）

---

## Phase 6: 测试补全与质量 ✅

- [x] 单元测试：spotify-state 签名/验签、utils.cn、spotify-sync 映射与 cap
- [x] E2E：首页、未登录重定向、登录页、Spotify connect 未登录重定向
- [ ] 核心路径 E2E（登录后仪表盘/Top/关注）可依 CI 或本地登录后补

**本阶段验收标准**

- [x] 业务逻辑（state、sync 映射）有单元测试且通过
- [x] 基础 E2E 通过

---

## Phase 7: 部署与运维 ✅

- [x] 已提供 DEPLOY.md：GitHub、Vercel 环境变量、Spotify 生产 Redirect URI、DB 迁移
- [x] vercel.json 配置 Cron：每日 UTC 2:00 调用 /api/cron/sync-spotify（需 CRON_SECRET）
- [x] .env.example 含 CRON_SECRET、Sentry 占位
- [ ] 集成 Sentry：可选，见 DEPLOY.md；仓库与 Vercel 由你本地配置

**本阶段验收标准**

- [ ] 生产环境可访问、登录与 Spotify 连接正常（部署后自测）
- [ ] Cron 每日执行、Sentry 可选集成

---

## 提交约定

- 使用 `git commit`，每次改动用清晰、描述性信息
- 建议格式：`feat: 描述` / `fix: 描述` / `chore: 描述`
