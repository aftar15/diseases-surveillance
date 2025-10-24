import { NextRequest, NextResponse } from "next/server";
import { testDatabaseConnection } from "@/lib/db/database-utils";
import { withRoleCheck } from "@/lib/auth";
import { UserRole } from "@/types";

// Check database connection status (Admin only)
export async function GET(request: NextRequest) {
  // Check if user has admin role
  const authCheck = await withRoleCheck([UserRole.Admin])(request);
  
  // If authCheck is a Response, it means there was an authentication error
  if (authCheck instanceof Response) {
    return authCheck;
  }
  
  try {
    const isConnected = await testDatabaseConnection();
    
    return NextResponse.json({
      status: isConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error checking database connection:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Failed to check database connection",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 