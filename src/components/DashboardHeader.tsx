"use client";

const PINK = "#ffced7";

export default function DashboardHeader() {
  return (
    <header
      style={{
        borderBottom: "1px solid #262626",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: "24px",
        flexWrap: "wrap",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#fff" }}>
        Repositories
      </h1>
      <div
        style={{
          flex: 1,
          minWidth: "200px",
          maxWidth: "400px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 14px",
          background: "#1a1a1a",
          borderRadius: "8px",
          border: "1px solid #333",
        }}
      >
        <span style={{ color: "#737373" }}>🔍</span>
        <input
          type="search"
          placeholder="Search repositories..."
          style={{
            flex: 1,
            background: "none",
            border: "none",
            outline: "none",
            color: "#e5e5e5",
            fontSize: "14px",
          }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          type="button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            background: PINK,
            color: "#000",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          + New Repo
        </button>
        <button
          type="button"
          aria-label="Notifications"
          style={{ background: "#262626", border: "none", color: "#e5e5e5", width: "40px", height: "40px", borderRadius: "8px", cursor: "pointer" }}
        >
          🔔
        </button>
        <button
          type="button"
          aria-label="Menu"
          style={{ background: "#262626", border: "none", color: "#e5e5e5", width: "40px", height: "40px", borderRadius: "8px", cursor: "pointer" }}
        >
          ⋮
        </button>
      </div>
    </header>
  );
}
