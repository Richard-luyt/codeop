"use client";

import FileTree from "./FileTree";
import { Editor, Monaco } from "@monaco-editor/react";
import styles from "./RepoList.module.css";
import { type FileNode } from "../lib/utiles";
import { editor } from "monaco-editor";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import { useEditorStore } from "@/app/store/useEditorStore";
import {createRoomAction, joinRoomAction, leaveRoomAction} from "@/lib/actions";

import {getRoomInfo} from "@/lib/actions";
import {HocuspocusProvider} from "@hocuspocus/provider"

import * as Y from 'yjs';

export function createCommentWidget(widgetId: string, dynamicLine: number) {
  const containerNode = document.createElement("div");
  containerNode.id = widgetId;
  return {
    getDomNode: () => containerNode,
    getId: () => widgetId,
    getPosition: () => {
      return {
        position: { lineNumber: dynamicLine, column: 1 },
        preference: [2 as any],
      };
    },
  };
}

export default function RepoCodeView({
  currentFilePath,
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
  repoId,
}: {
  currentFilePath: string;
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
  repoId: number | null;
}) {
  const nodes = treeData?.[0]?.children ?? [];
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const jumpCommand = useEditorStore((state) => state.jumpCommand);
  const clearJumpCommand = useEditorStore((state) => state.clearJumpCommand);
  const [activeWidgets, setActiveWidgets] = useState<
    Array<{ id: string; node: HTMLElement; line: number; payload?: any }>
  >([]);
  const [roomInfo, setRoomInfo] = useState<any | null | undefined>(undefined);
  const [isJoined, setIsJoined] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>();
  const [isLoadingRoom, setIsLoadingRoom] = useState<boolean>(false);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [roomActionType, setRoomActionType] = useState<"create" | "join" | null>(null);

  const onClickCreate = () => {
    setRoomActionType("create");
    setPasswordValue("");
    setPasswordError(null);
    setPasswordOpen(true);
  };
  
  const onClickJoin = () => {
    setRoomActionType("join");
    setPasswordValue("");
    setPasswordError(null);
    setPasswordOpen(true);
  };

  const handleLocalEditorMount = (
    ed: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    editorRef.current = ed;
    onEditorMount(ed, monaco);
  };

  const renderButton = function () {
    if (!currentFilePath) return null;
    if (isLoadingRoom || roomInfo === undefined) {
      return <button disabled>Loading room...</button>;
    }
    if (roomInfo === null) {
      return <button onClick={onClickCreate}>Create Room</button>;
    }
    return <button onClick={onClickJoin}>Join Room</button>;
  }
  
  const onSubmitPassword = async () => {
    if (!passwordValue.trim()) {
      setPasswordError("PLease Enter Your Password");
      return;
    }
    setPasswordError(null);
    try {
      if (roomActionType === "create") {
        const res = await createRoomAction(repoId, currentFilePath, passwordValue);
        if (!res.success) {
          setPasswordError(res.error ?? "Failed To Create Room");
          return;
        }
        setPasswordOpen(false);
        setPasswordValue("");
        return;
      }
      if (roomActionType === "join") {
        if (!roomInfo?.roomId) {
          setPasswordError("The Room does not exits");
          return;
        }
        const res = await joinRoomAction(roomInfo.roomId, passwordValue);
        if (!res.success) {
          setPasswordError(res.error ?? "Can not join room");
          return;
        }
        setPasswordOpen(false);
        setPasswordValue("");
        return;
      }
      setPasswordError("unknown error");
    } catch (e) {
      console.log(e);
      setPasswordError("an error occured, please try again later");
    }
  };

  useEffect(() => {
    if(!currentFilePath) return;

    let cancelled = false;

    async function loadRoomInfo() {
      setIsLoadingRoom(true);
      try {
        const room = await getRoomInfo(currentFilePath, repoId);
        if(!cancelled){
          setRoomInfo(room.success ? room.data : null);
        }
      } catch(err) {
        if(!cancelled) setRoomInfo(null);
      } finally {
        if(!cancelled) setIsLoadingRoom(false);
      }
    }

    loadRoomInfo();


    return () => {
      cancelled = true;
    };

  }, [currentFilePath, repoId]);

  useEffect(() => {
    if (!jumpCommand || !editorRef.current) return;
    const { filePath, line } = jumpCommand;
    const widgetId = `comment-${line}-${filePath}`;

    const executeJumpAndMount = () => {
      const ed = editorRef.current;
      if (!ed) return;

      ed.revealLineInCenter(line);
      const myWidget = createCommentWidget(widgetId, line);
      ed.addContentWidget(myWidget);
      setActiveWidgets((prev) => [
        ...prev,
        {
          id: widgetId,
          node: myWidget.getDomNode(),
          line: line,
          payload: jumpCommand.payload,
        },
      ]);
    };

    if (currentFilePath !== filePath) {
      onFileClick(filePath).then(() => {
        setTimeout(() => {
          executeJumpAndMount();
        }, 100);
      });
    } else {
      executeJumpAndMount();
    }
  }, [jumpCommand, currentFilePath]);

  return (
    <>
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Send a message</h3>
            <p className={styles.modalSubtitle}>
              sending a message regarding to:
            </p>
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
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.btnCancel}
              >
                Cancel
              </button>
              <button onClick={onSendComment} className={styles.btnSend}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      {passwordOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>
              {roomActionType === "create" ? "Create Room" : "Join Room"}
            </h3>
            <input
              type="password"
              placeholder="Please input password"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              className={styles.modalInput}
            />
            {passwordError && (
              <p style={{ color: "#ef4444", marginTop: 8 }}>{passwordError}</p>
            )}
            <div className={styles.modalActions}>
              <button
                onClick={() => {
                  setPasswordOpen(false);
                  setPasswordError(null);
                }}
                className={styles.btnCancel}
              >
                Cancel
              </button>
              <button onClick={onSubmitPassword} className={styles.btnSend}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.codeViewRow}>
        <div style={{ marginBottom: 8 }}>
          {renderButton()}
        </div>
        <span onClick={onBack} className={styles.backLink}>
          ← Back
        </span>
        <div className={styles.fileTreeWrap}>
          <FileTree nodes={nodes} onFileClick={onFileClick} activePath = {currentFilePath}/>
        </div>
        <div className={styles.editorWrap}>
          <Editor
            height="100%"
            language={codelanguage}
            theme="vs-dark"
            onMount={handleLocalEditorMount}
            value={currentCode}
          />
          {activeWidgets.map((widget) =>
            createPortal(
              <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg shadow-2xl z-50 text-white min-w-[300px]">
                <div className="font-bold text-sm text-blue-400 mb-2">
                  Line {widget.line} has a new comment!
                </div>
                <p className="text-sm">
                  {widget.payload?.content || "No content provided."}
                </p>

                <button
                  className="mt-3 text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded"
                  onClick={() => {
                    if (editorRef.current) {
                      editorRef.current.removeContentWidget({
                        getId: () => widget.id,
                      } as any);
                    }

                    setActiveWidgets((prev) =>
                      prev.filter((w) => w.id !== widget.id),
                    );

                    clearJumpCommand();
                  }}
                >
                  Close
                </button>
              </div>,
              widget.node,
            ),
          )}
        </div>
      </div>
    </>
  );
}
