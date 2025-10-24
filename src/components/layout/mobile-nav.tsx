"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  MenuIcon, 
  Leaf,
  MapIcon, 
  BarChart2Icon, 
  FileTextIcon, 
  AlertTriangleIcon, 
  UserIcon,
  Settings2Icon, 
  BookIcon,
  GlobeIcon,
  XIcon,
  ListChecksIcon
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { UserRole } from "@/types";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  section?: string;
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  
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

  // Filter nav items based on authentication (same logic as Sidebar)
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
      // Hide Analytics for public users
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <MenuIcon className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[260px] sm:w-[280px]">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex flex-col h-full">
          <div className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-md">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-primary text-sm">DSMS</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Ministry of Health
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto py-4">
            <nav className="space-y-6 px-2">
              {Object.entries(sections).map(([section, items]) => (
                <div key={section} className="space-y-1">
                  <div className="px-3 text-xs uppercase text-muted-foreground font-medium tracking-wider mb-2">
                    {section}
                  </div>
                  {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          isActive 
                            ? "bg-primary/10 text-primary font-medium" 
                            : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                        )}
                      >
                        {item.icon}
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>
          
          <div className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Ministry of Health
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 