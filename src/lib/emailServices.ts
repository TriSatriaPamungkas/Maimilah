import nodemailer from "nodemailer";

// ✅ Konfigurasi Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true untuk port 465, false untuk 587
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Untuk menghindari error sertifikat
  },
  connectionTimeout: 10000, // 10 detik timeout
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

interface ShiftDetail {
  date: string;
  startTime: string;
  endTime: string;
}

interface VolunteerConfirmationData {
  name: string;
  email: string;
  eventName: string;
  eventLocation: string;
  selectedShifts: ShiftDetail[]; // Format with shift details
}

export async function sendVolunteerConfirmation(
  data: VolunteerConfirmationData
) {
  const { name, email, eventName, eventLocation, selectedShifts } = data;

  // Format tabel dengan shift waktu
  const shiftRows = selectedShifts
    .map(
      (shift, index) => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 12px; text-align: center; background-color: ${
        index % 2 === 0 ? "#f9f9f9" : "#ffffff"
      };">${index + 1}</td>
      <td style="border: 1px solid #ddd; padding: 12px;">${new Date(
        shift.date
      ).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</td>
      <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: 500; color: #059669;">
        ${shift.startTime} - ${shift.endTime}
      </td>
    </tr>
  `
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Konfirmasi Pendaftaran Volunteer</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Terima Kasih!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Pendaftaran Anda Berhasil</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 15px 0;">
            Halo <strong style="color: #10b981;">${name}</strong>,
          </p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 15px 0;">
            Terima kasih telah mendaftar sebagai volunteer untuk event <strong>${eventName}</strong>. 
            Kami sangat menghargai dedikasi dan kontribusi Anda!
          </p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 25px 0;">
            Partisipasi Anda akan membuat perbedaan besar dalam kesuksesan event ini.
          </p>
          
          <!-- Event Info Box -->
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 5px; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #166534; font-weight: 600;">
              📍 Lokasi Event
            </p>
            <p style="margin: 0; font-size: 14px; color: #15803d;">
              ${eventLocation}
            </p>
          </div>
          
          <!-- Jadwal Box -->
          <div style="background-color: #f8f9fa; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 5px;">
            <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #333;">Jadwal Keikutsertaan Anda:</h2>
            
            <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 5px; overflow: hidden;">
              <thead>
                <tr>
                  <th style="background-color: #10b981; color: white; padding: 15px; text-align: center; font-weight: 600; width: 60px;">No</th>
                  <th style="background-color: #10b981; color: white; padding: 15px; text-align: left; font-weight: 600;">Tanggal</th>
                  <th style="background-color: #10b981; color: white; padding: 15px; text-align: center; font-weight: 600; width: 160px;">Shift</th>
                </tr>
              </thead>
              <tbody>
                ${shiftRows}
              </tbody>
            </table>
          </div>
          
          <!-- Info Box -->
          <div style="background-color: #dbeafe; border: 1px solid #93c5fd; padding: 15px; border-radius: 5px; margin: 25px 0;">
            <p style="margin: 0; font-size: 14px; color: #1e40af; line-height: 1.5;">
              💡 <strong>Catatan Penting:</strong> Mohon simpan email ini sebagai referensi. Kami akan mengirimkan informasi lebih lanjut menjelang hari event melalui WhatsApp yang telah Anda daftarkan.
            </p>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 25px 0 0 0;">
            Jika Anda memiliki pertanyaan atau memerlukan bantuan, jangan ragu untuk menghubungi kami.
          </p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 10px 0 0 0;">
            Sampai jumpa di event! 
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.5;">
            Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
            © ${new Date().getFullYear()} Event Management System. All rights reserved.
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;

  try {
    console.log("📧 Attempting to send email to:", email);

    const mailOptions = {
      from: {
        name: "Maimilah Event Platform",
        address: process.env.GMAIL_USER!,
      },
      to: email,
      subject: `[KONFIRMASI PENDAFTARAN] - ${eventName}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully!");
    console.log("📬 Message ID:", info.messageId);
    console.log("📧 Sent to:", email);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}
