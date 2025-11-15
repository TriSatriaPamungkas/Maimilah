// src/components/landing/HeroSection.tsx
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden" id="home">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/asset/hr-bg.JPG" // Sesuaikan dengan path gambar
          alt="Maimilah Community"
          fill
          className="object-cover brightness-50"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-green-400 drop-shadow-lg animate-fade-in">
            MAIMILAH
          </h1>
          <h3 className="text-3xl md:text-5xl font-semibold  mb-8 drop-shadow-lg">
            Environtment Community
          </h3>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
