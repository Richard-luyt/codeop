"use client";

import {
  AlertCircle,
  BarChart2,
  Folder,
  GitPullRequest,
  Users,
} from "lucide-react";
import styles from "./DashboardChrome.module.css";

const SIDEBAR_WIDTH = "248px";

export { SIDEBAR_WIDTH };

export default function DashboardSidebar({
  user,
  recentRepos = [],
}: {
  user?: { name?: string | null; email?: string | null; image?: string | null } | null;
  recentRepos?: { name: string; fullName?: string }[];
}) {
  const displayName = user?.name ?? "User";
  const username = user?.email?.split("@")[0] ?? "user";
  const navItems = [
    { label: "Repositories", icon: Folder, active: true },
    { label: "Pull Requests", icon: GitPullRequest, active: false },
    { label: "Issues", icon: AlertCircle, active: false },
    { label: "Teams", icon: Users, active: false },
    { label: "Analytics", icon: BarChart2, active: false },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarBrand}>
        <span className={styles.logoRow}>
          <span className={styles.logoText}>CODEOP</span>
        </span>
      </div>
      <nav className={styles.sidebarNav}>
        {navItems.map(({ label, icon: Icon, active }) => (
          <a
            key={label}
            href="#"
            className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
          >
            <Icon className={styles.navIcon} size={16} strokeWidth={1.75} />
            <span className={styles.navText}>{label}</span>
          </a>
        ))}
      </nav>
      <div className={styles.sidebarSection}>
        <div className={styles.sectionLabel}>Recent</div>
        {recentRepos.length > 0
          ? recentRepos.slice(0, 3).map((r) => (
              <a key={r.fullName ?? r.name} href="#" className={styles.recentLink}>
                {r.name}
              </a>
            ))
          : <div className={styles.emptyHint}>Coming soon</div>}
      </div>
      <div className={styles.profileRow}>
        <div className={styles.avatar}>
          {user?.image ? (
            <img src={user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div className={styles.avatarFallback}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className={styles.profileMeta}>
          <div className={styles.name}>{displayName}</div>
          <div className={styles.handle}>@{username}</div>
        </div>
        <button
          type="button"
          aria-label="User menu"
          className={styles.profileMenu}
        >
          ⋮
        </button>
      </div>
    </aside>
  );
}
