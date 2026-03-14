import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  primaryKey,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "@auth/core/adapters";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const projectTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  githubRepoId: text("github_repo_id").unique(),
  title: text("title").notNull(),
  teamID: integer("team_id").notNull().default(0),
  repoOwner: text("repo_owner").notNull(),
  repoName: text("repo_name").notNull(),
  fileTree: jsonb("file_tree"),
  lastSyncedAt: timestamp("last_synced_at"),
});

export const commentTable = pgTable("comments", {
  id: serial("id").primaryKey(),

  authorID: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  projectID: text("project_id")
    .notNull()
    .references(() => projectTable.githubRepoId, { onDelete: "cascade" }),

  teamID: integer("team_id").notNull().default(0),
  toWhomID: text("towhom_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lineNumber: integer("line_num").notNull(),
  checkedByUser: boolean("checked").notNull().default(false),
});

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
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
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ],
);
