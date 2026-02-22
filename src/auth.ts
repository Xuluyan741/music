import type { AuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { and, eq } from "drizzle-orm";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";

export const authOptions: AuthOptions = {
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
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    /**
     * JWT 策略下把 user id 放进 token，供 session 回调使用
     */
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    /**
     * 在 Session 中附加 user.id 和 hasSpotify 标记
     * JWT 策略时用 token.sub 查库，database 策略时用 user.id
     */
    async session({ session, token, user }) {
      if (!session.user) return session;

      const userId = user?.id ?? token?.sub;
      if (!userId || typeof userId !== "string") return session;

      const spotifyAccount = await db.query.accounts.findFirst({
        where: and(
          eq(accounts.userId, userId),
          eq(accounts.provider, "spotify"),
        ),
      });

      session.user.id = userId;
      session.user.hasSpotify = !!spotifyAccount;

      return session;
    },
  },
};

