/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/event/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/authOptions";
import { connectDB } from "@/src/lib/mongodb";
import { Event } from "@/src/models/event";

// ✅ GET - Fetch single event by ID (Public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Support Next.js 15+ async params
    await connectDB();

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: "Event tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil data event",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ✅ PUT - Update event (Protected - Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized - Please login",
        },
        { status: 401 }
      );
    }

    // Optional: Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden - Admin access required",
        },
        { status: 403 }
      );
    }

    const { id } = await params; // Support Next.js 15+ async params
    await connectDB();

    const body = await req.json();

    // Log untuk debugging
    console.log("Updating event ID:", id);
    console.log("Update data:", body);

    const updatedEvent = await Event.findByIdAndUpdate(id, body, {
      new: true, // Return updated document
      runValidators: true, // Run mongoose validators
    });

    if (!updatedEvent) {
      return NextResponse.json(
        {
          success: false,
          error: "Event tidak ditemukan",
        },
        { status: 404 }
      );
    }

    console.log("Event updated successfully:", updatedEvent._id);

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: "Event berhasil diupdate",
    });
  } catch (error: any) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengupdate event",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ✅ DELETE - Hapus event (Protected - Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized - Please login",
        },
        { status: 401 }
      );
    }

    // Optional: Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden - Admin access required",
        },
        { status: 403 }
      );
    }

    const { id } = await params; // Support Next.js 15+ async params
    await connectDB();

    console.log("Deleting event ID:", id);

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return NextResponse.json(
        {
          success: false,
          error: "Event tidak ditemukan",
        },
        { status: 404 }
      );
    }

    console.log("Event deleted successfully:", deletedEvent._id);

    return NextResponse.json({
      success: true,
      message: "Event berhasil dihapus",
      data: deletedEvent,
    });
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal menghapus event",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
