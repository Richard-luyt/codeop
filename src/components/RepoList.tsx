"use client";
import { useState, useRef } from "react";
import { createProject, syncProjectTree, getFileContent } from "@/lib/github";
import { buildFileTree } from "../lib/utiles";
import { type FileNode } from "../lib/utiles";
import { signIn, useSession } from "next-auth/react";
import type { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { sendCommentAction } from "../lib/actions";
import styles from "./RepoList.module.css";
import RepoListCards from "./RepoListCards";
import RepoCodeView from "./RepoCodeView";

export default function RepoList({ initialRepos }: { initialRepos: any[] }) {
  const [loadingId, setloadingId] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [treeData, setTreeData] = useState<FileNode[] | null>(null);
  const [currentCode, setCurrentCode] = useState("");
  const [codelanguage, setCurrentLang] = useState("typescript");
  const [selectedRepo, setSelectedRepo] = useState<{
    owner: string;
    name: string;
    id: number;
  } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [targetLine, setTargetLine] = useState<number | null>(null);
  const [targetCode, setTargetCode] = useState("");

  const [toEmail, setToEmail] = useState<string>();
  const [message, setMessage] = useState("");
  const [selectedRepoIdInList, setSelectedRepoIdInList] = useState<number | null>(null);

  const { data: session } = useSession();
  const repoRef = useRef(selectedRepo);

  const handleSync = async (repo: any) => {
    setloadingId(repo.id);
    setStatus(`setting up ${repo.id}`);
    try {
      const localId = await createProject(repo.name, repo.owner);
      setStatus(`${repo.id} has been set up, syncing to file tree`);
      const syncRes = await syncProjectTree(localId);
      if (syncRes.success) {
        const tree = buildFileTree(syncRes.data);
        setTreeData(tree);
        setSelectedRepo({ owner: repo.owner, name: repo.name, id: repo.id });
        repoRef.current = { owner: repo.owner, name: repo.name, id: repo.id };
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

  function handleEditorDidMount(ed: editor.IStandaloneCodeEditor, _monaco: Monaco) {
    ed.addAction({
      id: "send-a-message-to-friend",
      label: "Send-A-Message-to-friend on this line",
      contextMenuGroupId: "navigation",
      run: (e) => {
        const position = e.getPosition();
        const linenumber: number = position?.lineNumber!;
        const codeContent = e.getModel()?.getLineContent(linenumber) || "";
        setTargetLine(linenumber);
        setTargetCode(codeContent);
        setIsModalOpen(true);
      },
    });
  }

  async function handleSendComment() {
    if (!toEmail || !message) {
      alert("empty message or email!");
      return;
    }
    if (!repoRef.current) return;
    const result = await sendCommentAction(
      toEmail,
      message,
      repoRef.current.id,
      targetLine!,
      session?.user?.id!,
    );
    if (result.success) {
      setIsModalOpen(false);
      setToEmail("");
      setMessage("");
      alert("Sent Successfully");
    } else {
      alert(result.error);
    }
  }

  const handleFileClick = async (path: string) => {
    if (!selectedRepo) return;
    setStatus(`Reading ${path}...`);
    let cleanlanguage = path.split(".").pop();
    if (cleanlanguage == "ts") cleanlanguage = "typescript";
    else if (cleanlanguage == "py") cleanlanguage = "python";
    else if (cleanlanguage == "c") cleanlanguage = "c";
    else if (cleanlanguage == "cpp") cleanlanguage = "c++";
    setCurrentLang(cleanlanguage ? cleanlanguage : "undefined");
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const code = await getFileContent(selectedRepo.owner, selectedRepo.name, cleanPath);
    if (code.success == false) {
      if (code.status == 401) {
        setStatus(`❌ Your login credential failed, redirecting...`);
        signIn("github", { redirectTo: "/dashboard" });
      } else {
        setStatus(`❌ Sync Failed: ${code.error}`);
      }
      return;
    }
    setCurrentCode(code.data);
    setStatus("File loaded.");
  };

  return (
    <div className={treeData ? styles.root : styles.rootList}>
      {!treeData ? (
        <RepoListCards
          initialRepos={initialRepos}
          status={status}
          selectedRepoIdInList={selectedRepoIdInList}
          setSelectedRepoIdInList={setSelectedRepoIdInList}
          loadingId={loadingId}
          onSync={handleSync}
        />
      ) : (
        <RepoCodeView
          treeData={treeData}
          onBack={() => setTreeData(null)}
          onFileClick={handleFileClick}
          currentCode={currentCode}
          codelanguage={codelanguage}
          onEditorMount={handleEditorDidMount}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          targetCode={targetCode}
          toEmail={toEmail}
          setToEmail={setToEmail}
          message={message}
          setMessage={setMessage}
          onSendComment={handleSendComment}
        />
      )}
    </div>
  );
}
