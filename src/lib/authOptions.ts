// lib/authOptions.ts  (buat file baru)
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";

const MONGODB_URI = process.env.MONGODB_URI || "";

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("Please add your Mongo URI to .env");
  }
  if (cachedClient) return cachedClient.db();

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
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username dan password harus diisi");
        }
        const db = await connectToDatabase();

        const user = await db.collection("users").findOne({
          username: credentials.username,
        });

        if (!user) {
          throw new Error("Username tidak ditemukan");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) {
          throw new Error("Password salah");
        }

        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role || "admin",
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      return baseUrl + "/admin/dashboard";
    },
  },

  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 4 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "production",
};
