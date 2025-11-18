"use client";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Hide navbar di semua route admin
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const menuItems = [
    { name: "HOME", href: "/" },
    { name: "INTRODUCTION", href: "#introduction" },
    { name: "EVENT", href: "#events" },
    { name: "MERCHANDISE", href: "#merchandise" },
    // { name: "GALERY", href: "#galeries" },
    { name: "CONTACT", href: "#contact" },
  ];

  // buat handle click + auto-close
  const handleClick = (href: string) => {
    setIsOpen(false);
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <>
      <nav className="top-0 left-0 w-full fixed py-2 bg-white shadow-md z-50">
        <div className="container mx-auto flex justify-between items-center px-4">
          {/* Logo */}
          <Image
            src={"/asset/logo.png"}
            alt={"logo-navbar"}
            width={50}
            height={60}
            className="cursor-pointer"
          />

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 text-black font-medium">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="hover:text-green-500 transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Mobile Toggle - dengan animasi icon */}
          <button
            className="md:hidden text-black relative w-7 h-7"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {/* Menu Icon */}
            <Menu
              size={28}
              className={`absolute inset-0 transition-all duration-300 ${
                isOpen
                  ? "rotate-90 opacity-0 scale-0"
                  : "rotate-0 opacity-100 scale-100"
              }`}
            />
            {/* X Icon */}
            <X
              size={28}
              className={`absolute inset-0 transition-all duration-300 ${
                isOpen
                  ? "rotate-0 opacity-100 scale-100"
                  : "-rotate-90 opacity-0 scale-0"
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Overlay Background */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Image
              src={"/asset/logo.png"}
              alt={"logo"}
              width={40}
              height={40}
            />
            <span className="font-bold text-gray-800">Maimilah</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Sidebar Menu */}
        <ul className="flex flex-col text-black font-medium py-4">
          {menuItems.map((item, idx) => (
            <li
              key={item.name}
              onClick={() => handleClick(item.href)}
              className={`px-6 py-4 cursor-pointer hover:bg-green-50 hover:text-green-600 active:bg-green-100 transition-all duration-200 border-l-4 border-transparent hover:border-green-500 ${
                idx !== menuItems.length - 1 ? "border-b border-gray-100" : ""
              }`}
              style={{
                animationDelay: `${idx * 50}ms`,
                animation: isOpen ? "slideIn 0.3s ease-out forwards" : "none",
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>

        {/* Sidebar Footer (Optional) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © 2025 Maimilah Community
          </p>
        </div>
      </div>

      {/* Keyframe Animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
