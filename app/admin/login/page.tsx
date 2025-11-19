// app/admin/login/page.tsx
"use client";

import { Suspense } from "react";
import { LoginForm } from "@/src/components/molecules/loginForm";
import { useEffect } from "react";

function LoginFormFallback() {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat...</p>
      </div>
    </div>
  );
}

function LoginPageContent() {
  // Suppress browser extension errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Ignore errors dari browser extensions
      if (
        event.filename?.includes("chrome-extension://") ||
        event.message?.includes("chrome-extension://") ||
        event.filename?.includes("content.dist.js")
      ) {
        console.log("🔇 Suppressed browser extension error");
        event.preventDefault();
        return true;
      }
    };

    window.addEventListener("error", handleError, true);

    return () => {
      window.removeEventListener("error", handleError, true);
    };
  }, []);

  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}

export default function AdminLoginPage() {
  return <LoginPageContent />;
}
