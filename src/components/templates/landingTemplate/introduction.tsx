// src/components/landing/Introduction.tsx
import Image from "next/image";

const Introduction = () => {
  return (
    <section className="py-20 px-4 bg-white" id="introduction">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Tentang <span className="text-green-600">Maimilah</span>
          </h2>
          <div className="w-24 h-1 bg-green-600 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed text-justify">
              Maimilah adalah komunitas kreatif dan peduli lingkungan yang lahir
              dari semangat kolaborasi anak muda Bali. Di sini, kita nggak cuma
              kumpul-kumpul buat bikin event keren, tapi juga punya misi nyata
              yaitu menjaga alam.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed text-justify">
              Lewat aksi pilah sampah, ngurangin plastik sekali pakai, dan ikut
              gerakan Bali Bersih. Kami percaya bahwa lewat kebersamaan dan
              kreativitas, setiap orang bisa jadi agen perubahan — nggak cuma
              buat komunitas, tapi juga untuk lingkungan sekitar.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  30+
                </div>
                <div className="text-sm text-gray-600">Anggota Aktif</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  10+
                </div>
                <div className="text-sm text-gray-600">Event Terlaksana</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">2+</div>
                <div className="text-sm text-gray-600">Tahun Berjalan</div>
              </div>
            </div>
          </div>

          <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
            <Image
              src="/asset/background.JPG"
              alt="Maimilah Community"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Introduction;
