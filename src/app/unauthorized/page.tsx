import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlertIcon, HomeIcon } from "lucide-react";

export const metadata = {
  title: "Unauthorized | DSMS",
  description: "You don't have permission to access this page",
};

export default function UnauthorizedPage() {
  return (
    <div className="container py-16 max-w-md mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="p-4 rounded-full bg-destructive/10">
          <ShieldAlertIcon className="h-12 w-12 text-destructive" />
        </div>
      </div>
      
      <h1 className="text-2xl font-bold mb-2">
        Access Denied
      </h1>
      
      <p className="text-muted-foreground mb-8">
        You don&apos;t have the necessary permissions to access this page. Please contact an administrator if you believe this is an error.
      </p>
      
      <div className="flex flex-col space-y-4">
        <Button asChild>
          <Link href="/">
            <HomeIcon className="mr-2 h-4 w-4" />
            Return Home
          </Link>
        </Button>
        
        <Button variant="outline" asChild>
          <Link href="/login">
            Sign in with a different account
          </Link>
        </Button>
      </div>
    </div>
  );
} 