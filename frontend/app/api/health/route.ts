import { NextResponse } from "next/server";
import { MATH_KNOWLEDGE_BASE } from "@/lib/mathRagEngine";

export const runtime = "nodejs";

export async function GET() {
  const startTime = Date.now();
  const uptimeSeconds = Math.floor(process.uptime());

  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    environment: process.env.NODE_ENV || "production",
    services: {
      web: "up",
      ragEngine: {
        status: "ready",
        chunksCount: MATH_KNOWLEDGE_BASE.length,
      },
      supabase: {
        configured: Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY)),
      },
    },
    latencyMs: Date.now() - startTime,
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
