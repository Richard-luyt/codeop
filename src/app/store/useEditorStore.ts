import { create } from "zustand";

export interface CommentPayload {
  authorName: string;
  content: string;
}

interface EditorState {
  jumpCommand: {
    repoId: string;
    filePath: string;
    line: number;
    timestamp: number;
    payload?: CommentPayload;
  } | null;
  triggerJump: (
    repoId: string,
    filePath: string,
    line: number,
    payload?: CommentPayload,
  ) => void;
  clearJumpCommand: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  jumpCommand: null,
  triggerJump: (repoId, filePath, line, payload) =>
    set({
      jumpCommand: { repoId, filePath, line, timestamp: Date.now(), payload },
    }),
  clearJumpCommand: () => set({ jumpCommand: null }),
}));
