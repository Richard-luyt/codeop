"use server";
import { db } from "@/db/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export async function sendCommentAction(
  toEmail: string,
  message: string,
  projectID: number,
  targetLine: number,
  authorID: string,
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
    createdAt: Date.now(),
    lineNumber: targetLine,
  };
  return { success: true };
}
