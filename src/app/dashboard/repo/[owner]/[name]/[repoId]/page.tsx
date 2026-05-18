import { auth } from "@/auth";
import { redirect } from "next/navigation";

import RepoEditorShell from "@/components/RepoEditorShell";

export default async function RepoEditorPage({
  params,
}: {
  params: Promise<{ owner: string; name: string; repoId: string }>;
}) {
  const session = await auth();
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }

  const { owner, name, repoId } = await params;
  const parsedRepoId = Number(repoId);
  if (!Number.isFinite(parsedRepoId)) {
    redirect("/dashboard");
  }

  return (
    <main
      style={{
        height: "100vh",
        background: "#09090b",
        color: "#fafafa",
        display: "flex",
        overflow: "hidden",
      }}
    >
      <RepoEditorShell
        repoOwner={decodeURIComponent(owner)}
        repoName={decodeURIComponent(name)}
        repoId={parsedRepoId}
      />
    </main>
  );
}
