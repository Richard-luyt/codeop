"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useEditorStore } from "@/app/store/useEditorStore";

export default function DashboardHeader() {
  useEffect(() => {
    const eventSource = new EventSource("/api/notifications");
    eventSource.onmessage = (event) => {
      const newComment = JSON.parse(event.data);
      toast.message("new comment", {
        description: `${newComment.name} : "${newComment.content}"`,
        action: {
          label: "to specific line",
          onClick: () => {
            console.log(`to line, ${newComment.lineNumber}`);
            useEditorStore
              .getState()
              .triggerJump(
                newComment.projectID,
                newComment.path,
                newComment.lineNumber,
                {
                  authorName: newComment.name,
                  content: newComment.content,
                },
              );
          },
        },
      });
    };

    eventSource.onerror = () => {
      console.log("can not connect");
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

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
      <h1
        style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#fff" }}
      >
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
            fontSize: "16px",
          }}
        />
      </div>
    </header>
  );
}
