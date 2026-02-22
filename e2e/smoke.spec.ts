import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/netease-style-app|Next|Create/);
  await expect(page.locator("body")).toBeVisible();
});

test("unauthenticated user is redirected from dashboard", async ({
  page,
}) => {
  await page.goto("/dashboard");
  // Without valid auth config: redirect to error page; with valid config: redirect to /login
  await expect(page).toHaveURL(/\/(login|api\/auth\/error)/);
});

test("login page has google sign-in", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /google|登录/i })).toBeVisible();
});

test("unauthenticated user hitting Spotify connect is redirected to login", async ({
  page,
}) => {
  const res = await page.goto("/api/spotify/connect");
  const url = res?.url() ?? page.url();
  expect(url).toMatch(/\/login/);
});
