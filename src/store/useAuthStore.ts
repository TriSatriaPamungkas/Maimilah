// src/store/useAuthStore.ts
// CATATAN: Dengan NextAuth, store ini OPSIONAL
// NextAuth sudah handle semua authentication state
// Store ini hanya untuk additional client-side state jika diperlukan

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface AuthState {
  // Additional client-side state (optional)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalData?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setAdditionalData: (data: Record<string, any>) => void;
  clearAdditionalData: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      additionalData: undefined,

      setAdditionalData: (data) => set({ additionalData: data }),

      clearAdditionalData: () => set({ additionalData: undefined }),
    }),
    {
      name: "auth-additional-storage",
      partialize: (state) => ({
        additionalData: state.additionalData,
      }),
    }
  )
);

/* 
═══════════════════════════════════════════════════════════════
MIGRATION NOTES: NextAuth menggantikan semua fungsi di bawah ini
═══════════════════════════════════════════════════════════════

❌ TIDAK PERLU LAGI (NextAuth sudah handle):
  - login()      → gunakan signIn() dari next-auth/react
  - logout()     → gunakan signOut() dari next-auth/react
  - checkAuth()  → gunakan useSession() atau getServerSession()
  - user state   → ambil dari session.user
  - token        → handled by NextAuth JWT
  - isAuthenticated → cek dari session status

✅ CARA PAKAI DI COMPONENTS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Di Client Component (untuk akses user data):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client';
import { useSession, signOut } from 'next-auth/react';

function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Not logged in</div>;
  
  return (
    <div>
      <p>Welcome {session?.user?.username}</p>
      <p>Email: {session?.user?.email}</p>
      <p>Role: {session?.user?.role}</p>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  );
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. Di Server Component (untuk protect pages):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function MyServerComponent() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/admin/login');
  }
  
  return (
    <div>
      <h1>Protected Page</h1>
      <p>Welcome {session.user.username}</p>
    </div>
  );
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. Di API Routes (untuk protect API):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ 
    success: true,
    user: session.user 
  });
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. Login (di LoginForm component):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { signIn } from 'next-auth/react';

const result = await signIn('credentials', {
  username: 'adminMaimilah',
  password: 'maimilah2025',
  redirect: false,
});

if (result?.ok) {
  router.push('/admin/dashboard');
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. Logout (di Logout Button):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { signOut } from 'next-auth/react';

<button onClick={() => signOut({ callbackUrl: '/admin/login' })}>
  Logout
</button>

═══════════════════════════════════════════════════════════════
*/

// Export type untuk digunakan di components lain
export type { User };
