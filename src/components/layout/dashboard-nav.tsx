"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboardIcon, 
  AlertTriangleIcon, 
  FileTextIcon, 
  SettingsIcon, 
  BarChart2Icon 
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export function DashboardNav() {
  const pathname = usePathname();
  
  const navItems: NavItem[] = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: <LayoutDashboardIcon className="h-4 w-4 mr-2" />,
    },
    {
      title: "Alerts",
      href: "/dashboard/alerts",
      icon: <AlertTriangleIcon className="h-4 w-4 mr-2" />,
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: <FileTextIcon className="h-4 w-4 mr-2" />,
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: <BarChart2Icon className="h-4 w-4 mr-2" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <SettingsIcon className="h-4 w-4 mr-2" />,
    }
  ];

  return (
    <div className="bg-muted/40 p-2 rounded-lg mb-6">
      <nav className="flex items-center space-x-1 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = 
            item.href === "/dashboard" 
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
              
          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "ghost"}
              asChild
              size="sm"
              className="flex-shrink-0"
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center",
                  isActive
                    ? "text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            </Button>
          );
        })}
      </nav>
    </div>
  );
} 