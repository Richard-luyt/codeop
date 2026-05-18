"use client";
import { useState } from "react";
import { createProject, syncProjectTree } from "@/lib/github";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./RepoList.module.css";
import RepoListCards from "./RepoListCards";

export default function RepoList({ initialRepos }: { initialRepos: any[] }) {
  const [loadingId, setloadingId] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [selectedRepoIdInList, setSelectedRepoIdInList] = useState<
    number | null
  >(null);
  const router = useRouter();

  const handleSync = async (repo: any) => {
    setloadingId(repo.id);
    setStatus(`setting up ${repo.id}`);
    try {
      const localId = await createProject(repo.id, repo.name, repo.owner);
      setStatus(`${repo.id} has been set up, syncing to file tree`);
      const syncRes = await syncProjectTree(localId);
      if (syncRes.success) {
        setStatus(`✅ ${repo.name} Sync Success!`);
        router.push(
          `/dashboard/repo/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}/${repo.id}`,
        );
      } else {
        if (syncRes.status == 401) {
          setStatus(`❌ Your login credential failed, redirecting...`);
          signIn("github", { redirectTo: "/dashboard" });
        } else {
          setStatus(`❌ Sync Failed: ${syncRes.error}`);
        }
      }
    } catch (err) {
      setStatus(`❌ an error occured ${err}`);
    } finally {
      setloadingId(null);
    }
  };

  return (
    <div className={styles.rootList}>
      <RepoListCards
        initialRepos={initialRepos}
        status={status}
        selectedRepoIdInList={selectedRepoIdInList}
        setSelectedRepoIdInList={setSelectedRepoIdInList}
        loadingId={loadingId}
        onSync={handleSync}
      />
    </div>
  );
}
