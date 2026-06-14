import Ably from "ably";
import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ABLY_API_KEY not set" }, { status: 500 });
  }
  const client = new Ably.Rest(apiKey);
  const tokenRequest = await client.auth.createTokenRequest({
    ttl: 3600_000,
    capability: { "*": ["subscribe", "publish"] },
  });
  return NextResponse.json(tokenRequest);
}
