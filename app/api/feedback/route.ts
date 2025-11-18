// app/api/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import {
  FeedbackModel,
  IFeedbackInput,
  IFeedbackResponse,
  FeedbackStatus,
} from "@/src/models/feedback";

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

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

// GET - Fetch all feedbacks
export async function GET() {
  try {
    await connectDB();

    const docs = await Feedback.find({}).sort({ createdAt: -1 }).lean();

    // Convert to frontend format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const feedbacks = docs.map((doc: any) => ({
      _id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      message: doc.message,
      status: doc.status,
      createdAt: doc.createdAt.toISOString(),
    }));

    return NextResponse.json<IFeedbackResponse>({
      success: true,
      feedbacks,
    });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return NextResponse.json<IFeedbackResponse>(
      { success: false, message: "Failed to fetch feedbacks" },
      { status: 500 }
    );
  }
}

// POST - Submit new feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: IFeedbackInput = {
      name: body.name,
      email: body.email,
      message: body.message,
    };

    // Validate using Model
    const validation = FeedbackModel.validateInput(input);
    if (!validation.valid) {
      return NextResponse.json<IFeedbackResponse>(
        {
          success: false,
          message: validation.errors.join(", "),
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Create new feedback document
    const feedback = new Feedback({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      message: input.message.trim(),
      status: FeedbackStatus.UNREAD,
      createdAt: new Date(),
    });

    await feedback.save();

    // Convert to frontend format
    const result = {
      _id: feedback._id.toString(),
      name: feedback.name,
      email: feedback.email,
      message: feedback.message,
      status: feedback.status,
      createdAt: feedback.createdAt.toISOString(),
    };

    return NextResponse.json<IFeedbackResponse>({
      success: true,
      message: "Feedback submitted successfully",
      feedback: result,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json<IFeedbackResponse>(
      { success: false, message: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
