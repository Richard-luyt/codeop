import "dotenv/config";
import { Server } from "@hocuspocus/server";
import { jwtVerify } from "jose";
import { eq, sql } from "drizzle-orm";
//import { Octokit } from "octokit";
import { db } from "../../db/db";

import { RoomInfo, projectTable, accounts } from "../../db/schema";

import * as Y from "yjs";

type CollabPayload = {
  roomId: number;
  userId?: string;
  filepath?: string;
};

const roomTimers = new Map<number, NodeJS.Timeout>();
const roomDocUpdates = new Map<number, Uint8Array>();
const roomLastUser = new Map<number, string>();
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET ?? "");

function encodeGitHubPath(path: string) {
  return path
    .split("/")
    .map((p) => encodeURIComponent(p))
    .join("/");
}

async function githubGetFile(
  owner: string,
  repo: string,
  path: string,
  token: string,
) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeGitHubPath(path)}?ref=main`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) throw new Error(`github get content failed: ${res.status}`);
  const data = await res.json();
  if (!data?.content || !data?.sha)
    throw new Error("invalid github file payload");
  const content = Buffer.from(data.content, "base64").toString("utf8");
  return { sha: data.sha as string, content };
}

async function githubUpdateFile(
  owner: string,
  repo: string,
  path: string,
  token: string,
  content: string,
  sha: string,
  message: string,
) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeGitHubPath(path)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      sha,
      branch: "main",
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`github update failed: ${res.status} ${txt}`);
  }
}

async function verifyCollabToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey, {
    algorithms: ["HS256"],
  });
  return payload as unknown as CollabPayload;
}

async function loadInitialContentFromGitHub(roomId: number, userId?: string) {
  const room = await db.query.RoomInfo.findFirst({
    where: eq(RoomInfo.roomId, roomId),
  });
  if (!room?.repoId || !room.filePath)
    throw new Error("room repo/path missing");
  const project = await db.query.projectTable.findFirst({
    where: eq(projectTable.githubRepoId, String(room.repoId)),
  });
  if (!project) throw new Error("project missing");
  const uid = userId ?? roomLastUser.get(roomId);
  if (!uid) throw new Error("userId missing for initial load");
  const account = await db.query.accounts.findFirst({
    where: eq(accounts.userId, uid),
  });
  if (!account?.access_token)
    throw new Error("github token missing for initial load");
  // const octokit = new Octokit({ auth: account.access_token });
  // const { data } = await octokit.rest.repos.getContent({
  //   owner: project.repoOwner,
  //   repo: project.repoName,
  //   path: room.filePath,
  // });
  // if (!("content" in data)) return "";
  // return Buffer.from(data.content, "base64").toString("utf8");
  const { content } = await githubGetFile(
    project.repoOwner,
    project.repoName,
    room.filePath,
    account.access_token,
  );
  return content;
}

async function pushYDocToGitHub(
  roomId: number,
  content: string,
  userId?: string,
) {
  const room = await db.query.RoomInfo.findFirst({
    where: eq(RoomInfo.roomId, roomId),
  });
  if (!room || !room.repoId || !room.filePath) {
    throw new Error("room/repo info missing");
  }
  const project = await db.query.projectTable.findFirst({
    where: eq(projectTable.githubRepoId, String(room.repoId)),
  });
  if (!project) {
    throw new Error("project not found");
  }
  if (!userId) {
    throw new Error("missing github user id");
  }
  const account = await db.query.accounts.findFirst({
    where: eq(accounts.userId, userId),
  });
  if (!account?.access_token) {
    throw new Error("github token missing");
  }
  // const octokit = new Octokit({ auth: account.access_token });
  // const current = await octokit.rest.repos.getContent({
  //   owner: project.repoOwner,
  //   repo: project.repoName,
  //   path: room.filePath,
  // });
  // if (!("sha" in current.data)) {
  //   throw new Error("target path is not a file");
  // }
  // await octokit.rest.repos.createOrUpdateFileContents({
  //   owner: project.repoOwner,
  //   repo: project.repoName,
  //   path: room.filePath,
  //   message: `chore(collab): sync room ${roomId} content`,
  //   content: Buffer.from(content, "utf8").toString("base64"),
  //   sha: current.data.sha,
  //   branch: "main",
  // });

  const current = await githubGetFile(
    project.repoOwner,
    project.repoName,
    room.filePath,
    account.access_token,
  );

  await githubUpdateFile(
    project.repoOwner,
    project.repoName,
    room.filePath,
    account.access_token,
    content,
    current.sha,
    `chore(collab): sync room ${roomId} content`,
  );
}

const server = new Server({
  port: 1234,
  address: "0.0.0.0",

  async onAuthenticate({ token, context, documentName }) {
    if (!token) {
      throw new Error("missing token");
    }

    console.log("[onAuthenticate:incoming]", {
      doc: documentName,
      hasToken: !!token,
      tokenHead: String(token ?? "").slice(0, 12),
    });

    let payload: CollabPayload;
    try {
      payload = await verifyCollabToken(String(token));
    } catch (e) {
      console.error("[onAuthenticate:jwtVerify failed]", e);
      throw new Error("invalid token");
    }

    const tokenRoomId = Number(payload.roomId);
    //const reqRoomId = Number(documentName);
    const docRoomId = Number(documentName);

    console.log("[auth]", {
      documentName,
      tokenRoomId,
      docRoomId,
      userId: payload.userId,
    });
    if (Number.isNaN(tokenRoomId)) throw new Error("invalid token roomId");
    if (!Number.isNaN(docRoomId) && docRoomId !== tokenRoomId) {
      throw new Error("room mismatch");
    }

    let room;
    try {
      room = await db.query.RoomInfo.findFirst({
        where: eq(RoomInfo.roomId, Number(payload.roomId)),
      });
    } catch (e) {
      console.error("[onAuthenticate room query error]", e);
      throw e;
    }

    if (!room || room.roomStatus != "open") throw new Error("unauthorized");

    context.roomId = room.roomId;
    context.userId = payload.userId ?? "unknown";

    await db
      .update(RoomInfo)
      .set({ people: sql`COALESCE(${RoomInfo.people}, 0) + 1` })
      .where(eq(RoomInfo.roomId, room.roomId));

    console.log("roomID : " + context.roomId);
    console.log("userId : " + context.userId);
  },

  // async onAuthenticate({ context, documentName }) {
  //   context.roomId = Number(documentName);
  //   context.userId = "debug-user";
  //   console.log("[AUTH BYPASS]", documentName);
  // },

  async onConnect({ context }) {
    const roomId = Number(context.roomId);
    if (Number.isNaN(roomId)) {
      console.error("[onConnect] invalid roomId", context.roomId);
      return;
    }
    // const res = await db
    //   .update(RoomInfo)
    //   .set({ people: sql`COALESCE(${RoomInfo.people}, 0) + 1` })
    //   .where(eq(RoomInfo.roomId, roomId));

    roomLastUser.set(roomId, String(context.userId ?? ""));

    const timer = roomTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      roomTimers.delete(roomId);
    }

    console.log(context.roomId);
  },

  async onDisconnect({ context }) {
    const roomId = Number(context.roomId);
    if (Number.isNaN(roomId)) {
      console.error("[onConnect] invalid roomId", context.roomId);
      return;
    }
    const res = await db
      .update(RoomInfo)
      .set({ people: sql`GREATEST(COALESCE(${RoomInfo.people}, 0) - 1, 0)` })
      .where(eq(RoomInfo.roomId, roomId))
      .returning({ people: RoomInfo.people });
    const people = res[0].people;
    if (people === 0) {
      const t = setTimeout(async () => {
        try {
          const update = roomDocUpdates.get(roomId);
          if (!update) {
            await db
              .update(RoomInfo)
              .set({
                people: 0,
                roomStatus: "closed",
                lastError: null,
              })
              .where(eq(RoomInfo.roomId, roomId));
            roomTimers.delete(roomId);
            return;
          }
          const doc = new Y.Doc();
          Y.applyUpdate(doc, update);

          const finalText = doc.getText("content").toString();
          const userId = roomLastUser.get(roomId);

          await pushYDocToGitHub(roomId, finalText, userId);

          await db
            .update(RoomInfo)
            .set({ roomStatus: "closed", people: 0 })
            .where(eq(RoomInfo.roomId, roomId));
        } catch (err) {
          await db
            .update(RoomInfo)
            .set({
              roomStatus: "conflict",
              lastError: String(err),
              people: 0,
            })
            .where(eq(RoomInfo.roomId, roomId));
          console.error("merge failed", err);
        } finally {
          roomTimers.delete(roomId);
        }
      }, 10_000);
      roomTimers.set(roomId, t);
    }
  },

  async onStoreDocument({ documentName, document }) {
    const roomId = Number(documentName);
    const update = Y.encodeStateAsUpdate(document);
    console.log("[onStoreDocument]", roomId, "bytes", update.byteLength);
    roomDocUpdates.set(roomId, update);
  },
  async onLoadDocument({ documentName, document, context }) {
    const roomId = Number(documentName);

    console.log("[onLoadDocument] room", roomId, "user", context?.userId);
    const saved = roomDocUpdates.get(roomId);
    if (saved) {
      console.log("[onLoadDocument] use saved update", saved.byteLength);
      Y.applyUpdate(document, saved);
      return;
    }

    const initial = await loadInitialContentFromGitHub(
      roomId,
      String(context?.userId ?? ""),
    );
    if (!initial) {
      console.warn(
        `[onLoadDocument] empty initial for room ${roomId}, allow empty doc`,
      );
      return;
    }
    const ytext = document.getText("content");
    if (ytext.length === 0) ytext.insert(0, initial);
    const update = Y.encodeStateAsUpdate(document);
    roomDocUpdates.set(roomId, update);
    console.log(
      "[onLoadDocument] initialized from github, bytes:",
      update.byteLength,
    );
  },
});

server.listen();
