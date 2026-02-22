import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      NEXTAUTH_URL: "http://localhost:3000",
      NEXTAUTH_SECRET: "test-secret-at-least-32-characters-long",
      DATABASE_URL:
        process.env.DATABASE_URL ?? "postgres://localhost:5432/netease_style_app",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "test",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "test",
      SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID ?? "test",
      SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET ?? "test",
      SPOTIFY_REDIRECT_URI:
        process.env.SPOTIFY_REDIRECT_URI ?? "http://localhost:3000/api/spotify/callback",
    },
  },
});
