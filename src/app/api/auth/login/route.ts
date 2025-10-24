import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findUserByEmailFromDB } from "@/lib/db-auth";
import { generateToken } from "@/lib/auth";
import { verifyPassword } from "@/lib/db-auth";

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    console.log("Login attempt for:", body.email);
    
    // Validate the request data
    const result = loginSchema.safeParse(body);
    
    if (!result.success) {
      console.log("Validation failed:", result.error.issues);
      return NextResponse.json(
        { error: "Invalid login data", details: result.error.issues },
        { status: 400 }
      );
    }
    
    const { email, password } = result.data;
    
    // Find user in the database 
    const user = await findUserByEmailFromDB(email);
    console.log("DB user found:", !!user);
    
    if (!user || !user.password) {
      console.log("No user found or no password set");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    console.log("User found:", { id: user.id, email: user.email, role: user.role });
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    console.log("Password valid:", isPasswordValid);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    
    // Return user info and token (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      user: userWithoutPassword,
      token,
    });
    
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
} 