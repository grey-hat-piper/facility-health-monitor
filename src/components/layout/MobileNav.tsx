import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building, 
  Users, 
  AlertTriangle, 
  FileText 
} from "lucide-react";

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'facilities', label: 'Facilities', icon: Building },
  { id: 'workers', label: 'Workers', icon: Users },
  { id: 'faults', label: 'Faults', icon: AlertTriangle },
  { id: 'reports', label: 'Reports', icon: FileText },
];

export const MobileNav = ({ activeTab, onTabChange }: MobileNavProps) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
              activeTab === item.id 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
            onClick={() => onTabChange(item.id)}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
