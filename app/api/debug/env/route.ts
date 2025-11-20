// app/api/debug/env/route.ts
// TEMPORARY - HAPUS SETELAH DEBUGGING SELESAI!

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  return NextResponse.json({
    // Environment checks
    nextauthUrl: process.env.NEXTAUTH_URL || "NOT SET",
    nextauthSecretExists: !!process.env.NEXTAUTH_SECRET,
    nodeEnv: process.env.NODE_ENV,

    // Session info
    hasSession: !!session,
    sessionUser: session?.user?.username || "No user",

    // Cookie info (dari request headers akan di-check di client)
    timestamp: new Date().toISOString(),
  });
}
