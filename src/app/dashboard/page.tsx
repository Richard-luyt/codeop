import { auth, signIn } from "@/auth";
import { getUserRepo } from "@/lib/github";
import RepoList from "../../components/RepoList";
import DashboardLayout from "../../components/DashboardLayout";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { eq, and } from "drizzle-orm";
import { accounts, projectTable, sessions } from "@/db/schema";

export default async function DashboardPage() {
  const session = await auth();
  // here is where the callback functions runs. Hence account should have updated
  // unless there is no session, or the update failed.
  if (!session) {
    console.log("there is no session");
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }
  const response = await getUserRepo();
  console.log("true");

  if (!response.success) {
    if (response.error == "RefreshAccessTokenError") {
      console.log(session);
      console.log("there is an error when refreshing the access token");
      //await db.delete(accounts).where(eq(accounts.userId, session?.user?.id!));
      //await db.delete(sessions).where(eq(sessions.userId, session?.user?.id!));
      //redirect("/api/auth/signin?callbackUrl=/dashboard");
      return (
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/dashboard" });
          }}
        >
          <button type="submit">Reconnect GitHub</button>
        </form>
      );
    }
    return (
      <div style={{ padding: "40px", color: "#e5e5e5" }}>
        There is a problem when retrieving the list: {response.error}
      </div>
    );
  }

  const repos = response.data;
  const recentRepos = repos
    .slice(0, 3)
    .map((r: { name: string; fullName: string }) => ({
      name: r.name,
      fullName: r.fullName,
    }));

  return (
    <DashboardLayout user={session?.user ?? null} recentRepos={recentRepos}>
      <RepoList initialRepos={repos} />
    </DashboardLayout>
  );
}
