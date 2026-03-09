"use client";

import FileTree from "./FileTree";
import { Editor, Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import styles from "./RepoList.module.css";
import { type FileNode } from "../lib/utiles";

export default function RepoCodeView({
  treeData,
  onBack,
  onFileClick,
  currentCode,
  codelanguage,
  onEditorMount,
  isModalOpen,
  setIsModalOpen,
  targetCode,
  toEmail,
  setToEmail,
  message,
  setMessage,
  onSendComment,
}: {
  treeData: FileNode[];
  onBack: () => void;
  onFileClick: (path: string) => Promise<void>;
  currentCode: string;
  codelanguage: string;
  onEditorMount: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  targetCode: string;
  toEmail: string | undefined;
  setToEmail: (v: string | undefined) => void;
  message: string;
  setMessage: (v: string) => void;
  onSendComment: () => Promise<void>;
}) {
  const nodes = treeData?.[0]?.children ?? [];

  return (
    <>
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Send a message</h3>
            <p className={styles.modalSubtitle}>sending a message regarding to:</p>
            <code className={styles.modalCode}>{targetCode}</code>

            <input
              placeholder="user email"
              value={toEmail ?? ""}
              onChange={(e) => setToEmail(e.target.value)}
              className={styles.modalInput}
            />
            <textarea
              placeholder="write something here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.modalTextarea}
            />

            <div className={styles.modalActions}>
              <button onClick={() => setIsModalOpen(false)} className={styles.btnCancel}>
                Cancel
              </button>
              <button onClick={onSendComment} className={styles.btnSend}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.codeViewRow}>
        <span onClick={onBack} className={styles.backLink}>
          ← Back
        </span>
        <div className={styles.fileTreeWrap}>
          <FileTree nodes={nodes} onFileClick={onFileClick} />
        </div>
        <div className={styles.editorWrap}>
          <Editor
            height="100%"
            language={codelanguage}
            theme="vs-dark"
            onMount={onEditorMount}
            value={currentCode}
          />
        </div>
      </div>
    </>
  );
}
