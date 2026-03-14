export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { EventEmitter, on } from "events";
import { globalEvents } from "@/lib/events";

export async function GET() {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const stream = new ReadableStream({
    start(controller) {
      const onComment = (data: any) => {
        if (data.toWhomID === session.user?.id) {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(new TextEncoder().encode(message));
        }
      };
      globalEvents.on("new-comment", onComment);
      return () => globalEvents.off("new-comment", onComment);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
