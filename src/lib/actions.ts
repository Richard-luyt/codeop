"use server";
import { db } from "@/db/db";
import { users, commentTable, accounts, RoomInfo } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { EventEmitter } from "events";
import { auth } from "@/auth";
import { GlobalError } from "next/dist/build/templates/app-page";
import bcrypt from "bcryptjs";
import { globalEvents } from "./events";

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('6h')
    .sign(secretKey);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

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

export async function getRoomInfo(filepath : string, repoId : number | null) {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Unauthorized", status: 401 };
  }
  if(!filepath) {
    return {success : false, error : "no file path"};
  }
  if(!repoId) {
    return {success : false, error : "no repo ID"}; 
  }
  const room = await db.query.RoomInfo.findFirst({
    where : (RoomInfo, {and, eq}) => 
      and (
        eq(RoomInfo.filePath, filepath),
        eq(RoomInfo.repoId, repoId),
      )
  });
  if(!room) {
    return {success : true, data : null};
  }
  return {success : true, data : room};
}

export async function createRoomAction(repoId : number | null, filepath : string, password : string) {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Unauthorized", status: 401 };
  }
  if(repoId == null || !filepath || !password) {
    return {success : false, error : "missing information"};
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const res = await db.insert(RoomInfo).values({
    repoId : repoId,
    filePath : filepath,
    people : 0,
    passwordHash : passwordHash,
    state : true,
  }).returning();
  if(res.length === 0) {
    return {success : false, error : "can not create room"};
  }
  const payload = {
    user : session.user?.id,
    roomId : res[0].roomId,
    filepath : res[0].filePath,
  };
  const JWT = await signToken(payload);
  return {success : true, data : res[0].roomId, JWT : JWT, error : undefined};
}

export async function joinRoomAction(roomId : number, password : string) {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Unauthorized"};
  }
  if(!roomId || !password) {
    return {success : false, error : "missing information"};
  }
  const room = await db.query.RoomInfo.findFirst({
    where : 
        eq(RoomInfo.roomId, roomId),
  });
  if(!room) {
    return {success : false, error : "can not find room"};
  }
  const hash = room.passwordHash ?? "";
  const ok = await bcrypt.compare(password, hash);
  if(!ok) {
    return {success : false, error : "wrong password"};
  }
  //const res = await db.update(RoomInfo).set({people : sql`${RoomInfo.people} + 1`}).where(eq(RoomInfo.roomId, roomId));

  const payload = {
    user : session.user?.id,
    roomId : room.roomId,
    filepath : room.filePath,
  };
  const JWT = await signToken(payload);

  return { success: true, data: room, JWT : JWT, error : null};
}

export async function leaveRoomAction(roomId : number) {
  if(!roomId) {
    return {success : false, error : "missing information"};
  }
  const room = await db.query.RoomInfo.findFirst({
    where : eq(RoomInfo.roomId, roomId),
  });
  if(!room){
    return {success : false, error : "can not find room"};
  }
  //const res = await db.update(RoomInfo).set({people : sql`${RoomInfo.people} - 1`}).where(eq(RoomInfo.roomId, roomId));
  // if(!res) {
  //   return {success : false, error : "can not update db"};
  // }
  return { success: true, data: null};
}