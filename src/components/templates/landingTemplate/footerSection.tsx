"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();

  // Hide footer di semua route admin
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    pages: [
      { name: "Beranda", href: "/" },
      { name: "Tentang Kami", href: "/introduction" },
      { name: "Galeri", href: "" },
    ],

    legal: [
      { name: "Event", href: "/event" },
      { name: "Merchandise", href: "/merch" },
      { name: "Kebijakan Privasi", href: "/legal/privacy" },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
          {/* Logo and Description - Stay on Left */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/asset/logo.png"
                alt="Maimilah Logo"
                width={40}
                height={40}
              />
              <span className="text-xl font-bold text-white">Maimilah</span>
            </div>
            <p className="text-sm leading-relaxed">
              Komunitas yang berdedikasi untuk menciptakan ruang kolaborasi,
              kreativitas, dan pertumbuhan bersama yang berfokus pada
              pelestarian lingkungan melalui kegiatan{" "}
              <span className="italic">
                pilah sampah, pengurangan plastik sekali pakai (PSP), dan
                dukungan terhadap gerakan Bali Bersih.
              </span>
            </p>
          </div>

          {/* Pages & Legal - Move to Right */}
          <div className="grid grid-cols-2 gap-8 md:justify-items-end">
            {/* Pages */}
            <div>
              <h3 className="text-white font-semibold mb-4">Maimilah</h3>
              <ul className="space-y-2">
                {footerLinks.pages.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-green-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Lainnya</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-green-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6">
          <div className="container mx-auto flex justify-center items-center">
            <p className="text-sm">
              © {currentYear} Maimilah. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
