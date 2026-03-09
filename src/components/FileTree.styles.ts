import type { CSSProperties } from "react";

/** Style objects for FileTree - use with className from FileTree.module.css */
export const fileTreeStyles = {
  panel: {
    background: "#252526",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  } as CSSProperties,
  header: {
    padding: "8px 12px 6px",
    borderBottom: "1px solid #333",
    flexShrink: 0,
  } as CSSProperties,
  headerTitle: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#BBBBBB",
    letterSpacing: "0.5px",
  } as CSSProperties,
  scroll: {
    flex: 1,
    overflow: "auto",
    padding: "4px 0",
  } as CSSProperties,
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  } as CSSProperties,
  row: {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "2px 8px 2px 0",
    minHeight: "22px",
    background: "transparent",
    color: "#CCCCCC",
    fontSize: "13px",
  } as CSSProperties,
  rowSelected: {
    background: "#094771",
    color: "#FFFFFF",
  } as CSSProperties,
  rowHover: {
    background: "rgba(255,255,255,0.06)",
  } as CSSProperties,
  chevron: {
    width: "16px",
    flexShrink: 0,
    color: "#CCCCCC",
    fontSize: "10px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  } as CSSProperties,
  chevronOpen: {
    transform: "rotate(90deg)",
  } as CSSProperties,
  folderIcon: {
    color: "#f7df1e",
    display: "inline-flex",
    alignItems: "center",
  } as CSSProperties,
  folderIconSvg: {
    fontSize: "16px",
    flexShrink: 0,
  } as CSSProperties,
  spacer: {
    width: "16px",
    flexShrink: 0,
  } as CSSProperties,
  fileIconWrap: {
    display: "inline-flex",
    alignItems: "center",
    color: "inherit",
  } as CSSProperties,
  fileIcon: {
    fontSize: "16px",
    flexShrink: 0,
  } as CSSProperties,
  iconJs: {
    color: "#f7df1e",
  } as CSSProperties,
  iconTs: {
    color: "#3178c6",
  } as CSSProperties,
  label: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  } as CSSProperties,
  langDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  } as CSSProperties,
};
