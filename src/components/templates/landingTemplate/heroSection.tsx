// src/components/landing/HeroSection.tsx
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden" id="home">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/asset/hr-bg.JPG"
          alt="Maimilah Community"
          fill
          className="object-cover brightness-50"
          priority
        />
      </div>

      {/* Gradient Overlay untuk readability */}
      <div className="absolute inset-0 z-0 bg-linear-to-b from-black/40 via-black/20 to-black/60"></div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white max-w-5xl mx-auto">
          {/* Main Title - Responsive Typography */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 md:mb-8 text-green-400 drop-shadow-2xl animate-fade-in">
            MAIMILAH
          </h1>

          {/* Subtitle - Responsive Typography */}
          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold mb-6 sm:mb-8 drop-shadow-lg leading-tight px-4">
            Environment Community
          </h3>
        </div>
      </div>

      {/* Scroll Indicator - Responsive Size */}
      <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="w-5 h-8 sm:w-6 sm:h-10 md:w-7 md:h-12 border-2 border-white rounded-full flex items-start justify-center p-1.5 sm:p-2">
          <div className="w-1 h-2 sm:h-3 bg-white rounded-full"></div>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
