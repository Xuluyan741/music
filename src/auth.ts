import type { AuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { and, eq } from "drizzle-orm";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";

export const authOptions: AuthOptions = {
  // Vercel 会自动设置 VERCEL 环境变量，NextAuth 会据此信任 Host，无需 trustHost
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login", // 错误时回到登录页，通过 ?error= 显示原因
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    /** 登录后跳转：始终进 dashboard，避免被 redirect 回首页或登录页 */
    redirect({ url, baseUrl }) {
      const base = baseUrl.replace(/\/$/, "");
      const toDashboard = `${base}/dashboard`;
      if (url === "/" || url === base || url === base + "/" || url === "/login" || !url) return toDashboard;
      if (url.startsWith("/") && url !== "/login") return `${base}${url}`;
      try {
        const u = new URL(url);
        if (u.origin === base && u.pathname !== "/" && u.pathname !== "/login") return url;
      } catch {
        // ignore
      }
      return toDashboard;
    },
    /**
     * JWT 策略：把 user id 和 hasSpotify 放进 token，避免每次请求都查库
     */
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;

      const userId = user?.id ?? token?.sub;
      if (userId && typeof userId === "string") {
        const CACHE_MS = 2 * 60 * 1000; // 2 分钟内有缓存则复用，减少 DB 请求；连接/断开 Spotify 后最多 2 分钟生效
        const now = Date.now();
        const cached =
          token.hasSpotify !== undefined &&
          typeof token.hasSpotifyAt === "number" &&
          now - token.hasSpotifyAt < CACHE_MS;
        if (!cached) {
          const spotifyAccount = await db.query.accounts.findFirst({
            where: and(
              eq(accounts.userId, userId),
              eq(accounts.provider, "spotify"),
            ),
          });
          token.hasSpotify = !!spotifyAccount;
          token.hasSpotifyAt = now;
        }
      }
      return token;
    },
    /**
     * 从 token 读出 user.id 和 hasSpotify，不再在此处查库
     */
    async session({ session, token, user }) {
      if (!session.user) return session;

      const userId = user?.id ?? token?.sub;
      if (!userId || typeof userId !== "string") return session;

      session.user.id = userId;
      session.user.hasSpotify = token.hasSpotify === true;

      return session;
    },
  },
};

