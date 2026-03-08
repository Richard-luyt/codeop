export interface FileNode {
  name: string;
  path: string;
  type: "tree" | "blob";
  children?: FileNode[];
}

export function buildFileTree(flatFiles: any[]): FileNode[] {
  const root: FileNode[] = [];
  const TotalRoot: FileNode = {
    name: "repository",
    path: "/",
    type: "tree",
    children: [],
  };
  root.push(TotalRoot);
  let newMap = new Map<string, number>();
  for (const file of flatFiles) {
    const file_path: string[] = file.path.split("/");
    let currentnode: FileNode = TotalRoot;
    let i: number = 0;
    let currentpath: string = "";
    for (const path of file_path) {
      if (path == " " || path == "") {
        i++;
        continue;
      }
      currentpath += `/${path}`;
      if (newMap.get(currentpath) != undefined) {
        // newMap.set(currentpath, 1);
        for (const next_path of currentnode.children!) {
          if (next_path.name == path) {
            currentnode = next_path;
            break;
          }
        }
      } else {
        newMap.set(currentpath, 1);
        const newnode: FileNode = {
          name: path,
          path: currentpath,
          type: i == file_path.length - 1 ? file.type : "tree",
          children: [],
        };
        currentnode.children!.push(newnode);
        if (newnode.type == "tree" && i != file_path.length - 1) {
          currentnode = newnode;
        }
      }
      i++;
    }
  }
  return root;
}
