import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MailIcon, PhoneIcon, LifeBuoyIcon, BookOpenIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Support | DSMS",
  description: "Get help and support for the Disease Surveillance Management System.",
};

export default function SupportPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
        <p className="text-muted-foreground">
          Find help with the Disease Surveillance Management System or contact our team.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LifeBuoyIcon className="h-5 w-5 text-primary" />
              Contact Support Team
            </CardTitle>
            <CardDescription>
              Reach out to our support staff for assistance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MailIcon className="h-5 w-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm font-medium">Email Support</p>
                <p className="text-sm text-muted-foreground">[Support Email Address]</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <PhoneIcon className="h-5 w-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm font-medium">Phone Support</p>
                <p className="text-sm text-muted-foreground">[Support Phone Number]</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <BookOpenIcon className="h-5 w-5 text-primary" /> 
                Documentation & Resources
             </CardTitle>
             <CardDescription>
               Access user guides and technical documentation.
             </CardDescription>
           </CardHeader>
           <CardContent className="space-y-3">
              <p className="text-sm">
                 Find detailed guides on using the system, data interpretation, and technical specifications in our documentation portal.
              </p>
           </CardContent>
        </Card>
      </div>
    </div>
  );
} 