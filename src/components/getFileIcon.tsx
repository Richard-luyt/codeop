import { BsCss, BsTypescript } from "react-icons/bs";
import { FaJs, FaReact, FaPython, FaMarkdown, FaFile } from "react-icons/fa";
import { PiFileCpp } from "react-icons/pi";
import { LuFileJson } from "react-icons/lu";
import styles from "./FileTree.module.css";

export function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "css":
      return <BsCss className={styles.fileIcon} />;
    case "js":
      return (
        <span className={styles.iconJs}>
          <FaJs className={styles.fileIcon} />
        </span>
      );
    case "jsx":
    case "tsx":
      return (
        <span className={styles.iconTs}>
          <FaReact className={styles.fileIcon} />
        </span>
      );
    case "ts":
      return (
        <span className={styles.iconTs}>
          <BsTypescript className={styles.fileIcon} />
        </span>
      );
    case "py":
      return <FaPython className={styles.fileIcon} />;
    case "cpp":
    case "cxx":
    case "cc":
      return <PiFileCpp className={styles.fileIcon} />;
    case "md":
      return <FaMarkdown className={styles.fileIcon} />;
    case "json":
      return <LuFileJson className={styles.fileIcon} />;
    default:
      return <FaFile className={styles.fileIcon} />;
  }
}
