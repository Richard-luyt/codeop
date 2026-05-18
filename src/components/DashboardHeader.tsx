"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useEditorStore } from "@/app/store/useEditorStore";
import styles from "./DashboardChrome.module.css";

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
    <header className={styles.header}>
      <div className={styles.searchWrap}>
        <span aria-hidden className={styles.searchIcon}>⌕</span>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search repositories..."
        />
      </div>
    </header>
  );
}
