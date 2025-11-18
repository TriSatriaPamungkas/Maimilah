/* eslint-disable react-hooks/immutability */
// src/components/molecules/SessionTimeoutHandler.tsx
"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Clock, LogOut } from "lucide-react";

export const SessionTimeoutHandler = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (status !== "authenticated" || !session) return;

    const checkSession = () => {
      // Get session start time (JWT iat)
      const now = Date.now();
      const sessionMaxAge = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

      // Warning 10 minutes before expiration
      const warningTime = sessionMaxAge - 10 * 60 * 1000;

      // Calculate session age (this is approximate, better to use JWT iat)
      // For now, we'll show warning based on last activity
      const lastActivity = parseInt(
        localStorage.getItem("lastActivity") || now.toString()
      );
      const sessionAge = now - lastActivity;
      const remaining = sessionMaxAge - sessionAge;

      // Update time left
      setTimeLeft(Math.floor(remaining / 1000 / 60)); // minutes

      // Show warning if less than 10 minutes remaining
      if (sessionAge >= warningTime && remaining > 0) {
        setShowWarning(true);
      }

      // Auto logout if session expired
      if (remaining <= 0) {
        handleLogout();
      }
    };

    // Track user activity
    const updateActivity = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
      setShowWarning(false); // Hide warning on activity
    };

    // Events that indicate user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });

    // Initialize last activity
    if (!localStorage.getItem("lastActivity")) {
      localStorage.setItem("lastActivity", Date.now().toString());
    }

    // Check session every minute
    const interval = setInterval(checkSession, 60000);
    checkSession(); // Initial check

    return () => {
      clearInterval(interval);
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [status, session]);

  const handleLogout = async () => {
    localStorage.removeItem("lastActivity");
    await signOut({ redirect: false });
    router.push("/admin/login");
  };

  const handleExtendSession = () => {
    // Refresh session by updating last activity
    localStorage.setItem("lastActivity", Date.now().toString());
    setShowWarning(false);
  };

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-sm">
      <div className="bg-white rounded-lg shadow-2xl border-2 border-orange-300 p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 bg-orange-100 p-2 rounded-lg">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-1">
              Session akan berakhir
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Sesi Anda akan berakhir dalam {timeLeft} menit karena tidak ada
              aktivitas
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleExtendSession}
                className="flex-1 bg-green-600 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Lanjutkan
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-gray-200 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
