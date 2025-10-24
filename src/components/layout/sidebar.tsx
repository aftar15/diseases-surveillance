"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  MapIcon, 
  BarChart2Icon, 
  FileTextIcon, 
  Leaf, 
  InfoIcon, 
  AlertTriangleIcon, 
  UserIcon,
  Settings2Icon, 
  BookIcon,
  GlobeIcon,
  ListChecksIcon,
  MenuIcon
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  section?: string;
}

export function Sidebar(/*{ className }: { className?: string }*/) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const toggleSidebar = () => {
      setIsCollapsed(!isCollapsed);
  };

  const baseNavItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <GlobeIcon className="h-5 w-5" />,
      section: "Main"
    },
    {
      title: "Disease Map",
      href: "/",
      icon: <MapIcon className="h-5 w-5" />,
      section: "Main"
    },
    {
      title: "Report Disease",
      href: "/report",
      icon: <FileTextIcon className="h-5 w-5" />,
      section: "Main"
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart2Icon className="h-5 w-5" />,
      section: "Main"
    },
    {
      title: "Manage Reports",
      href: "/dashboard/reports",
      icon: <ListChecksIcon className="h-5 w-5" />,
      section: "Management"
    },
    {
      title: "Alerts",
      href: "/dashboard/alerts",
      icon: <AlertTriangleIcon className="h-5 w-5" />,
      section: "Management"
    },
    {
      title: "User Management",
      href: "/dashboard/users",
      icon: <UserIcon className="h-5 w-5" />,
      section: "Management"
    },
    {
      title: "System Settings",
      href: "/dashboard/settings",
      icon: <Settings2Icon className="h-5 w-5" />,
      section: "Management"
    },
    {
      title: "About Diseases",
      href: "/about",
      icon: <Leaf className="h-5 w-5" />,
      section: "Information"
    },
  ];

  // Filter nav items based on authentication
  const navItems = baseNavItems.filter(item => {
    // During loading, show only public items to prevent flash of authenticated content
    if (isLoading) {
      if (item.href.startsWith("/dashboard")) return false;
      if (item.href === "/analytics") return false;
      return true;
    }

    if (user) {
      // If logged in, HIDE the public report link
      if (item.href === "/report") return false;

      // If NOT admin, hide user management and settings
      if (user.role !== UserRole.Admin) {
        if (item.href === "/dashboard/users" || item.href === "/dashboard/settings") {
          return false;
        }
      }
    } else {
      // If NOT logged in, HIDE management/dashboard links
      if (item.href.startsWith("/dashboard")) return false;
      // Potentially hide other sections like Analytics too for public
      if (item.href === "/analytics") return false;
    }
    // Show the item by default
    return true;
  });

  // Group items by section
  const sections = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section || "Other";
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {});

  return (
    <aside className={cn(
        "hidden lg:block border-r py-6 pr-4 relative transition-all duration-300 ease-in-out bg-sidebar",
        isCollapsed ? "lg:w-16" : "lg:w-64 lg:px-2"
     )}>
       <div className={cn(
           "flex items-center justify-between gap-2 mb-8",
           isCollapsed ? "px-1 justify-center" : "px-2"
        )}>
          <div className={cn("flex items-center gap-2", isCollapsed ? "justify-center w-full" : "")}>
             <div className={cn("p-1 rounded-md", isCollapsed ? "" : "bg-primary/10")}> 
                <Image 
                  src="/plus.svg" 
                  alt="DSMS Logo" 
                  width={24} 
                  height={24} 
                  className={cn("h-6 w-6")}
                /> 
             </div>
             {!isCollapsed && <div className="self-center text-sm font-semibold">DSMS</div>} 
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-6 w-6", isCollapsed ? "absolute top-4 right-0 translate-x-1/2 bg-background border rounded-full p-1 shadow-md z-10" : "")}
            onClick={toggleSidebar}
           >
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>
        
        <nav className="space-y-6"> 
          {Object.entries(sections).map(([section, items]) => (
            <div key={section} className="space-y-1">
              {!isCollapsed && (
                 <div className="px-2 text-xs uppercase text-muted-foreground font-medium tracking-wider mb-2">
                    {section}
                 </div>
              )} 
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.title : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-md py-2 text-sm transition-colors", 
                      isCollapsed ? "justify-center px-1 py-2" : "px-2",
                      isActive 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <span className={cn(isActive ? "text-sidebar-primary-foreground" : "text-primary")}>
                      {item.icon}
                    </span>
                    {!isCollapsed && item.title} 
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {!isCollapsed && (
          <div className="mt-auto pt-6 border-t px-2">
            <div className="rounded-md bg-muted/50 p-2">
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
                Need assistance?
              </div>
              <p className="text-xs text-muted-foreground">
                Contact our support team or access our documentation portal.
              </p>
              <Link 
                href="/support" 
                className="text-xs text-primary hover:underline block mt-2"
              >
                Contact Support
              </Link>
            </div>
          </div>
        )}
    </aside>
  );
} 