import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db/db";
import { users, accounts, sessions } from "./db/schema";
import { eq, and } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }

      const [account] = await db
        .select()
        .from(accounts)
        .where(
          and(eq(accounts.userId, user.id), eq(accounts.provider, "github")),
        )
        .limit(1);

      if (
        account &&
        account.expires_at &&
        Date.now() / 1000 > account.expires_at - 60
      ) {
        try {
          const response = await fetch(
            "https://github.com/login/oauth/access_token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                client_id: process.env.GITHUB_ID,
                client_secret: process.env.GITHUB_SECRET,
                grant_type: "refresh_token",
                refresh_token: account.refresh_token,
              }),
            },
          );

          const tokens = await response.json();
          if (!response.ok) throw tokens;

          await db
            .update(accounts)
            .set({
              access_token: tokens.access_token,
              expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
              refresh_token: tokens.refresh_token ?? account.refresh_token,
            })
            .where(eq(accounts.userId, user.id));
        } catch (error) {
          console.error(error);
          return { ...session, error: "RefreshAccessTokenError" };
        }
      }
      return session;
    },
  },
  providers: [
    GitHub({
      authorization: { params: { scope: "read:user user:email repo" } },
    }),
  ],
});
