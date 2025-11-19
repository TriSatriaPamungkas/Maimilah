"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, X } from "lucide-react";

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial error dari URL params (session expired)
  const initialError = React.useMemo(() => {
    const errorParam = searchParams.get("error");
    const messageParam = searchParams.get("message");

    if (errorParam === "SessionExpired" && messageParam) {
      return messageParam;
    }
    return "";
  }, [searchParams]);

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(initialError); // Set initial dari URL
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log("🔐 Starting login process...");

    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";
      console.log("📍 Callback URL:", callbackUrl);

      // Gunakan redirect: false untuk kontrol penuh
      const result = await signIn("credentials", {
        username: form.username,
        password: form.password,
        redirect: false,
      });

      console.log("✅ SignIn result:", result);

      if (result?.error) {
        console.error("❌ Login error:", result.error);
        setError("Username atau password salah");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        console.log("✅ Login successful! Redirecting to:", callbackUrl);

        // STRATEGI: Coba beberapa metode redirect secara berurutan
        try {
          // Method 1: Next.js router (soft navigation)
          console.log("📍 Method 1: Using Next.js router...");
          router.push(callbackUrl);
          router.refresh();

          // Method 2: Hard redirect setelah 500ms (fallback)
          setTimeout(() => {
            console.log("📍 Method 2: Using window.location...");
            try {
              window.location.href = callbackUrl;
            } catch (redirectError) {
              console.error(
                "❌ Window.location redirect failed:",
                redirectError
              );
              // Method 3: Force reload dengan replace
              window.location.replace(callbackUrl);
            }
          }, 500);
        } catch (routerError) {
          console.error("❌ Router redirect failed:", routerError);
          // Immediate fallback
          window.location.href = callbackUrl;
        }
      } else {
        console.error("❌ Unknown login state:", result);
        setError("Login gagal, coba ulangi.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("❌ Login exception:", err);
      setError("Terjadi kesalahan saat login. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    router.push("/");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
          <p className="text-sm text-gray-600 mt-2">
            Masuk ke dashboard administrator
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-700 text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            disabled={isLoading}
            placeholder="Masukkan username"
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              disabled={isLoading}
              placeholder="Masukkan password"
              className="w-full border border-gray-300 rounded-lg px-3 py-3 pr-10 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white font-semibold rounded-lg py-3 hover:bg-green-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Memproses...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-gray-500">
          Sistem menggunakan NextAuth.js & MongoDB
        </div>
      </div>
    </div>
  );
};
