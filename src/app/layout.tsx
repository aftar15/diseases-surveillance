import type { Metadata } from "next";
import { Source_Sans_3, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/contexts/auth-context";
import { SocketProvider } from "@/components/providers/socket-provider";
import { AlertBanner } from "@/components/layout/alert-banner";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  weight: ["400", "500", "600", "700"],
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "Disease Surveillance Management System",
  description: "Official government portal for disease surveillance, monitoring, and outbreak prevention",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sourceSans.variable} ${robotoMono.variable} antialiased min-h-screen flex flex-col bg-background`}
      >
        <ToastProvider>
          <AuthProvider>
            <SocketProvider>
              <AlertBanner />
              <Header />
              <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 py-4 px-4 sm:py-6 sm:px-6 lg:px-8 container mx-auto">
                  <div className="breadcrumbs mb-4 text-sm text-muted-foreground hidden sm:block">
                    <ul className="flex items-center gap-2">
                      <li className="hidden lg:inline">Home</li>
                      <li className="before:content-['/'] before:mx-2 before:text-muted-foreground/50 before:hidden before:lg:inline">
                        Current Page
                      </li>
                    </ul>
                  </div>
                  {children}
                </main>
              </div>
            </SocketProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
