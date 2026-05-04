"use server"

import { Server } from '@hocuspocus/server'
import { jwtVerify } from "jose";
import { eq, sql } from "drizzle-orm";
import { db } from "../../db/db";
import { RoomInfo } from "../../db/schema";

const roomTimers = new Map<number, NodeJS.Timeout>();
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET ?? "");

async function verifyCollabToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey, { algorithms: ["HS256"] });
  return payload as { roomId: number; userId?: string };
}

const server = new Server({
  port: 1234,
  address: '0.0.0.0',

  async onAuthenticate({token, context}) {
    if(!token) {
        throw new Error("missing token");
    }
    const payload = await verifyCollabToken(token); // userId, roomId...

    const room = await db.query.RoomInfo.findFirst({
        where: eq(RoomInfo.roomId, Number(payload.roomId)),
    });
    
    if (!room || !room.state) throw new Error("unauthorized");

    context.roomId = room.roomId;
    context.userId = payload.userId ?? "unknown";
  },

  async onConnect({ context }) {
    const roomId = Number(context.roomId);
    const res = await db.update(RoomInfo).set({people : sql`COALESCE(${RoomInfo.people}, 0) + 1`}).where(eq(RoomInfo.roomId, roomId));
    const timer = roomTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      roomTimers.delete(roomId);
    }
  },

  async onDisconnect({context}) {
    const roomId = Number(context.roomId);
    const res = await db.update(RoomInfo).set({ people: sql`GREATEST(COALESCE(${RoomInfo.people}, 0) - 1, 0)` }).where(eq(RoomInfo.roomId, roomId)).returning({ people: RoomInfo.people });
    const people = res[0].people;
    if (people === 0) {
      const t = setTimeout(async () => {
        
        roomTimers.delete(roomId);
      }, 10_000);
      roomTimers.set(roomId, t);
    }
  },

  async onStoreDocument(data) {
    // 把 data.document 编码后存库
  },

  async onLoadDocument(data) {
    // 读库并 applyUpdate 到 document
  },
});

server.listen();