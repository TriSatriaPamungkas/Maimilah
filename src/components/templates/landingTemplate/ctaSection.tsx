// src/components/landing/CTASection.tsx
"use client";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Link,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { useFeedbackStore } from "@/src/store/useFeedbackStore";

const CTASection = () => {
  const { submitFeedback } = useFeedbackStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      alert("Semua field harus diisi!");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitFeedback(formData);

      // Show success notification
      setShowSuccess(true);

      // Reset form
      setFormData({ name: "", email: "", message: "" });

      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(`Gagal mengirim pesan: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="py-20 px-4 bg-linear-to-br from-green-600 to-green-800 text-white relative"
      id="contact"
    >
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg animate-in slide-in-from-right-8 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-white" />
            <div>
              <p className="font-semibold">Pesan Berhasil Dikirim!</p>
              <p className="text-sm text-green-100">
                Terima kasih atas feedback Anda
              </p>
            </div>
          </div>
        </div>
      )}

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
                  <a
                    href="https://wa.me/6281558611066?text=Saya%20mau%20tanya%20tentang%20maimilah"
                    className="text-green-100 hover:text-white transition-colors hover:cursor-pointer"
                  >
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold">Nama</label>
                <input
                  type="text"
                  placeholder="Nama lengkap"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 placeholder-green-200 focus:outline-none focus:border-white transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 placeholder-green-200 focus:outline-none focus:border-white transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Pesan</label>
                <textarea
                  rows={4}
                  placeholder="Tulis pesan Anda..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 placeholder-green-200 focus:outline-none focus:border-white transition-colors resize-none text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>Kirim Pesan</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
