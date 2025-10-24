import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangleIcon, InfoIcon, HeartIcon, ShieldIcon } from "lucide-react";

export const metadata = {
  title: "About Disease Surveillance | DiseaseTrack",
  description: "Information about disease surveillance and prevention measures",
};

export default function AboutPage() {
  return (
    <div className="container py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:gap-4">
        <h1 className="font-bold tracking-tight">About Disease Surveillance</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Essential information about disease surveillance, monitoring, and prevention
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start gap-3 sm:gap-4">
            <InfoIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mt-1" />
            <div>
              <CardTitle className="text-base sm:text-lg">What is Disease Surveillance?</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Overview of our monitoring system</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base">
              Disease surveillance is the systematic collection, analysis, and interpretation of health data 
              to monitor and prevent the spread of communicable and non-communicable diseases.
            </p>
            <p className="text-sm sm:text-base">
              Our system enables real-time reporting and tracking of various diseases including 
              dengue, tuberculosis, diabetes, and other conditions affecting public health.
            </p>
            <div className="bg-muted rounded-md p-3 sm:p-4">
              <p className="text-xs sm:text-sm font-medium">Key Features:</p>
              <ul className="text-xs sm:text-sm space-y-1 mt-2 list-disc pl-5">
                <li>Monitors both communicable and non-communicable diseases</li>
                <li>Real-time reporting and case validation</li>
                <li>Geospatial mapping of disease hotspots</li>
                <li>Anonymous reporting system for public participation</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-start gap-3 sm:gap-4">
            <AlertTriangleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500 mt-1" />
            <div>
              <CardTitle className="text-base sm:text-lg">Recognizing Symptoms</CardTitle>
              <CardDescription className="text-xs sm:text-sm">When to report and seek medical attention</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base">
              Early detection and reporting of disease symptoms is crucial for effective surveillance and outbreak prevention.
            </p>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-medium mb-2">Common Warning Signs to Report:</h3>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="bg-red-100 text-red-600 rounded-full p-1 mt-0.5">●</span>
                    <span>Persistent fever or unusual temperature patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-red-100 text-red-600 rounded-full p-1 mt-0.5">●</span>
                    <span>Severe or persistent cough, breathing difficulties</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-red-100 text-red-600 rounded-full p-1 mt-0.5">●</span>
                    <span>Unusual fatigue, body aches, or weakness</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-red-100 text-red-600 rounded-full p-1 mt-0.5">●</span>
                    <span>Skin rashes, bleeding, or unusual bruising</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-red-100 text-red-600 rounded-full p-1 mt-0.5">●</span>
                    <span>Symptoms specific to monitored diseases in your area</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-start gap-3 sm:gap-4">
            <ShieldIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mt-1" />
            <div>
              <CardTitle className="text-base sm:text-lg">Disease Prevention</CardTitle>
              <CardDescription className="text-xs sm:text-sm">General measures to protect public health</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm sm:text-base font-medium">Communicable Disease Prevention:</h3>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5">1</span>
                    <span>Practice good hand hygiene and respiratory etiquette</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5">2</span>
                    <span>Maintain clean environment and proper sanitation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5">3</span>
                    <span>Stay updated on vaccinations and health advisories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5">4</span>
                    <span>Use vector control measures (mosquito nets, repellents)</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm sm:text-base font-medium">General Health Practices:</h3>
                <ul className="text-xs sm:text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5">1</span>
                    <span>Maintain healthy lifestyle and balanced nutrition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5">2</span>
                    <span>Regular health check-ups and screenings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5">3</span>
                    <span>Seek early medical attention when symptoms appear</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5">4</span>
                    <span>Follow local health authority guidelines</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-start gap-3 sm:gap-4">
            <HeartIcon className="h-6 w-6 sm:h-8 sm:w-8 text-rose-500 mt-1" />
            <div>
              <CardTitle className="text-base sm:text-lg">About Our System</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Disease monitoring and surveillance platform</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base">
              Our Disease Surveillance and Monitoring System (DSMS) is a comprehensive real-time platform designed to help prevent 
              disease outbreaks through early detection, rapid response, and data-driven decision making. The system enables:
            </p>
            <ul className="mt-3 sm:mt-4 space-y-2 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5 flex-shrink-0">→</span>
                <span>Anonymous reporting of disease symptoms for both communicable and non-communicable diseases</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">→</span>
                <span>Real-time geospatial mapping of disease hotspots and outbreak areas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">→</span>
                <span>Advanced analytics and reporting to help health officials make informed decisions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">→</span>
                <span>Public education about disease prevention, symptoms, and health awareness</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">→</span>
                <span>Multi-disease tracking including dengue, tuberculosis, diabetes, and other priority health conditions</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 