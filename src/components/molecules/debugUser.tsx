// src/components/DebugUser.tsx
"use client";

import { useAuthStore } from "@/src/store/useAuthStore";

export const DebugUser = () => {
  const { user } = useAuthStore();

  console.log("Debug - User object:", user);
  console.log("Debug - User type:", typeof user);

  return (
    <div style={{ display: "none" }}>
      Debug: User is {user ? "present" : "null"}
    </div>
  );
};
