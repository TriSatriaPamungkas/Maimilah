import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import { Event } from "@/src/models/event";

export async function GET() {
  await connectDB();
  const events = await Event.find({}, { title: 1 }).lean();

  return NextResponse.json({
    db_uri: process.env.MONGODB_URI,
    total: events.length,
    titles: events.map((e) => e.title),
  });
}
