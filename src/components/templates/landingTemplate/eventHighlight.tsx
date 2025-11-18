// src/components/landing/EventHighlight.tsx
"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/atoms/button"; // Sesuaikan path

const EventHighlight = () => {
  const router = useRouter();

  return (
    <section className="py-20 px-4 bg-gray-50" id="events">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Event <span className="text-green-600">Kami</span>
          </h2>
          <div className="w-24 h-1 bg-green-600 mx-auto mt-4"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
            <Image
              src="/asset/event.JPG"
              alt="Maimilah Events"
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-gray-800">
              Official Event dari Maimilah
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed text-justify">
              Di Maimilah, Kita rutin bikin workshop edukatif, seminar
              inspiratif tentang sustainability, hingga gathering sosial yang
              bener-bener bermakna.Semua event ini dirancang supaya anggota bisa
              belajar sekaligus beraksi nyata, ga cuma ngomongin soal
              lingkungan, tapi beneran berkontribusi.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Bergabunglah dengan kami di event-event mendatang dan jadilah
              bagian dari komunitas yang dinamis dan penuh inspirasi!
            </p>
            <div className="pt-4">
              <Button variant="primary" onClick={() => router.push("/event")}>
                Lihat Semua Event
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventHighlight;
