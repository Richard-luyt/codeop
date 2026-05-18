"use client";
import { useState } from "react";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import { type FileNode } from "../lib/utiles";
import { getFileIcon } from "./getFileIcon";
import styles from "./FileTree.module.css";

export default function FileTree({
  nodes,
  onFileClick,
  activePath,
}: {
  nodes: FileNode[];
  onFileClick: (path: string) => void;
  activePath: string;
}) {
  //const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const handleFileClick = (path: string) => {
    //setSelectedPath(path);
    onFileClick(path);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Files</span>
      </div>
      <div className={styles.scrollArea}>
        <ul className={styles.list}>
          {nodes.map((node) => (
            <FileNodeItem
              key={node.path}
              node={node}
              depth={0}
              activePath={activePath}
              onFileClick={handleFileClick}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function FileNodeItem({
  node,
  depth,
  activePath,
  onFileClick,
}: {
  node: FileNode;
  depth: number;
  activePath: string | null;
  onFileClick: (path: string) => void;
}) {
  const collapsed = node.type === "tree" ? collapseFolderChain(node) : null;
  const displayNode = collapsed?.terminalNode ?? node;
  const displayName = collapsed?.displayName ?? node.name;
  const isFolder = displayNode.type === "tree";
  const [isOpen, setIsOpen] = useState(depth < 1);
  const isSelected = !isFolder && activePath === displayNode.path;
  const toneClass =
    !isFolder && isConfigNoise(displayNode.name)
      ? styles.toneMuted
      : !isFolder && isCoreSourceFile(displayNode.name)
        ? styles.tonePrimary
        : styles.toneNeutral;

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileClick(displayNode.path);
    }
  };

  const indent = 8 + depth * 14;

  return (
    <li>
      <div
        onClick={handleClick}
        className={`${styles.row} ${isSelected ? styles.rowSelected : ""}`}
        style={{ paddingLeft: indent }}
      >
        {depth > 0 && (
          <span className={styles.guides} aria-hidden>
            {Array.from({ length: depth }).map((_, i) => (
              <span
                key={`${displayNode.path}-guide-${i}`}
                className={styles.guideLine}
                style={{ left: 8 + i * 14 }}
              />
            ))}
          </span>
        )}
        {isFolder ? (
          <>
            <span
              className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
            >
              <ChevronRight
                size={14}
                strokeWidth={2}
                className={styles.chevronSvg}
                aria-hidden
              />
            </span>
            <span className={styles.folderIcon}>
              {isOpen ? (
                <FolderOpen size={16} strokeWidth={1.75} className={styles.folderIconSvg} />
              ) : (
                <Folder size={16} strokeWidth={1.75} className={styles.folderIconSvg} />
              )}
            </span>
          </>
        ) : (
          <>
            <span className={styles.spacer} />
            <span className={`${styles.fileIconWrap} ${toneClass}`}>
              {getFileIcon(displayNode.name)}
            </span>
          </>
        )}
        <span className={`${styles.label} ${toneClass}`}>{displayName}</span>
      </div>
      {isFolder &&
        isOpen &&
        displayNode.children &&
        displayNode.children.length > 0 && (
        <ul className={styles.list}>
          {displayNode.children.map((child) => (
            <FileNodeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              activePath={activePath}
              onFileClick={onFileClick}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function collapseFolderChain(node: FileNode): {
  displayName: string;
  terminalNode: FileNode;
} {
  const names = [node.name];
  let current = node;

  while (
    current.type === "tree" &&
    current.children?.length === 1 &&
    current.children[0].type === "tree"
  ) {
    current = current.children[0];
    names.push(current.name);
  }

  return {
    displayName: names.join("/"),
    terminalNode: current,
  };
}

function isConfigNoise(fileName: string) {
  const name = fileName.toLowerCase();
  return (
    name.startsWith(".") ||
    name === "package.json" ||
    name === "package-lock.json" ||
    name === "yarn.lock" ||
    name === "pnpm-lock.yaml" ||
    name === "bun.lockb" ||
    name.endsWith(".lock") ||
    name.startsWith("tsconfig") ||
    name.startsWith("eslint") ||
    name.startsWith("prettier") ||
    name.endsWith(".env") ||
    name.includes(".env.")
  );
}

function isCoreSourceFile(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".config.js")) return true;
  const ext = lower.split(".").pop() ?? "";
  return [
    "ts",
    "tsx",
    "js",
    "jsx",
    "html",
    "css",
    "py",
    "go",
    "rs",
    "java",
    "c",
    "cpp",
    "cc",
    "cxx",
  ].includes(ext);
}
