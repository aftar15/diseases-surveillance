"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DatabaseIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  AlertCircleIcon,
  RefreshCwIcon
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { UserRole } from "@/types";

export function DatabaseStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "disconnected" | "error">("loading");
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Only admins should see this component
  if (!user || user.role !== UserRole.Admin) {
    return null;
  }
  
  const checkDatabaseStatus = async () => {
    try {
      setStatus("loading");
      setError(null);
      
      const response = await fetch('/api/database/status');
      
      if (!response.ok) {
        throw new Error(`Failed to check database status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setStatus(data.status);
      setTimestamp(data.timestamp);
    } catch (err) {
      console.error('Error checking database status:', err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to check database status");
    }
  };
  
  // Check database status on mount
  useEffect(() => {
    checkDatabaseStatus();
  }, []);
  
  // Get status badge color
  const getStatusBadge = () => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-500">Connected</Badge>;
      case "disconnected":
        return <Badge className="bg-red-500">Disconnected</Badge>;
      case "error":
        return <Badge className="bg-amber-500">Error</Badge>;
      case "loading":
      default:
        return <Badge className="bg-slate-500">Checking...</Badge>;
    }
  };
  
  // Get status icon
  const getStatusIcon = () => {
    switch (status) {
      case "connected":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "disconnected":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case "error":
        return <AlertCircleIcon className="h-5 w-5 text-amber-500" />;
      case "loading":
      default:
        return <RefreshCwIcon className="h-5 w-5 animate-spin" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5" />
            <CardTitle className="text-lg">Database Status</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          MySQL database connection status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            {getStatusIcon()}
            <span>
              {status === "connected" 
                ? "Database connection is healthy" 
                : status === "disconnected"
                ? "Database is not connected"
                : status === "loading"
                ? "Checking database connection..."
                : "Error checking database connection"}
            </span>
          </div>
        )}
        
        {timestamp && (
          <div className="mt-2 text-xs text-muted-foreground">
            Last checked: {new Date(timestamp).toLocaleString()}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkDatabaseStatus}
          disabled={status === "loading"}
        >
          <RefreshCwIcon className={`h-4 w-4 mr-1 ${status === "loading" ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardFooter>
    </Card>
  );
} 