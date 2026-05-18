"use client";

import styles from "./DashboardChrome.module.css";

export default function DashboardMain({ children }: { children: React.ReactNode }) {
  return <main className={styles.main}>{children}</main>;
}
