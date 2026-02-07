// src/models/registration.ts
import mongoose, { Schema, Document } from "mongoose";

// Interface untuk selected date with shift
export interface ISelectedDateShift {
  date: string;
  shiftIndex: number; // Index of the shift in the event's schedule
}

export interface IRegistration extends Document {
  eventId: string;
  name: string;
  email: string;
  phone: string;
  domisili?: string;
  source?: string;
  reason?: string;
  selectedDates?: string[]; // Legacy support - just dates
  selectedDateShifts?: ISelectedDateShift[]; // New - dates with specific shifts
  registeredAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    eventId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    domisili: String,
    source: String,
    reason: String,
    selectedDates: [String], // Legacy - untuk backward compatibility
    selectedDateShifts: [
      {
        date: { type: String, required: true },
        shiftIndex: { type: Number, required: true },
      },
    ],
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index untuk cepat query
RegistrationSchema.index({ eventId: 1, email: 1 });
RegistrationSchema.index({ eventId: 1, registeredAt: -1 });

export default mongoose.models.Registration ||
  mongoose.model<IRegistration>("Registration", RegistrationSchema);
