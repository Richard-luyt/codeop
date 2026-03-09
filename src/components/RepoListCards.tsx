"use client";

import styles from "./RepoList.module.css";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3776ab",
  "Node.js": "#339933",
  Dart: "#00b4ab",
  Java: "#ed8b00",
  Go: "#00add8",
  Rust: "#ce422b",
  "C++": "#00599c",
  C: "#555555",
};

function languageColor(lang: string | null): string {
  return (lang && LANGUAGE_COLORS[lang]) || "#8b8b8b";
}

function formatUpdated(updated_at: string | null): string {
  if (!updated_at) return "Coming soon";
  try {
    const d = new Date(updated_at);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `Updated ${diffMins} min ago`;
    if (diffHours < 24) return diffHours === 1 ? "Updated 1 hour ago" : `Updated ${diffHours} hours ago`;
    if (diffDays < 7) return diffDays === 1 ? "Updated 1 day ago" : `Updated ${diffDays} days ago`;
    return `Updated ${d.toLocaleDateString()}`;
  } catch {
    return "Coming soon";
  }
}

export default function RepoListCards({
  initialRepos,
  status,
  selectedRepoIdInList,
  setSelectedRepoIdInList,
  loadingId,
  onSync,
}: {
  initialRepos: any[];
  status: string;
  selectedRepoIdInList: number | null;
  setSelectedRepoIdInList: (fn: (prev: number | null) => number | null) => void;
  loadingId: number | null;
  onSync: (repo: any) => void;
}) {
  return (
    <>
      {status && (
        <div
          className={`${styles.statusBar} ${
            status.startsWith("✅") ? styles.statusBarSuccess : status.startsWith("❌") ? styles.statusBarError : styles.statusBarInfo
          }`}
        >
          {status}
        </div>
      )}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.headerTitle}>Your Repositories</h2>
          <p className={styles.headerCount}>
            {initialRepos.length} {initialRepos.length === 1 ? "repository" : "repositories"} found.
          </p>
        </div>
        <div className={styles.filterRow}>
          <select className={styles.select}>
            <option>All</option>
          </select>
          <select className={styles.select}>
            <option>Recently updated</option>
          </select>
        </div>
      </div>
      <ul className={styles.repoList}>
        {initialRepos.map((repo) => (
          <li
            key={repo.id}
            onClick={() => setSelectedRepoIdInList((prev) => (prev === repo.id ? null : repo.id))}
            className={`${styles.repoCard} ${selectedRepoIdInList === repo.id ? styles.repoCardSelected : ""}`}
          >
            <div className={styles.repoCardHeader}>
              <span className={styles.repoName}>{repo.name}</span>
              <span className={`${styles.badge} ${repo.private ? styles.badgePrivate : styles.badgePublic}`}>
                {repo.private ? "Private" : "Public"}
              </span>
            </div>
            <p className={styles.repoDescription}>
              {repo.description || "Coming soon"}
            </p>
            <div className={styles.repoMeta}>
              <span className={styles.metaItem}>
                <span className={styles.langDot} style={{ background: languageColor(repo.language) }} />
                {repo.language ?? "undefined"}
              </span>
              <span className={styles.metaItemSmall}>★ {repo.stargazers_count ?? "—"}</span>
              <span className={styles.metaItemSmall}>🍴 {repo.forks_count ?? "—"}</span>
              <span>{formatUpdated(repo.updated_at)}</span>
            </div>
            {selectedRepoIdInList === repo.id && (
              <div className={styles.actionRow} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onSync(repo)}
                  disabled={loadingId !== null}
                  className={`${styles.btnOpenCode} ${loadingId === repo.id ? styles.btnOpenCodeLoading : ""} ${loadingId !== null && loadingId !== repo.id ? styles.btnOpenCodeDisabled : ""}`}
                >
                  <span>{"< />"}</span> {loadingId === repo.id ? "Syncing…" : "Open Code"}
                </button>
                <button type="button" className={styles.btnSecondary}>
                  PRs (Coming soon)
                </button>
                <button type="button" className={styles.btnIconOnly}>
                  ⚙ Settings
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
