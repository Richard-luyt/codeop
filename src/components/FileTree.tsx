"use client";
import { useState } from "react";
import { ChevronRight, Folder } from "lucide-react";
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
  activePath: string,
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
  const [isOpen, setIsOpen] = useState(depth < 1);
  const isFolder = node.type === "tree";
  const isSelected = !isFolder && activePath === node.path;

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileClick(node.path);
    }
  };

  const indent = 6 + depth * 16;

  return (
    <li>
      <div
        onClick={handleClick}
        className={`${styles.row} ${isSelected ? styles.rowSelected : ""}`}
        style={{ paddingLeft: indent }}
      >
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
              <Folder size={16} strokeWidth={1.75} className={styles.folderIconSvg} />
            </span>
          </>
        ) : (
          <>
            <span className={styles.spacer} />
            <span className={styles.fileIconWrap}>
              {getFileIcon(node.name)}
            </span>
          </>
        )}
        <span className={styles.label}>{node.name}</span>
      </div>
      {isFolder && isOpen && node.children && node.children.length > 0 && (
        <ul className={styles.list}>
          {node.children.map((child) => (
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
