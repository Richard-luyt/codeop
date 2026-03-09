"use server";

import { auth } from "@/auth";
import { db } from "@/db/db";
import { accounts, projectTable, sessions } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { Octokit } from "octokit";

type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; status: number };

export async function getUserRepo(): Promise<ActionResponse<any>> {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Unauthorized", status: 401 };
  }
  const account = await db.query.accounts.findFirst({
    where: eq(accounts?.userId!, session?.user?.id!),
  });
  if (!account) {
    return { success: false, error: "acount not found", status: 404 };
  }
  try {
    const octokit = new Octokit({ auth: account.access_token });
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
    });
    const data = repos.map((repo) => ({
      id: repo.id,
      fullName: repo.full_name,
      name: repo.name,
      owner: repo.owner.login,
      description: repo.description ?? null,
      private: repo.private ?? null,
      language: repo.language ?? null,
      stargazers_count: repo.stargazers_count ?? null,
      forks_count: repo.forks_count ?? null,
      updated_at: repo.updated_at ?? null,
    }));

    return { success: true, data: data };
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      err!.status == 401
    ) {
      const result = await db
        .delete(sessions)
        .where(eq(sessions.userId, session?.user?.id!));
      return { success: false, error: "user didn't signin", status: 401 };
    } else {
      console.log(err);
      return { success: false, error: "an error occured", status: 404 };
    }
  }
}

export async function syncProjectTree(
  projectId: number,
): Promise<ActionResponse<any>> {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Unauthorized", status: 401 };
  }
  const account = await db.query.accounts.findFirst({
    where: eq(accounts?.userId!, session?.user?.id!),
  });
  try {
    const project = await db.query.projectTable.findFirst({
      where: eq(projectTable.id, projectId),
    });
    const octokit = new Octokit({
      auth: account?.access_token,
    });
    const { data: refData } = await octokit.rest.git.getRef({
      owner: project?.repoOwner!,
      repo: project?.repoName!,
      ref: "heads/main",
    });
    const { data: treeData } = await octokit.rest.git.getTree({
      owner: project?.repoOwner!,
      repo: project?.repoName!,
      tree_sha: refData.object.sha,
      recursive: "1",
    });
    await db
      .update(projectTable)
      .set({
        fileTree: treeData.tree,
        lastSyncedAt: new Date(),
      })
      .where(eq(projectTable.id, projectId));
    return { success: true, data: treeData.tree };
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      err!.status == 401
    ) {
      const result = await db
        .delete(sessions)
        .where(eq(sessions.userId, session?.user?.id!));
      return { success: false, error: "user didn't signin", status: 401 };
    } else {
      console.log(err);
      return { success: false, error: "an error occured", status: 404 };
    }
  }
}

export async function createProject(name: string, owner: string) {
  const existing = await db.query.projectTable.findFirst({
    where: and(
      eq(projectTable.repoName, name),
      eq(projectTable.repoOwner, owner),
    ),
  });
  if (existing) return existing.id;
  const [newProject] = await db
    .insert(projectTable)
    .values({
      title: name,
      repoName: name,
      repoOwner: owner,
      teamID: 0,
    })
    .returning();
  return newProject.id;
}

export async function getFileContent(
  repoOwner: string,
  repoName: string,
  path: string,
): Promise<ActionResponse<any>> {
  const session = await auth();
  const account = await db.query.accounts.findFirst({
    where: eq(accounts?.userId!, session?.user?.id!),
  });
  try {
    const octokit = new Octokit({ auth: account?.access_token });
    const { data } = await octokit.rest.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: path,
    });

    if ("content" in data) {
      return {
        success: true,
        data: Buffer.from(data.content, "base64").toString("utf-8"),
      };
    }
    return { success: false, error: "can't read content", status: 404 };
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      err!.status == 401
    ) {
      const result = await db
        .delete(sessions)
        .where(eq(sessions.userId, session?.user?.id!));
      return { success: false, error: "user didn't signin", status: 401 };
    } else {
      console.log(err);
      return { success: false, error: "an error occured", status: 404 };
    }
  }
}
