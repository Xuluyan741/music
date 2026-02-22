import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

/**
 * Auth.js / NextAuth Drizzle schema (PostgreSQL)
 * 支持 Google OAuth，无 password 字段
 */
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compositePk: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

// --- Phase 3: 音乐数据（按日汇总）---

/** 同步快照日期，用于按日去重 */
export const syncLogs = pgTable("sync_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  syncedAt: timestamp("syncedAt", { mode: "date" }).notNull().defaultNow(),
  snapshotDate: text("snapshotDate").notNull(), // YYYY-MM-DD
});

/** Top 艺人（按用户+日期+范围） */
export const topArtists = pgTable("top_artist", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  snapshotDate: text("snapshotDate").notNull(),
  timeRange: text("timeRange").notNull(), // short_term | medium_term | long_term
  rank: integer("rank").notNull(),
  spotifyId: text("spotifyId").notNull(),
  name: text("name").notNull(),
  imageUrl: text("imageUrl"),
});

/** Top 歌曲（按用户+日期+范围） */
export const topTracks = pgTable("top_track", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  snapshotDate: text("snapshotDate").notNull(),
  timeRange: text("timeRange").notNull(),
  rank: integer("rank").notNull(),
  spotifyId: text("spotifyId").notNull(),
  name: text("name").notNull(),
  artistNames: text("artistNames"), // 逗号分隔
  imageUrl: text("imageUrl"),
});

// --- Phase 5: 社交（关注/被关注）---

export const follows = pgTable(
  "follow",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    followerId: text("followerId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: text("followingId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => ({ uniq: unique().on(t.followerId, t.followingId) }),
);
