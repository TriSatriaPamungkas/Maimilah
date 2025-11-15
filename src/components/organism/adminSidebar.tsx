"use client";
// src/components/organism/adminSidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Home,
  Calendar,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import Image from "next/image";

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <Home size={18} /> },
    {
      name: "Event",
      href: "/admin/dashboard/events",
      icon: <Calendar size={18} />,
    },
    {
      name: "Merchandise",
      href: "/admin/dashboard/merch",
      icon: <ShoppingBag size={18} />,
    },
    {
      name: "Participants",
      href: "/admin/dashboard/participants",
      icon: <Users size={18} />,
    },
    {
      name: "Settings",
      href: "/admin/dashboard/settings",
      icon: <Settings size={18} />,
    },
  ];

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === "/admin/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white shadow-lg border-r border-gray-200 flex flex-col justify-between">
      {/* Logo Section */}
      <div>
        <div className="flex items-center gap-2 p-4 border-b">
          <Image src="/asset/logo.png" alt="logo" width={35} height={35} />
          <h1 className="font-bold text-lg text-green-600">Admin Panel</h1>
        </div>

        {/* User Info */}
        {session?.user && (
          <div className="px-4 py-3 border-b bg-gray-50">
            <p className="text-sm font-medium text-gray-700">
              {session.user.name || "User"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {session.user.role || "admin"}
            </p>
          </div>
        )}

        {/* Menu List */}
        <nav className="mt-4 flex flex-col">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors
                ${
                  active
                    ? "bg-green-500 text-white"
                    : "text-gray-700 hover:bg-green-100 hover:text-green-600"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full text-gray-700 hover:text-red-500 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
