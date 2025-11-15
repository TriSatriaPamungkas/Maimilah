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
    <nav className="top-0 left-0 w-full fixed py-2 bg-white  shadow-md z-50">
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

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-black"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute right-4 mt-2 bg-white shadow-lg border border-gray-200 rounded-lg md:hidden">
          <ul className="flex flex-col text-black font-medium w-max">
            {menuItems.map((item, idx) => (
              <li
                key={item.name}
                onClick={() => handleClick(item.href)}
                className={`px-5 py-2 cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition-colors ${
                  idx !== menuItems.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
