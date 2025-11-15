// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import { User } from "@/src/models/user";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();
    console.log("Database connected, searching for user:", username);

    // Find user by username using Mongoose
    const user = await User.findOne({ username });
    console.log("Found user:", user ? "Yes" : "No");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Verify password
    // Pilih salah satu metode di bawah:

    // METODE 1: Jika password di database adalah plain text
    const isPasswordValid = password === user.password;

    // METODE 2: Jika password di database di-hash dengan bcrypt
    // const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Prepare user data without password
    const userData = {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    console.log("Login successful for user:", userData);

    return NextResponse.json({
      success: true,
      user: userData,
      token: `token-${user._id.toString()}-${Date.now()}`,
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development"
            ? `Server error: ${error}`
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}
