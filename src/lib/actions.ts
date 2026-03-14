"use server";
import { db } from "@/db/db";
import { users, commentTable, accounts } from "../db/schema";
import { eq } from "drizzle-orm";
import { EventEmitter } from "events";
import { auth } from "@/auth";
import { GlobalError } from "next/dist/build/templates/app-page";
import { globalEvents } from "./events";

export async function sendCommentAction(
  toEmail: string,
  message: string,
  projectID: string,
  targetLine: number,
  authorID: string,
  path: string,
) {
  const request = await db.query.users.findFirst({
    where: eq(users.email, toEmail),
  });

  if (!request) {
    return { success: false, error: "User not found" };
  }

  const newComment = {
    authorID: authorID,
    projectID: projectID,
    toWhomID: request.id,
    content: message,
    lineNumber: targetLine,
  };

  const result = await db.insert(commentTable).values(newComment);

  const user = await db.query.users.findFirst({
    where: eq(users.id, newComment.authorID),
  });

  const returnComment = {
    authorID: authorID,
    projectID: projectID,
    toWhomID: request.id,
    content: message,
    lineNumber: targetLine,
    name: user!.name,
    path: path,
  };

  globalEvents.emit("new-comment", returnComment);

  return { success: true };
}

export async function getCommentAction() {
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

  const comments = await db.query.commentTable.findMany({
    where: (comments, { and, eq }) =>
      and(
        eq(commentTable.toWhomID, account?.userId!),
        eq(commentTable.checkedByUser, false),
      ),
  });

  return { success: true, data: comments };
}
