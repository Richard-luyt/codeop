"use client";

const PINK = "#ffced7";
const SIDEBAR_WIDTH = "240px";

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

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: SIDEBAR_WIDTH,
        height: "100vh",
        borderRight: "1px solid #262626",
        display: "flex",
        flexDirection: "column",
        padding: "20px 0",
        background: "#0d0d0d",
        overflowY: "auto",
      }}
    >
      <div style={{ padding: "0 20px 24px" }}>
        <span style={{ fontSize: "20px", fontWeight: 700 }}>
          <span style={{ color: "#888" }}>{"< /> "}</span>
          <span style={{ color: PINK }}>CodeOp</span>
        </span>
      </div>
      <nav style={{ flex: 1 }}>
        <a
          href="#"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 20px",
            margin: "2px 12px",
            borderRadius: "8px",
            background: "rgba(255, 206, 215, 0.25)",
            color: PINK,
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          <span style={{ opacity: 0.9 }}>📁</span> Repositories
        </a>
        {["Pull Requests", "Issues", "Teams", "Analytics"].map((label) => (
          <a
            key={label}
            href="#"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 20px",
              margin: "2px 12px",
              borderRadius: "8px",
              color: "#a3a3a3",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            <span style={{ opacity: 0.7 }}>•</span> {label}
          </a>
        ))}
      </nav>
      <div style={{ padding: "16px 20px 8px", borderTop: "1px solid #262626" }}>
        <div style={{ fontSize: "11px", color: "#737373", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Recent
        </div>
        {recentRepos.length > 0
          ? recentRepos.slice(0, 3).map((r) => (
              <a
                key={r.fullName ?? r.name}
                href="#"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 0",
                  color: "#a3a3a3",
                  textDecoration: "none",
                  fontSize: "13px",
                }}
              >
                <span style={{ opacity: 0.8 }}>📂</span> {r.name}
              </a>
            ))
          : (
              <div style={{ color: "#525252", fontSize: "13px" }}>Coming soon</div>
            )}
      </div>
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid #262626",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "#333",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {user?.image ? (
            <img src={user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#404040", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#a3a3a3" }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: 500, color: "#e5e5e5" }}>{displayName}</div>
          <div style={{ fontSize: "12px", color: "#737373" }}>@{username}</div>
        </div>
        <button
          type="button"
          aria-label="User menu"
          style={{ background: "none", border: "none", color: "#737373", cursor: "pointer", padding: "4px" }}
        >
          ⋮
        </button>
      </div>
    </aside>
  );
}
