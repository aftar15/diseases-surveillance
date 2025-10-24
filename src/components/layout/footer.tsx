import Link from "next/link";
import { Leaf, Phone, Mail, MapPin, ExternalLink } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-50 border-t">
      {/* Main footer */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary/10 p-1.5 rounded-md">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-primary">DiseaseTrack</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Ministry of Health
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              The official government portal for disease surveillance and outbreak prevention.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="h-4 w-4 text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-4 w-4 text-primary" />
                <span>contact@diseasetrack.gov</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-primary" />
                <span>123 Government Ave, Capital City</span>
              </div>
            </div>
          </div>
          
          {/* Column 2: Resources */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/resources/reports" className="text-sm text-slate-600 hover:text-primary">
                  Situational Reports
                </Link>
              </li>
              <li>
                <Link href="/resources/data" className="text-sm text-slate-600 hover:text-primary">
                  Open Data Portal
                </Link>
              </li>
              <li>
                <Link href="/resources/publications" className="text-sm text-slate-600 hover:text-primary">
                  Research Publications
                </Link>
              </li>
              <li>
                <Link href="/resources/guidelines" className="text-sm text-slate-600 hover:text-primary">
                  Prevention Guidelines
                </Link>
              </li>
              <li>
                <Link href="/resources/tools" className="text-sm text-slate-600 hover:text-primary">
                  Healthcare Tools
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Legal */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-4">Legal Information</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/accessibility" className="text-sm text-slate-600 hover:text-primary">
                  Accessibility Statement
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-slate-600 hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-slate-600 hover:text-primary">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-slate-600 hover:text-primary">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/open-records" className="text-sm text-slate-600 hover:text-primary">
                  Public Records Request
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Related Sites */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-4">Related Sites</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.who.int/health-topics/dengue-and-severe-dengue" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-slate-600 hover:text-primary flex items-center"
                >
                  <span>World Health Organization</span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.cdc.gov/dengue/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-slate-600 hover:text-primary flex items-center"
                >
                  <span>CDC Dengue Portal</span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-slate-600 hover:text-primary flex items-center"
                >
                  <span>Ministry of Environment</span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-slate-600 hover:text-primary flex items-center"
                >
                  <span>Vector Control Unit</span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Sub footer with compliance info */}
      <div className="border-t bg-slate-100">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              © {currentYear} DiseaseTrack, Ministry of Health. All Rights Reserved.
            </div>
            
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span>Compliance: WCAG 2.1 AA</span>
              <span className="hidden md:inline">|</span>
              <span>Version: 2.1.0</span>
              <span className="hidden md:inline">|</span>
              <span>Last Updated: June 15, {currentYear}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 