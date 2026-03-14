import { auth } from "@/auth";
import { getUserRepo } from "@/lib/github";
import RepoList from "../../components/RepoList";
import DashboardLayout from "../../components/DashboardLayout";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  const response = await getUserRepo();
  console.log("true");
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }
  if (!response.success) {
    if (response.status == 401) {
      console.log(session);
      //redirect("/");
      //redirect("/api/auth/signin?callbackUrl=/dashboard");
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
