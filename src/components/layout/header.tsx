"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  LogOut, 
  User, 
  Settings,
  ChevronDown,
  Lock,
  Leaf,
  Search,
  GlobeIcon,
  MapPin,
  X
} from "lucide-react";

// San Jose barangays with coordinates
const BARANGAYS = [
  { id: "san-jose-municipality", name: "Municipality of San Jose", latitude: 10.0095, longitude: 125.5708 },
  { id: "san-jose-san-juan", name: "San Juan", latitude: 10.0132, longitude: 125.5686 },
  { id: "san-jose-poblacion", name: "Poblacion", latitude: 10.0080, longitude: 125.5718 },
  { id: "san-jose-sta-cruz", name: "Santa Cruz", latitude: 10.0193, longitude: 125.5707 },
  { id: "san-jose-don-ruben", name: "Don Ruben Ecleo", latitude: 10.0147, longitude: 125.5757 },
  { id: "san-jose-justiniana", name: "Justiniana Edera", latitude: 10.0100, longitude: 125.5750 },
  { id: "san-jose-aurelio", name: "Aurelio", latitude: 10.0093, longitude: 125.5747 },
  { id: "san-jose-mahayahay", name: "Mahayahay", latitude: 10.0065, longitude: 125.5852 },
  { id: "san-jose-cuarenta", name: "Cuarinta", latitude: 10.0213, longitude: 125.6038 },
  { id: "san-jose-wilson", name: "Wilson", latitude: 10.0257, longitude: 125.5871 },
  { id: "san-jose-matingbe", name: "Matingbe", latitude: 10.0053, longitude: 125.5738 },
  { id: "san-jose-jaquez", name: "Jacquez", latitude: 10.0071, longitude: 125.5724 },
  { id: "san-jose-luna", name: "Luna", latitude: 10.0020, longitude: 125.5680 },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { setMapCenter, setMapZoom } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Fetch reports to count cases per barangay
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports?status=validated');
        if (response.ok) {
          const data = await response.json();
          setReports(data);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };
    
    fetchReports();
  }, []);
  
  // Filter barangays based on search query
  const filteredBarangays = BARANGAYS.filter(barangay =>
    barangay.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Count reports per barangay
  const getReportCount = (barangay: typeof BARANGAYS[0]) => {
    return reports.filter(report => {
      if (report.locationId === barangay.id) return true;
      // Also match by coordinates with tolerance
      const tolerance = 0.001;
      return Math.abs(report.location.lat - barangay.latitude) < tolerance &&
             Math.abs(report.location.lng - barangay.longitude) < tolerance;
    }).length;
  };
  
  // Handle location selection
  const handleLocationSelect = (barangay: typeof BARANGAYS[0]) => {
    // Update map center and zoom
    setMapCenter([barangay.longitude, barangay.latitude]);
    setMapZoom(15); // Zoom in closer to the barangay
    
    // Navigate to home page if not already there
    if (pathname !== '/') {
      router.push('/');
    }
    
    // Close suggestions and clear search
    setShowSuggestions(false);
    setSearchQuery("");
    
    // Small delay to ensure map updates after navigation
    setTimeout(() => {
      setMapCenter([barangay.longitude, barangay.latitude]);
      setMapZoom(15);
    }, 100);
  };
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 py-2 sm:py-3 sticky top-0 z-50">
      <div className="container flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Logo and branding */}
        <div className="flex items-center">
          <MobileNav />
          
          <Link href="/" className="flex items-center">
            <div className="bg-primary/10 p-1 sm:p-1.5 rounded-md mr-2 sm:mr-3">
              <Image 
                src="/logo.svg" 
                alt="Logo" 
                width={24} 
                height={24} 
                className="h-5 w-5 sm:h-6 sm:w-6" 
              />
            </div>
            <div>
              <div className="font-semibold text-primary text-sm sm:text-base lg:text-lg leading-tight">
                Disease Surveillance
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground leading-tight hidden sm:block">
                Ministry of Health
              </div>
            </div>
          </Link>
          
          <div className="hidden lg:block h-8 w-px bg-slate-200 mx-6"></div>
          
          <div className="hidden lg:block text-sm text-slate-600">
            <div className="text-xs text-muted-foreground">Disease Surveillance Management System</div>
          </div>
        </div>
        
        {/* Right: Search and authentication */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          <div className="hidden md:flex relative" ref={searchRef}>
            <input
              type="search"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-[140px] lg:w-[240px] h-9 rounded-md border border-input px-3 py-1 pr-8 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setShowSuggestions(false);
                }}
                className="absolute right-8 top-0 h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <button 
              type="button" 
              className="absolute right-0 top-0 h-9 w-9 flex items-center justify-center text-muted-foreground"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchQuery && filteredBarangays.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
                <div className="p-2 text-xs font-medium text-muted-foreground border-b">
                  Locations ({filteredBarangays.length})
                </div>
                {filteredBarangays.map((barangay) => {
                  const caseCount = getReportCount(barangay);
                  return (
                    <button
                      key={barangay.id}
                      onClick={() => handleLocationSelect(barangay)}
                      className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors text-left border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <div>
                          <div className="text-sm font-medium">{barangay.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {barangay.latitude.toFixed(4)}, {barangay.longitude.toFixed(4)}
                          </div>
                        </div>
                      </div>
                      {caseCount > 0 && (
                        <div className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">
                          <span className="font-medium">{caseCount}</span>
                          <span>case{caseCount !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            
            {/* No results message */}
            {showSuggestions && searchQuery && filteredBarangays.length === 0 && (
              <div className="absolute top-full mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg p-4 text-sm text-muted-foreground text-center z-50">
                No locations found for "{searchQuery}"
              </div>
            )}
          </div>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1 h-9">
                  <User className="h-4 w-4" />
                  <span className="max-w-[80px] lg:max-w-[100px] truncate hidden md:inline">{user?.name}</span>
                  <ChevronDown className="h-3 w-3 opacity-50 hidden md:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2 text-sm">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <div className="mt-1">
                    <span className="inline-flex items-center bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      {user?.role?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={logout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
} 