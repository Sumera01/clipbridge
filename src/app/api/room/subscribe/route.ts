import { NextRequest } from "next/server";
import { getRedisSubscriber } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get("room");

  if (!room || room.length > 80) {
    return new Response("Invalid room", { status: 400 });
  }

  const encoder = new TextEncoder();
  let subscriber: ReturnType<typeof getRedisSubscriber> | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      subscriber = getRedisSubscriber();

      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          // client disconnected
        }
      };

      // Heartbeat every 25s to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25_000);

      subscriber.subscribe(`room:${room}`, (err) => {
        if (err) {
          console.error("subscribe error", err);
          controller.close();
        }
      });

      subscriber.on("message", (_channel: string, message: string) => {
        send(message);
      });

      subscriber.on("error", () => {
        clearInterval(heartbeat);
        controller.close();
      });

      // Clean up when client disconnects
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        subscriber?.unsubscribe();
        subscriber?.disconnect();
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
