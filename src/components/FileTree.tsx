"use client";
import { useState } from "react";
import { type FileNode } from "../lib/utiles";

export default function FileTree({
  nodes,
  onFileClick,
}: {
  nodes: FileNode[];
  onFileClick: (path: string) => void;
}) {
  return (
    <ul style={{ listStyle: "none", paddingLeft: "15px", color: "white" }}>
      {nodes.map((node) => (
        <FileNodeItem key={node.path} node={node} onFileClick={onFileClick} />
      ))}
    </ul>
  );
}

function FileNodeItem({
  node,
  onFileClick,
}: {
  node: FileNode;
  onFileClick: (path: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = node.type === "tree";

  return (
    <li>
      <div
        onClick={() => (isFolder ? setIsOpen(!isOpen) : onFileClick(node.path))}
        style={{
          cursor: "pointer",
          padding: "2px 0",
          color: isFolder ? "#ffced7" : "#f8f8f2",
        }}
      >
        {isFolder ? (isOpen ? "📂 " : "📁 ") : "</> "}
        {node.name}
      </div>
      {isFolder && isOpen && node.children && (
        <FileTree nodes={node.children} onFileClick={onFileClick} />
      )}
    </li>
  );
}
