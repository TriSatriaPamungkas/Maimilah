/* eslint-disable @typescript-eslint/no-explicit-any */
// src/models/Event.ts
import mongoose, { Schema, model, models, Document, Types } from "mongoose";

// =====================
// 🔹 TypeScript Interfaces
// =====================
interface IScheduleItem {
  date: string;
  startTime: string;
  endTime: string;
}

interface ISchedule {
  type: "selected" | "range";
  schedule?: IScheduleItem[];
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

interface IEvent {
  title: string;
  description: string;
  location: string;
  quota: number;
  schedule: ISchedule;
  benefits: string[];
  participants: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Extend Document untuk Mongoose
interface IEventDocument extends IEvent, Document {
  _id: Types.ObjectId;
  id: string;
}

// =====================
// 🔹 Schema Definitions
// =====================
const scheduleItemSchema = new Schema<IScheduleItem>(
  {
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const scheduleSchema = new Schema<ISchedule>(
  {
    type: { type: String, enum: ["selected", "range"], required: true },
    schedule: [scheduleItemSchema],
    startDate: String,
    endDate: String,
    startTime: String,
    endTime: String,
  },
  { _id: false }
);

const eventSchema = new Schema<IEventDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    quota: { type: Number, required: true, min: 1 },
    schedule: { type: scheduleSchema, required: true },
    benefits: { type: [String], default: [] },
    participants: { type: [String], default: [] },
  },
  {
    timestamps: true,
    collection: "events",
  }
);

// Virtual field for easier JSON serialization
eventSchema.virtual("id").get(function (this: IEventDocument) {
  return this._id.toString();
});

eventSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

// =====================
// 🔹 Database Connection Helper
// =====================
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error("❌ MONGODB_URI not defined");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ MongoDB Connected (Event Model)");
};

// =====================
// 🔹 Model Export
// =====================
const Event =
  (models.Event as mongoose.Model<IEventDocument>) ||
  model<IEventDocument>("Event", eventSchema);

export { Event, connectDB };
export type { IEvent, IEventDocument, ISchedule, IScheduleItem };
