/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/feedback/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import {
  FeedbackStatus,
  IFeedbackResponse,
  IFeedbackUpdate,
} from "@/src/models/feedback";

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI!;

// Mongoose Schema
const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: [FeedbackStatus.UNREAD, FeedbackStatus.READ],
      default: FeedbackStatus.UNREAD,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "feedbacks" }
);

const Feedback =
  mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
}

// PATCH - Update feedback (mark as read/unread)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body: IFeedbackUpdate = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json<IFeedbackResponse>(
        { success: false, message: "Invalid feedback ID" },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (body.status && !Object.values(FeedbackStatus).includes(body.status)) {
      return NextResponse.json<IFeedbackResponse>(
        { success: false, message: "Invalid status value" },
        { status: 400 }
      );
    }

    await connectDB();

    const updateData: any = {};
    if (body.status) updateData.status = body.status;

    const result = await Feedback.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!result) {
      return NextResponse.json<IFeedbackResponse>(
        { success: false, message: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<IFeedbackResponse>({
      success: true,
      message: "Feedback updated successfully",
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json<IFeedbackResponse>(
      { success: false, message: "Failed to update feedback" },
      { status: 500 }
    );
  }
}

// DELETE - Delete feedback
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json<IFeedbackResponse>(
        { success: false, message: "Invalid feedback ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await Feedback.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json<IFeedbackResponse>(
        { success: false, message: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<IFeedbackResponse>({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json<IFeedbackResponse>(
      { success: false, message: "Failed to delete feedback" },
      { status: 500 }
    );
  }
}
