import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { room, payload } = await req.json();
    if (!room || !payload) {
      return NextResponse.json({ error: "Missing room or payload" }, { status: 400 });
    }

    // Validate room format loosely
    if (typeof room !== "string" || room.length > 80) {
      return NextResponse.json({ error: "Invalid room" }, { status: 400 });
    }

    const redis = getRedis();
    // Publish encrypted payload to the room channel
    await redis.publish(`room:${room}`, payload);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("publish error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
