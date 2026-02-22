# 简历项目描述示例

把本项目写进简历时，可参考下面任一形式，按岗位删减或强调（如偏前端就多写 UI/交互，偏全栈就写 API/数据库/Cron）。

---

## 形式一：项目名 + 一句话 + 技术栈 + 要点（推荐）

**音乐听歌数据看板（Spotify 授权）**  
*个人项目 | [GitHub](https://github.com/Xuluyan741/music)*

- **技术栈**：Next.js 16、React 19、TypeScript、NextAuth（Google/Spotify OAuth）、Drizzle ORM、PostgreSQL、Tailwind CSS、Vercel 部署
- 接入 Spotify OAuth，实现授权后拉取并存储用户 Top 艺人/歌曲，支持多时间维度（近 4 周 / 半年 / 全部）展示
- 使用 Drizzle 设计并维护用户、同步记录、关注关系等表结构，通过 API 与 Cron 实现每日自动同步听歌数据
- 实现仪表盘、关注与好友动态流、设置页等完整前端流程，采用服务端渲染与组件化开发
- 编写单元测试（Vitest）与 E2E 测试（Playwright），配置 ESLint 与规范提交，便于协作与维护

---

## 形式二：更简短（适合简历空间紧）

**音乐数据看板** | Next.js · TypeScript · NextAuth · Drizzle · PostgreSQL · Vercel  
- Spotify OAuth 授权，拉取并持久化 Top 艺人/歌曲，多时间维度展示；Drizzle + PostgreSQL 建表，Cron 每日同步
- 仪表盘、关注与好友动态、设置页；Vitest + Playwright 测试，ESLint 规范

---

## 形式三：分点写（适合「项目经历」逐条罗列）

- **项目名称**：音乐听歌数据看板（或：Spotify 听歌统计 Web 应用）
- **项目链接**：https://github.com/Xuluyan741/music（若已上线可再加：在线演示 https://xxx.vercel.app）
- **技术栈**：Next.js、React、TypeScript、NextAuth、Drizzle、PostgreSQL、Tailwind、Vercel
- **职责/成果**：
  - 基于 NextAuth 实现 Google/Spotify 登录，对接 Spotify API 拉取用户听歌数据并入库
  - 使用 Drizzle ORM 设计 schema，实现每日 Cron 同步与仪表盘 Top 列表、关注与动态流
  - 前端使用 App Router、服务端组件与 Tailwind/shadcn 风格 UI，支持响应式与基本交互
  - 使用 Vitest、Playwright 做单元与 E2E 测试，配合 ESLint 保证代码质量

---

## 使用建议

1. **项目名称**：用「音乐数据看板」「Spotify 听歌统计」等，比「netease-style-app」更直观。
2. **一定要放链接**：至少放 GitHub 仓库链接；若已部署到 Vercel，可同时放在线地址。
3. **按岗位调整**：投前端岗可突出 React、组件化、Tailwind、E2E；投全栈/后端可突出 OAuth、API、数据库、Cron。
4. **若已上线**：在 Vercel 部署并配置好环境变量与 Google/Spotify 回调后，把**在线地址**（如 `https://xxx.vercel.app`）写进简历；该链接任何人可访问，**访客可用自己的 Google 账号注册/登录**，无需仅你一人使用。
