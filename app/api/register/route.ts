/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import Registration from "@/src/models/registration";
import { Event, connectDB } from "@/src/models/event";
import { sendVolunteerConfirmation } from "@/src/lib/emailServices"; // ✅ Import email service

/**
 * ✅ GET /api/register?eventId=...
 * Ambil semua peserta berdasarkan eventId
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "eventId wajib disertakan" },
        { status: 400 }
      );
    }

    const participants = await Registration.find({ eventId }).sort({
      registeredAt: -1,
    });

    console.log(
      `✅ Found ${participants.length} participants for event ${eventId}`
    );

    return NextResponse.json(
      { success: true, data: participants },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error fetching participants:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil peserta",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * ✅ POST /api/register
 * Tambahkan peserta baru ke collection "registration" + Kirim Email
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      eventId,
      name,
      email,
      phone,
      domisili,
      source,
      reason,
      selectedDates,
    } = body;

    console.log("📥 Registration request received:", {
      eventId,
      name,
      email,
      phone,
      domisili,
      source,
      reason,
      selectedDates,
    });

    // 🔍 Validasi input
    if (!eventId || !name || !email) {
      return NextResponse.json(
        { success: false, error: "eventId, name, dan email wajib diisi" },
        { status: 400 }
      );
    }

    // ✅ Validasi phone
    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Nomor telepon wajib diisi" },
        { status: 400 }
      );
    }

    // 🔍 Cek event valid
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    // 🔍 Cek apakah user sudah daftar
    const existing = await Registration.findOne({ eventId, email });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Peserta sudah terdaftar di event ini" },
        { status: 400 }
      );
    }

    // 🔍 Cek kuota per tanggal yang dipilih
    if (selectedDates && Array.isArray(selectedDates)) {
      for (const date of selectedDates) {
        const dateCount = await Registration.countDocuments({
          eventId,
          selectedDates: date,
        });

        if (dateCount >= event.quota) {
          const formattedDate = new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          return NextResponse.json(
            {
              success: false,
              error: `Kuota untuk tanggal ${formattedDate} sudah penuh`,
            },
            { status: 400 }
          );
        }
      }
    }

    // 🧾 Buat registrasi baru dengan phone field
    const registration = await Registration.create({
      eventId,
      name,
      email,
      phone,
      domisili,
      source,
      reason,
      selectedDates,
      registeredAt: new Date(),
    });

    console.log("✅ Registration created successfully:", {
      _id: registration._id,
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
    });

    // 🔄 Update list peserta di model Event
    event.participants = [...(event.participants || []), registration._id];
    await event.save();

    // 📧 Kirim email konfirmasi
    try {
      await sendVolunteerConfirmation({
        name: registration.name,
        email: registration.email,
        eventName: event.title,
        eventLocation: event.location,
        selectedDates: registration.selectedDates,
      });

      console.log("✅ Confirmation email sent to:", registration.email);
    } catch (emailError: any) {
      console.error("❌ Email error:", emailError);
      // Data sudah tersimpan, tapi email gagal
      // Return success dengan warning
      return NextResponse.json(
        {
          success: true,
          data: registration,
          _id: registration._id,
          registeredAt: registration.registeredAt,
          warning: "Pendaftaran berhasil, namun email konfirmasi gagal dikirim",
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pendaftaran berhasil! Email konfirmasi telah dikirim.",
        data: registration,
        _id: registration._id,
        registeredAt: registration.registeredAt,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error creating registration:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal membuat registrasi",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * ✅ DELETE /api/register
 * Batalkan registrasi peserta
 */
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { eventId, email } = await req.json();

    if (!eventId || !email) {
      return NextResponse.json(
        { success: false, error: "eventId dan email wajib diisi" },
        { status: 400 }
      );
    }

    const deleted = await Registration.findOneAndDelete({ eventId, email });

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Peserta tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log("✅ Registration cancelled:", {
      email: deleted.email,
      name: deleted.name,
    });

    // 🔄 Hapus ID peserta dari event
    await Event.findByIdAndUpdate(eventId, {
      $pull: { participants: deleted._id },
    });

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil dibatalkan",
      data: deleted,
    });
  } catch (error: any) {
    console.error("❌ Error cancelling registration:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal membatalkan registrasi",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
