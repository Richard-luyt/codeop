"use client";

import DashboardSidebar, { SIDEBAR_WIDTH } from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardMain from "./DashboardMain";

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
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0d0d0d",
        color: "#e5e5e5",
      }}
    >
      <DashboardSidebar user={user} recentRepos={recentRepos} />
      <div
        style={{
          marginLeft: SIDEBAR_WIDTH,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: "100vh",
        }}
      >
        <DashboardHeader />
        <DashboardMain>{children}</DashboardMain>
      </div>
    </div>
  );
}
