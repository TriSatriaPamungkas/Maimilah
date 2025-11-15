"use client";
import Image from "next/image";

const Galery = () => {
  return (
    <section className="py-20 px-4 bg-white" id="galery">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Galeri <span className="text-green-600">Kegiatan</span>
          </h2>
          <div className="w-24 h-1 bg-green-600 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="relative h-64 rounded-lg overflow-hidden shadow-lg"
            >
              <Image
                src={`/asset/background.jpg`}
                alt={`Galeri Kegiatan ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Galery;
