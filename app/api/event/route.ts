/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { Event, connectDB } from "@/src/models/event";

// ✅ GET /api/event - Ambil semua event dari DB
export async function GET(_req: NextRequest) {
  try {
    await connectDB();

    const events = await Event.find({}).sort({ createdAt: -1 }).lean();

    console.log(`📦 [GET /api/event] Fetched ${events.length} events`);

    if (!events || events.length === 0) {
      console.warn("⚠️ No events found in database");
    }

    // Transform ID agar konsisten di frontend
    const transformedEvents = events.map((event: any) => ({
      ...event,
      id: event._id.toString(),
      _id: event._id.toString(),
    }));

    return NextResponse.json(
      {
        success: true,
        data: transformedEvents,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ [GET /api/event] Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch events",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ✅ POST /api/event - Tambah event baru ke DB
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      title,
      location,
      quota,
      description,
      schedule,
      benefits,
      participants,
    } = body;

    // Validasi field wajib
    if (!title || !location || !quota) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, location, quota",
        },
        { status: 400 }
      );
    }

    // Validasi format schedule
    if (!schedule || !schedule.type) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing schedule data",
        },
        { status: 400 }
      );
    }

    // Buat instance event baru
    const newEvent = new Event({
      title,
      description: description || "",
      location,
      quota,
      schedule,
      benefits: benefits || [],
      participants: participants || [],
    });

    await newEvent.save();

    console.log(`✅ [POST /api/event] New event created: ${newEvent.title}`);

    return NextResponse.json(
      {
        success: true,
        message: "Event created successfully",
        data: {
          ...newEvent.toJSON(),
          id: newEvent._id.toString(),
          _id: newEvent._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ [POST /api/event] Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create event",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
