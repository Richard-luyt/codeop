export interface FileNode {
  name: string;
  path: string;
  type: "tree" | "blob";
  children?: FileNode[];
}

export function buildFileTree(flatFiles: any[]): FileNode[] {
  const root: FileNode[] = [];
  const byPath = new Map<string, FileNode[]>();

  flatFiles.forEach((file: { path: string; type: string }) => {
    const parts = file.path.split("/").filter(Boolean);
    if (parts.length === 0) return;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const pathSoFar = parts.slice(0, i + 1).join("/");
      const parentPath = i === 0 ? "" : parts.slice(0, i).join("/");
      const parentChildren = i === 0 ? root : (byPath.get(parentPath) ?? []);

      let node = parentChildren.find((n) => n.name === name);
      if (!node) {
        const isLast = i === parts.length - 1;
        const type = isLast ? (file.type === "blob" ? "blob" : "tree") : "tree";
        node = {
          name,
          path: pathSoFar,
          type: type as "tree" | "blob",
        };
        if (node.type === "tree") {
          node.children = [];
          byPath.set(pathSoFar, node.children);
        }
        parentChildren.push(node);
      }
    }
  });

  return root;
}
