// src/components/landing/MerchHighlight.tsx
"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/atoms/button"; // Sesuaikan path

const MerchHighlight = () => {
  const router = useRouter();

  return (
    <section className="py-20 px-4 bg-white" id="merchandise">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Merchandise <span className="text-green-600">Kami</span>
          </h2>
          <div className="w-24 h-1 bg-green-600 mx-auto mt-4"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 order-2 md:order-1">
            <h3 className="text-3xl font-bold text-gray-800">
              Official Merchandise dari Maimilah
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              Tunjukkan kebanggaanmu sebagai bagian dari komunitas Maimilah
              dengan koleksi merchandise eksklusif kami. Setiap produk dirancang
              dengan cermat dan diproduksi dengan kualitas terbaik untuk
              menemani aktivitas sehari-harimu.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Dari kaos, hoodie, tote bag, hingga aksesoris unik lainnya, semua
              tersedia untuk mendukung gaya hidupmu dan menunjukkan identitas
              komunitas yang kita banggakan bersama.
            </p>
            <div className="pt-4">
              <Button
                variant="secondary"
                onClick={() => router.push("/merch")}
                disabled
              >
                Coming Soon
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative h-96 rounded-lg overflow-hidden shadow-xl order-1 md:order-2">
            <Image
              src="/asset/merch.png"
              alt="Maimilah Merchandise"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MerchHighlight;
