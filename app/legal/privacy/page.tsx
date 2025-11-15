/* eslint-disable react/no-unescaped-entities */
import React from "react";
import Navbar from "@/src/components/organism/navbar";
import Footer from "@/src/components/templates/landingTemplate/footerSection";

const Privacy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow px-6 md:px-16 lg:px-32 pt-20 pb-5 bg-white text-gray-800 ">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          KETENTUAN PRIVASI
        </h1>

        <p className="mb-6 leading-relaxed text-justify">
          Ketentuan Privasi ini menjelaskan kebijakan Komunitas Maimilah
          ("Kami") dalam mengumpulkan, menggunakan, dan melindungi data pribadi
          individu maupun organisasi (selanjutnya disebut "Anggota" atau "Kamu")
          yang mengakses situs web{" "}
          <span className="font-semibold">https://maimilah.id/</span>, media
          sosial, atau aplikasi resmi milik Komunitas Maimilah, yaitu komunitas
          yang berfokus pada pelestarian lingkungan melalui kegiatan{" "}
          <span className="italic">
            pilah sampah, pengurangan plastik sekali pakai (PSP), dan dukungan
            terhadap gerakan Bali Bersih.
          </span>
        </p>

        <p className="mb-8 leading-relaxed text-justify">
          Dengan mengakses dan/atau berpartisipasi dalam kegiatan Komunitas
          Maimilah, Kamu dianggap telah membaca, memahami, dan menyetujui
          seluruh isi Ketentuan Privasi ini.
        </p>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">
            A. INFORMASI PRIBADI YANG KAMI KUMPULKAN
          </h2>

          <p>
            Kami mengumpulkan dua jenis informasi dari para Anggota dan
            Pengunjung:
          </p>

          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <strong>Informasi yang Kamu berikan.</strong> Data yang Kamu
              berikan secara sukarela saat mendaftar sebagai anggota, mengikuti
              kegiatan Maimilah, mengisi formulir online, menghubungi kami, atau
              berpartisipasi dalam survei. Contohnya: nama, alamat email, nomor
              telepon, domisili, dan afiliasi komunitas.
            </li>
            <li>
              <strong>Informasi yang Kami kumpulkan otomatis.</strong> Saat Kamu
              mengunjungi situs web kami, sistem kami dapat mencatat informasi
              teknis seperti alamat IP, jenis perangkat, waktu akses, serta
              aktivitas di situs untuk keperluan analisis dan peningkatan
              pengalaman pengguna.
            </li>
            <li>
              <strong>Informasi dari pihak ketiga.</strong> Dalam beberapa
              kasus, kami dapat menerima data dari mitra kegiatan lingkungan,
              lembaga pendidikan, atau sponsor acara (“Mitra Maimilah”). Data
              ini akan diverifikasi dan digunakan sesuai dengan tujuan kegiatan
              Maimilah dan peraturan yang berlaku.
            </li>
          </ol>
        </section>

        <section className="space-y-6 mt-10">
          <h2 className="text-2xl font-semibold">B. PENGGUNAAN INFORMASI</h2>

          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <strong>Mengelola keanggotaan dan kegiatan.</strong> Seperti
              pendaftaran acara bersih pantai, workshop daur ulang, atau
              kampanye edukasi lingkungan.
            </li>
            <li>
              <strong>Komunikasi dan pemberitahuan.</strong> Kami dapat
              mengirimkan email, pesan singkat, atau pemberitahuan tentang
              kegiatan komunitas yang relevan dengan peran Kamu di Maimilah.
            </li>
            <li>
              <strong>Analisis dan pengembangan.</strong> Data digunakan untuk
              mempelajari partisipasi komunitas, mengevaluasi efektivitas
              program lingkungan, dan meningkatkan layanan Maimilah.
            </li>
            <li>
              <strong>Kolaborasi dengan Mitra.</strong> Dalam beberapa kegiatan
              kolaboratif (misalnya bersama Dinas Lingkungan Hidup, sekolah,
              atau bisnis lokal), informasi dapat digunakan secara agregat untuk
              kepentingan pelaporan atau dokumentasi kegiatan.
            </li>
          </ol>
        </section>

        <section className="space-y-6 mt-10">
          <h2 className="text-2xl font-semibold">
            C. COOKIES DAN TEKNOLOGI PELACAKAN
          </h2>

          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <strong>Cookies.</strong> Kami dapat menggunakan cookies untuk
              mengingat preferensi pengguna di situs web, mempermudah login,
              serta menganalisis aktivitas pengunjung. Kamu dapat menonaktifkan
              cookies di pengaturan browser, namun beberapa fitur situs mungkin
              tidak berfungsi optimal.
            </li>
            <li>
              <strong>Log dan Analitik.</strong> Kami menyimpan data log anonim
              untuk memahami tren penggunaan situs, seperti jumlah kunjungan,
              waktu akses, dan halaman yang paling sering dikunjungi.
            </li>
          </ol>
        </section>

        <section className="space-y-6 mt-10">
          <h2 className="text-2xl font-semibold">D. KEAMANAN DATA</h2>

          <ul className="list-disc pl-6 space-y-3">
            <li>
              Kami menjaga keamanan data pribadi Kamu dengan menerapkan langkah-
              langkah fisik, teknis, dan administratif untuk mencegah akses
              tanpa izin.
            </li>
            <li>
              Data akan disimpan selama Kamu masih aktif sebagai anggota
              Maimilah atau hingga Kamu mengajukan permohonan penghapusan data.
            </li>
            <li>
              Kami tidak akan menjual, menyewakan, atau membagikan data pribadi
              Kamu kepada pihak ketiga tanpa izin, kecuali diwajibkan oleh
              hukum.
            </li>
          </ul>
        </section>

        <section className="space-y-6 mt-10">
          <h2 className="text-2xl font-semibold">E. HAK KAMU</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              Kamu berhak meminta salinan data pribadi, memperbaiki
              ketidaktepatan, atau menghapus data dari sistem kami.
            </li>
            <li>
              Permohonan dapat dikirimkan melalui email resmi kami atau melalui
              formulir kontak di situs web.
            </li>
          </ul>
        </section>

        <section className="space-y-6 mt-10">
          <h2 className="text-2xl font-semibold">
            F. PERUBAHAN KEBIJAKAN PRIVASI
          </h2>

          <ol className="list-decimal pl-6 space-y-3">
            <li>
              Kami dapat memperbarui Ketentuan Privasi ini untuk menyesuaikan
              dengan perkembangan kebijakan atau hukum terkait.
            </li>
            <li>
              Setiap perubahan penting akan diumumkan di situs web dan, jika
              perlu, diberitahukan melalui email kepada anggota terdaftar.
            </li>
            <li>
              Tanggal pembaruan terakhir akan selalu ditampilkan di bagian bawah
              dokumen ini.
            </li>
          </ol>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold">G. KONTAK</h2>

          <p>
            Jika Kamu memiliki pertanyaan, saran, atau permintaan terkait
            Ketentuan Privasi ini, silakan hubungi kami melalui email:{" "}
            <a
              href="mailto:mai.milahh@gmail.com"
              className="font-semibold text-green-700"
            >
              mai.milah@gmail.com
            </a>
          </p>

          <p className="mt-6 text-sm text-gray-600">
            <em>Terakhir diperbarui pada: 10 November 2025</em>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
