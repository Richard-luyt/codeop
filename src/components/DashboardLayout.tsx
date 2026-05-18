"use client";

import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardMain from "./DashboardMain";
import styles from "./DashboardChrome.module.css";

export default function DashboardLayout({
  user,
  recentRepos = [],
  children,
}: {
  user?: { name?: string | null; email?: string | null; image?: string | null } | null;
  recentRepos?: { name: string; fullName?: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <DashboardSidebar user={user} recentRepos={recentRepos} />
      <div className={styles.contentCol}>
        <DashboardHeader />
        <DashboardMain>{children}</DashboardMain>
      </div>
    </div>
  );
}
