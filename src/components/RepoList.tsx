"use client";
import { useState } from "react";
import { createProject, syncProjectTree } from "@/lib/github";
import { buildFileTree } from "../lib/utiles";
import { type FileNode } from "../lib/utiles";
import { getFileContent } from "@/lib/github";
import FileTree from "./FileTree";
import { signIn } from "next-auth/react";

export default function RepoList({ initialRepos }: { initialRepos: any[] }) {
  const [loadingId, setloadingId] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [treeData, setTreeData] = useState<FileNode[] | null>(null);
  const [currentCode, setCurrentCode] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<{
    owner: string;
    name: string;
  } | null>(null);

  const handleSync = async (repo: any) => {
    setloadingId(repo.id);
    setStatus(`setting up ${repo.id}`);

    try {
      const localId = await createProject(repo.name, repo.owner);
      setStatus(`${repo.id} has been set up, syncing to file tree`);
      const syncRes = await syncProjectTree(localId);
      if (syncRes.success) {
        console.log(syncRes.data);
        const tree = buildFileTree(syncRes.data);
        setTreeData(tree);
        setSelectedRepo({ owner: repo.owner, name: repo.name });
        setStatus(`✅ ${repo.name} Sync Success!`);
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
    <div>
      <p style={{ color: "blue" }}>{status || "please click on the repo"}</p>
      {!treeData ? (
        <ul>
          {initialRepos.map((repo) => (
            <li
              key={repo.id}
              style={{ marginBottom: "15px", listStyle: "none" }}
            >
              <strong>{repo.fullName}</strong>
              <button
                onClick={() => handleSync(repo)}
                disabled={loadingId !== null}
                style={{ marginLeft: "15px", cursor: "pointer" }}
              >
                {loadingId === repo.id ? "Syncing..." : "Sync to CodeOp"}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ display: "flex", height: "80vh" }}>
          <div style={{ width: "300px", borderRight: "1px solid #333" }}>
            <FileTree
              nodes={treeData[0].children!}
              onFileClick={async (path) => {
                if (!selectedRepo) return;
                setStatus(`Reading ${path}...`);
                const cleanPath = path.startsWith("/") ? path.slice(1) : path;
                const code = await getFileContent(
                  selectedRepo.owner,
                  selectedRepo.name,
                  cleanPath,
                );
                if (code.success == false) {
                  if (code.status == 401) {
                    setStatus(
                      `❌ Your login credential failed, redirecting...`,
                    );
                    signIn("github", { redirectTo: "/dashboard" });
                  } else {
                    setStatus(`❌ Sync Failed: ${code.error}`);
                  }
                  return;
                }
                setCurrentCode(code.data);
                setStatus("File loaded.");
              }}
            />
          </div>
          <pre
            style={{
              flex: 1,
              padding: "20px",
              overflow: "auto",
              background: "#1a1a1a",
            }}
          >
            {currentCode || "点击左侧文件查看代码"}
          </pre>
        </div>
      )}
    </div>
  );
}
