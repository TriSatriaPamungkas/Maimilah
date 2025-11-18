// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import type { User as NextAuthUser } from "next-auth";

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    username: string;
    role: string;
  }
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    iat: number; // ✅ issued at
    exp: number; // ✅ expiration
  }
}

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "";

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("Please add your Mongo URI to .env");
  }

  if (cachedClient) {
    return cachedClient.db();
  }

  const client = await MongoClient.connect(MONGODB_URI);
  cachedClient = client;
  return client.db();
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "adminMaimilah",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username dan password harus diisi");
        }

        try {
          const db = await connectToDatabase();

          // Cari user berdasarkan username di collection 'users'
          const user = await db.collection("users").findOne({
            username: credentials.username,
          });

          if (!user) {
            throw new Error("Username tidak ditemukan");
          }

          // Verify password dengan bcrypt
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Password salah");
          }

          // Return user object (akan disimpan di JWT token)
          return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role || "admin",
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Saat pertama login, simpan data user ke token
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }

      // ✅ Always return token with required properties
      return token;
    },

    async session({ session, token }) {
      // Tambahkan data dari token ke session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 4 * 60 * 60, // ✅ 4 hours in seconds
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
