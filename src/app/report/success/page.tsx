import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2Icon, HomeIcon, FileTextIcon } from "lucide-react";

export const metadata = {
  title: "Report Submitted | DSMS",
  description: "Your disease report has been successfully submitted",
};

export default function ReportSuccessPage() {
  return (
    <div className="container py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2Icon className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Report Submitted Successfully</CardTitle>
          <CardDescription>
            Thank you for contributing to disease surveillance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-md p-4 bg-muted/50">
            <p className="text-sm">
              Your anonymous report has been received and will be reviewed by health officials. This helps monitor potential disease outbreaks and protect your community.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Next steps:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">1</span>
                <span>If your symptoms worsen, please seek medical attention immediately.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">2</span>
                <span>Check the map regularly for updates on disease hotspots in your area.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">3</span>
                <span>Eliminate potential mosquito breeding sites around your home.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button className="flex-1" asChild>
              <Link href="/">
                <HomeIcon className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/report">
                <FileTextIcon className="mr-2 h-4 w-4" />
                Report Another Case
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 