export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { EventEmitter, on } from "events";
import { globalEvents } from "@/lib/events";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const stream = new ReadableStream({
    start(controller) {
      const onComment = (data: any) => {
        console.log("收到事件，目标用户:", data.toWhomID, "当前 Session 用户:", session.user?.id);
        if (data.toWhomID === session.user?.id) {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          try {
            controller.enqueue(new TextEncoder().encode(message));
          } catch (e) {
            console.error("Error when sending");
            globalEvents.off("new-comment", onComment);
          }
        }
      };
      globalEvents.on("new-comment", onComment);

      request.signal.addEventListener("abort", () => {
        globalEvents.off("new-comment", onComment);
        try {
          controller.close();
        } catch (e) {}
      });
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
