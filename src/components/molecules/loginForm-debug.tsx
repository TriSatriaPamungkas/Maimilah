// TEST DEBUG: src/components/molecules/loginForm-debug.tsx
"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";

export const LoginFormDebug: React.FC = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const testRedirect = () => {
    addLog("🧪 Testing direct redirect...");
    try {
      window.location.href = "/admin/dashboard";
      addLog("✅ Redirect command executed");
    } catch (err) {
      addLog("❌ Redirect failed: " + err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLogs([]);

    addLog("🔐 Starting login...");

    try {
      const result = await signIn("credentials", {
        username: form.username,
        password: form.password,
        redirect: false,
      });

      addLog("📊 SignIn result: " + JSON.stringify(result));

      if (result?.ok) {
        addLog("✅ Login OK!");
        addLog("🔄 Will redirect in 3 seconds...");

        let countdown = 3;
        const interval = setInterval(() => {
          addLog(`⏳ Redirecting in ${countdown}...`);
          countdown--;

          if (countdown === 0) {
            clearInterval(interval);
            addLog("🚀 REDIRECTING NOW!");

            // Try all methods
            addLog("Method 1: window.location.href");
            window.location.href = "/admin/dashboard";

            setTimeout(() => {
              addLog("Method 2: window.location.replace");
              window.location.replace("/admin/dashboard");
            }, 500);

            setTimeout(() => {
              addLog("Method 3: window.location.assign");
              window.location.assign("/admin/dashboard");
            }, 1000);
          }
        }, 1000);
      } else {
        addLog("❌ Login failed: " + result?.error);
        setIsLoading(false);
      }
    } catch (err) {
      addLog("❌ Exception: " + err);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
        <h2 className="text-2xl font-bold text-center mb-4 text-red-600">
          🔧 DEBUG MODE
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Username"
                className="w-full border rounded px-3 py-2 text-sm"
                disabled={isLoading}
              />

              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Password"
                className="w-full border rounded px-3 py-2 text-sm"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium"
              >
                {isLoading ? "⏳ Processing..." : "🔐 Login & Redirect"}
              </button>
            </form>

            <button
              onClick={testRedirect}
              className="w-full mt-2 bg-green-600 text-white py-2 rounded text-sm font-medium"
            >
              🧪 Test Direct Redirect
            </button>

            <button
              onClick={() => setLogs([])}
              className="w-full mt-2 bg-gray-600 text-white py-2 rounded text-sm font-medium"
            >
              🗑️ Clear Logs
            </button>
          </div>

          <div>
            <div className="bg-gray-900 text-green-400 rounded p-3 h-96 overflow-y-auto font-mono text-xs">
              <div className="font-bold mb-2 text-white">📋 Debug Logs:</div>
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>⚠️ This is DEBUG mode - check logs carefully</p>
          <p>💡 Try Test Direct Redirect first to check if redirect works</p>
        </div>
      </div>
    </div>
  );
};
