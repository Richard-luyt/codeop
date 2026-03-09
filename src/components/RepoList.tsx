"use client";
import { useState, useRef } from "react";
import { createProject, syncProjectTree } from "@/lib/github";
import { buildFileTree } from "../lib/utiles";
import { type FileNode } from "../lib/utiles";
import { getFileContent } from "@/lib/github";
import FileTree from "./FileTree";
import { signIn, useSession } from "next-auth/react";
import { Editor, Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { db } from "@/db/db";
import { sendCommentAction } from "../lib/actions";

import { users } from "../db/schema";
import { eq } from "drizzle-orm";

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
        console.log(syncRes.data);
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

  function handleEditorDidMount(
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) {
    editor.addAction({
      id: "send-a-message-to-friend",
      label: "Send-A-Message-to-friend on this line",
      contextMenuGroupId: "navigation",
      run: (ed) => {
        const position = ed.getPosition();
        const linenumber: number = position?.lineNumber!;
        const codeContent = ed.getModel()?.getLineContent(linenumber) || "";
        console.log(linenumber);
        // const content: string = "";
        // const toWhom_user_email: string = "";
        // const newComment = {
        //   authorID: session?.user?.id!,
        //   projectID: repoRef.current.id,
        //   toWhomID: toWhom_user_email,
        //   content: content,
        //   createdAt: Date.now(),
        //   lineNumber: linenumber,
        // };
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

    const result = await sendCommentAction(
      toEmail,
      message,
      repoRef.current!.id,
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

  return (
    <div
      style={
        treeData
          ? { width: "100%", minHeight: "100%", padding: "24px", boxSizing: "border-box" }
          : { maxWidth: "640px", margin: "0 auto", padding: "24px" }
      }
    >
      <div
        style={{
          padding: "12px 16px",
          marginBottom: "20px",
          borderRadius: "8px",
          background: status.startsWith("✅")
            ? "rgba(34, 197, 94, 0.12)"
            : status.startsWith("❌")
              ? "rgba(239, 68, 68, 0.12)"
              : "rgba(59, 130, 246, 0.1)",
          color: status.startsWith("✅")
            ? "#22c55e"
            : status.startsWith("❌")
              ? "#ef4444"
              : "#3b82f6",
          fontSize: "14px",
          borderLeft: `4px solid ${
            status.startsWith("✅")
              ? "#22c55e"
              : status.startsWith("❌")
                ? "#ef4444"
                : "#3b82f6"
          }`,
        }}
      >
        {status || "Select a repo below to sync to CodeOp"}
      </div>
      {!treeData == true ? (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {initialRepos.map((repo) => (
            <li
              key={repo.id}
              style={{
                marginBottom: "12px",
                padding: "16px 20px",
                background: "#1e1e1e",
                borderRadius: "10px",
                border: "1px solid #333",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  color: "#e0e0e0",
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "15px",
                }}
              >
                {repo.fullName}
              </span>
              <button
                onClick={() => handleSync(repo)}
                disabled={loadingId !== null}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  background:
                    loadingId === repo.id
                      ? "#374151"
                      : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: loadingId === null ? "pointer" : "not-allowed",
                  opacity: loadingId !== null && loadingId !== repo.id ? 0.6 : 1,
                  boxShadow:
                    loadingId === repo.id
                      ? "none"
                      : "0 2px 8px rgba(59, 130, 246, 0.35)",
                  transition: "opacity 0.2s, transform 0.1s",
                }}
                onMouseDown={(e) =>
                  loadingId === null && e.currentTarget.style.transform === ""
                    ? (e.currentTarget.style.transform = "scale(0.98)")
                    : null
                }
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                {loadingId === repo.id ? "Syncing…" : "Sync to CodeOp"}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <>
          {isModalOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  background: "#1e1e1e",
                  padding: "24px",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                  maxWidth: "420px",
                  width: "90%",
                  border: "1px solid #333",
                }}
              >
                <h3 style={{ margin: "0 0 12px", color: "#e0e0e0" }}>
                  Send a message
                </h3>
                <p style={{ margin: "0 0 8px", color: "#aaa", fontSize: "14px" }}>
                  sending a message regarding to:
                </p>
                <code
                  style={{
                    display: "block",
                    padding: "8px 12px",
                    marginBottom: "16px",
                    background: "#2d2d2d",
                    borderRadius: "6px",
                    fontSize: "13px",
                    color: "#9cdcfe",
                    overflow: "auto",
                  }}
                >
                  {targetCode}
                </code>

                <input
                  placeholder="user email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 12px",
                    marginBottom: "12px",
                    border: "1px solid #444",
                    borderRadius: "8px",
                    background: "#2d2d2d",
                    color: "#e0e0e0",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <textarea
                  placeholder="write something here"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 12px",
                    marginBottom: "16px",
                    border: "1px solid #444",
                    borderRadius: "8px",
                    background: "#2d2d2d",
                    color: "#e0e0e0",
                    fontSize: "14px",
                    minHeight: "80px",
                    resize: "vertical",
                    outline: "none",
                  }}
                />

                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: "8px 16px",
                      border: "1px solid #555",
                      borderRadius: "6px",
                      background: "#333",
                      color: "#e0e0e0",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendComment}
                    style={{
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "6px",
                      background: "#0d6efd",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
          <div style={{ display: "flex", height: "calc(100vh - 120px)", width: "100%", position: "relative" }}>
            <button
              onClick={() => setTreeData(null)}
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                zIndex: 10,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "8px",
                border: "1px solid #444",
                background: "#2a2a2a",
                color: "#ccc",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#3a3a3a";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "#666";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#2a2a2a";
                e.currentTarget.style.color = "#ccc";
                e.currentTarget.style.borderColor = "#444";
              }}
            >
              ← Back
            </button>
            <div style={{ width: "280px", minWidth: "240px", borderRight: "1px solid #333", flexShrink: 0, paddingTop: "48px" }}>
              <FileTree
                nodes={treeData![0].children!}
                onFileClick={async (path) => {
                  if (!selectedRepo) return;
                  setStatus(`Reading ${path}...`);
                  let cleanlanguage = path.split(".").pop();
                  if (cleanlanguage == "ts") {
                    cleanlanguage = "typescript";
                  } else if (cleanlanguage == "py") {
                    cleanlanguage = "python";
                  } else if (cleanlanguage == "c") {
                    cleanlanguage = "c";
                  } else if (cleanlanguage == "cpp") {
                    cleanlanguage = "c++";
                  }

                  setCurrentLang(cleanlanguage ? cleanlanguage : "undefined");
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
            <div
              style={{
                flex: 1,
                minWidth: 0,
                padding: "20px",
                overflow: "auto",
                background: "#1a1a1a",
              }}
            >
              <Editor
                height="100%"
                language={codelanguage}
                theme="vs-dark"
                onMount={handleEditorDidMount}
                value={currentCode}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
