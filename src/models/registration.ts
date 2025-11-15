import mongoose, { Schema, Document } from "mongoose";

export interface IRegistration extends Document {
  eventId: string;
  name: string;
  email: string;
  phone: string;
  domisili?: string;
  source?: string;
  reason?: string;
  selectedDates?: string[];
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
    selectedDates: [String],
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Registration ||
  mongoose.model<IRegistration>("Registration", RegistrationSchema);
