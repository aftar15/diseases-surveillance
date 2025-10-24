"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MapIcon, BarChart2Icon, FileTextIcon, InfoIcon, Leaf } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export function MainNav() {
  const pathname = usePathname();
  
  const navItems: NavItem[] = [
    {
      title: "Map",
      href: "/",
      icon: <MapIcon className="h-4 w-4 mr-2" />,
    },
    {
      title: "Report Case",
      href: "/report",
      icon: <FileTextIcon className="h-4 w-4 mr-2" />,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart2Icon className="h-4 w-4 mr-2" />,
    },
    {
      title: "About Diseases",
      href: "/about",
      icon: <Leaf className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <nav className="flex items-center space-x-2">
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "default" : "ghost"}
          asChild
          size="sm"
          className={pathname === item.href ? "shadow-sm" : ""}
        >
          <Link
            href={item.href}
            className={cn(
              "flex items-center",
              pathname === item.href
                ? "text-primary-foreground font-medium"
                : "text-primary/70 hover:text-primary"
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  );
} 