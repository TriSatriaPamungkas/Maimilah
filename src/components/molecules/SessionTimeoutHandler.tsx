/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
      // Get JWT expiration time
      const sessionMaxAge = 4 * 60 * 60; // 4 hours in seconds
      const warningThreshold = 10 * 60; // 10 minutes in seconds

      // Get token data from session
      const token = session as any;
      const exp = token.exp; // JWT expiration timestamp
      const now = Math.floor(Date.now() / 1000);

      if (!exp) return;

      const remaining = exp - now;
      const remainingMinutes = Math.floor(remaining / 60);

      setTimeLeft(remainingMinutes);

      // Show warning if less than 10 minutes remaining
      if (remaining > 0 && remaining <= warningThreshold) {
        setShowWarning(true);
      }

      // Auto logout if session expired
      if (remaining <= 0) {
        handleLogout();
      }
    };

    // Check session every minute
    const interval = setInterval(checkSession, 60000);
    checkSession(); // Initial check

    return () => {
      clearInterval(interval);
    };
  }, [status, session]);

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/admin/login",
      redirect: true,
    });
  };

  const handleExtendSession = async () => {
    // Force refresh session
    router.refresh();
    setShowWarning(false);
  };

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-9999 max-w-sm">
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
              Sesi Anda akan berakhir dalam {timeLeft} menit. Klik lanjutkan
              untuk tetap login.
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
