import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Building, 
  Users, 
  AlertTriangle, 
  FileText, 
  BarChart3,
  Mail,
  CalendarDays
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'facilities', label: 'Facilities', icon: Building },
  { id: 'workers', label: 'Workers', icon: Users },
  { id: 'faults', label: 'Faults', icon: AlertTriangle },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
];

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-card min-h-[calc(100vh-4rem)]">
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-11",
              activeTab === item.id && "bg-primary/10 text-primary font-medium"
            )}
            onClick={() => onTabChange(item.id)}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Button>
        ))}
      </nav>
      
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full gap-2">
          <Mail className="h-4 w-4" />
          Send AI Report
        </Button>
      </div>
    </aside>
  );
};
