import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { findUserByIdFromDB } from "@/lib/db-auth";

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid token" },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }
    
    // Get user from the database
    const user = await findUserByIdFromDB(payload.id);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Return user info (excluding password)
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      user: userWithoutPassword,
      isValid: true,
    });
    
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Verification failed", isValid: false },
      { status: 500 }
    );
  }
} 