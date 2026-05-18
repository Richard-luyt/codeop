"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import type { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";

import RepoCodeView from "./RepoCodeView";
import { buildFileTree, type FileNode } from "../lib/utiles";
import { createProject, getFileContent, syncProjectTree } from "@/lib/github";
import { sendCommentAction } from "../lib/actions";

export default function RepoEditorShell({
  repoOwner,
  repoName,
  repoId,
}: {
  repoOwner: string;
  repoName: string;
  repoId: number;
}) {
  const router = useRouter();
  const { data: session } = useSession();

  const [treeData, setTreeData] = useState<FileNode[] | null>(null);
  const [currentCode, setCurrentCode] = useState("");
  const [codelanguage, setCurrentLang] = useState("typescript");
  const [currentPath, setPath] = useState("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [targetLine, setTargetLine] = useState<number | null>(null);
  const [targetCode, setTargetCode] = useState("");
  const [toEmail, setToEmail] = useState<string>();
  const [message, setMessage] = useState("");
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTree() {
      const localId = await createProject(String(repoId), repoName, repoOwner);
      const syncRes = await syncProjectTree(localId);
      if (cancelled) return;
      if (!syncRes.success) {
        if (syncRes.status === 401) {
          signIn("github", { redirectTo: "/dashboard" });
        }
        return;
      }
      setTreeData(buildFileTree(syncRes.data));
    }

    loadTree();
    return () => {
      cancelled = true;
    };
  }, [repoId, repoName, repoOwner]);

  function handleEditorDidMount(
    ed: editor.IStandaloneCodeEditor,
    _monaco: Monaco,
  ) {
    editorRef.current = ed;
    ed.addAction({
      id: "send-a-message-to-friend",
      label: "Send-A-Message-to-friend on this line",
      contextMenuGroupId: "navigation",
      run: (instance) => {
        const position = instance.getPosition();
        const lineNumber: number = position?.lineNumber!;
        const codeContent = instance.getModel()?.getLineContent(lineNumber) || "";
        setTargetLine(lineNumber);
        setTargetCode(codeContent);
        setIsModalOpen(true);
      },
    });
  }

  async function handleSendComment() {
    if (!toEmail || !message || !targetLine) {
      alert("empty message or email!");
      return;
    }

    const result = await sendCommentAction(
      toEmail,
      message,
      String(repoId),
      targetLine,
      session?.user?.id!,
      currentPath,
    );
    if (result.success) {
      setIsModalOpen(false);
      setToEmail("");
      setMessage("");
      alert("Sent Successfully");
      return;
    }
    alert(result.error);
  }

  const handleFileClick = async (path: string) => {
    let language = path.split(".").pop();
    if (language == "ts") language = "typescript";
    else if (language == "py") language = "python";
    else if (language == "c") language = "c";
    else if (language == "cpp") language = "c++";
    setCurrentLang(language ? language : "undefined");

    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const code = await getFileContent(repoOwner, repoName, cleanPath);
    if (!code.success) {
      if (code.status === 401) {
        signIn("github", { redirectTo: "/dashboard" });
      }
      return;
    }
    setCurrentCode(code.data);
    setPath(cleanPath);
  };

  if (!treeData) {
    return (
      <div style={{ color: "#a1a1aa", padding: "16px 0" }}>
        Loading repository files...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, minWidth: 0, width: "100%" }}>
      <RepoCodeView
        currentFilePath={currentPath}
        treeData={treeData}
        onBack={() => router.push("/dashboard")}
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
        repoId={repoId}
      />
    </div>
  );
}
