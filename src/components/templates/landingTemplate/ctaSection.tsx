// src/components/landing/CTASection.tsx
import { Mail, Phone, MapPin, Instagram, Link } from "lucide-react";

const CTASection = () => {
  return (
    <section
      className="py-20 px-4 bg-linear-to-br from-green-600 to-green-800 text-white"
      id="contact"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-4xl font-bold mb-6">Hubungi Kami</h2>
            <p className="text-green-100 mb-8 text-lg">
              Punya pertanyaan atau ingin bergabung dengan komunitas kami?
              Jangan ragu untuk menghubungi kami!
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Mail size={24} />
                </div>
                <div>
                  <div className="font-semibold">Email</div>
                  <a
                    href="mailto:mai.milahh@gmail.com"
                    className="text-green-100 hover:text-white transition-colors"
                  >
                    mai.milahh@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Phone size={24} />
                </div>
                <div>
                  <div className="font-semibold">Whatsapp</div>
                  <a className="text-green-100 hover:text-white transition-colors hover:cursor-pointer">
                    +62 815-5861-1066
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <MapPin size={24} />
                </div>
                <div>
                  <div className="font-semibold">Lokasi</div>
                  <div className="text-green-100">
                    Denpasar, Bali, Indonesia
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-8">
              <h3 className="font-semibold mb-4 text-xl">Ikuti Kami</h3>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/maimilah"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 p-3 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Instagram size={24} />
                </a>

                <a
                  href="https://linktr.ee/maimilah"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 p-3 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Link size={24} />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-6">Kirim Pesan</h3>
            <form className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold">Nama</label>
                <input
                  type="text"
                  placeholder="Nama lengkap"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 placeholder-green-200 focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 placeholder-green-200 focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Pesan</label>
                <textarea
                  rows={4}
                  placeholder="Tulis pesan Anda..."
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 placeholder-green-200 focus:outline-none focus:border-white transition-colors resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-300 shadow-lg"
              >
                Kirim Pesan
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
