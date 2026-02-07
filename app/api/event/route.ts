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

    // Validasi shifts untuk schedule type "selected"
    if (schedule.type === "selected") {
      if (!schedule.schedule || !Array.isArray(schedule.schedule)) {
        return NextResponse.json(
          {
            success: false,
            error: "Schedule must be an array for 'selected' type",
          },
          { status: 400 }
        );
      }

      // Validasi setiap schedule item harus punya shifts
      for (const item of schedule.schedule) {
        if (
          !item.shifts ||
          !Array.isArray(item.shifts) ||
          item.shifts.length === 0
        ) {
          return NextResponse.json(
            {
              success: false,
              error: "Each schedule item must have at least one shift",
            },
            { status: 400 }
          );
        }

        // Validasi format shift
        for (const shift of item.shifts) {
          if (!shift.startTime || !shift.endTime) {
            return NextResponse.json(
              {
                success: false,
                error: "Each shift must have startTime and endTime",
              },
              { status: 400 }
            );
          }
        }
      }
    }

    // Validasi shifts untuk schedule type "range"
    if (schedule.type === "range") {
      if (!schedule.startDate || !schedule.endDate) {
        return NextResponse.json(
          {
            success: false,
            error: "Range schedule must have startDate and endDate",
          },
          { status: 400 }
        );
      }

      if (
        !schedule.shifts ||
        !Array.isArray(schedule.shifts) ||
        schedule.shifts.length === 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Range schedule must have at least one shift",
          },
          { status: 400 }
        );
      }

      // Validasi format shift
      for (const shift of schedule.shifts) {
        if (!shift.startTime || !shift.endTime) {
          return NextResponse.json(
            {
              success: false,
              error: "Each shift must have startTime and endTime",
            },
            { status: 400 }
          );
        }
      }
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
    console.log(`   Schedule type: ${schedule.type}`);
    if (schedule.type === "selected") {
      console.log(`   Dates: ${schedule.schedule.length} days with shifts`);
    } else {
      console.log(
        `   Range: ${schedule.startDate} to ${schedule.endDate} with ${schedule.shifts.length} shifts per day`
      );
    }

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
