/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/event/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Event, connectDB } from "@/src/models/event";

// Definisikan tipe params sebagai Promise
type RouteParams = {
  params: Promise<{ id: string }>;
};

// ✅ GET /api/event/[id] - Get single event
export async function GET(
  _req: NextRequest,
  { params }: RouteParams // Update tipe di sini
) {
  try {
    await connectDB();

    // 1. Await params sebelum menggunakannya
    const { id } = await params;

    const event = await Event.findById(id).lean();

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...event,
          id: event._id.toString(),
          _id: event._id.toString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ [GET /api/event/[id]] Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch event",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ✅ PUT /api/event/[id] - Update event
export async function PUT(
  req: NextRequest,
  { params }: RouteParams // Update tipe di sini
) {
  try {
    await connectDB();

    // 1. Await params sebelum menggunakannya
    const { id } = await params;

    const body = await req.json();
    const { title, description, location, quota, schedule, benefits } = body;

    // Validasi schedule jika ada perubahan (kode validasi sama seperti sebelumnya)
    if (schedule) {
      if (!schedule.type) {
        return NextResponse.json(
          { success: false, error: "Schedule type is required" },
          { status: 400 }
        );
      }

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
    }

    // Update event menggunakan 'id' yang sudah di-await
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(title && { title }),
          ...(description && { description }),
          ...(location && { location }),
          ...(quota && { quota }),
          ...(schedule && { schedule }),
          ...(benefits && { benefits }),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    console.log(
      `✅ [PUT /api/event/[id]] Event updated: ${updatedEvent.title}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Event updated successfully",
        data: {
          ...updatedEvent.toJSON(),
          id: updatedEvent._id.toString(),
          _id: updatedEvent._id.toString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ [PUT /api/event/[id]] Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update event",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ✅ DELETE /api/event/[id] - Delete event
export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams // Update tipe di sini
) {
  try {
    await connectDB();

    // 1. Await params sebelum menggunakannya (Ini yang menyebabkan error sebelumnya)
    const { id } = await params;

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
        },
        { status: 404 }
      );
    }

    console.log(
      `✅ [DELETE /api/event/[id]] Event deleted: ${deletedEvent.title}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Event deleted successfully",
        data: {
          id: deletedEvent._id.toString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ [DELETE /api/event/[id]] Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete event",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
