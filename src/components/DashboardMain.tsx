"use client";

export default function DashboardMain({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ flex: 1, overflow: "auto", padding: "24px" }}>
      {children}
    </main>
  );
}
