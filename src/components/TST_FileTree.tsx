"use client";
import { useState } from "react";
import { type FileNode } from "../lib/utiles";
import { AiFillFolder } from "react-icons/ai";
import { getFileIcon } from "./getFileIcon";
import styles from "./FileTree.module.css";

export default function FileTree({
  nodes,
  onFileClick,
}: {
  nodes: FileNode[];
  onFileClick: (path: string) => void;
}) {
    nodes.map((e) => (
    ))

}

function FileNodeItem({
  node,
  depth,
  selectedPath,
  onFileClick,
}: {
  node: FileNode;
  depth: number;
  selectedPath: string | null;
  onFileClick: (path: string) => void;
}) {
  const [open, setopen] = useState(false);
  const isFolder = node.type == "tree";

  const handleClick = () => {
    if (isFolder) {
      setopen(!open);
    } else {
      onFileClick(node.path);
    }
  };

  return (
    <li>
      <div onClick={handleClick}>
        {isFolder ? <div> Folder ICON </div> : <div> File ICON </div>}
      </div>
      {open ? (
        <ul>
          {node.children?.map((e) => (
            <FileNodeItem
              key={e.path}
              node={e}
              depth={depth + 1}
              selectedPath={selectedPath}
              onFileClick={onFileClick}
            />
          ))}
        </ul>
      ) : (
        <></>
      )}
    </li>
  );
}
