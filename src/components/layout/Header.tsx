import { Bell, LogOut, CalendarDays, FileText, Sparkles } from "lucide-react";
import schoolLogo from '@/assets/default_icon.jpg';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  onCalendarClick?: () => void;
  onReportsClick?: () => void;
  onAIReportClick?: () => void;
}

export const Header = ({ onCalendarClick, onReportsClick, onAIReportClick }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: activityLogs } = useActivityLogs();

  // Get notifications from the last 24 hours only
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const notifications = activityLogs?.filter(log => new Date(log.created_at) > last24h).slice(0, 10) || [];
  const unreadCount = Math.min(notifications.length, 9);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'fault_created':
        return '🔴';
      case 'fault_resolved':
        return '✅';
      case 'worker_added':
        return '👷';
      case 'facility_updated':
        return '🏢';
      case 'report_created':
        return '📝';
      default:
        return '📌';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <img src={schoolLogo} alt="School Logo" className="h-10 w-10 rounded-lg object-contain" />
          <div>
            <h1 className="text-lg font-bold">FacilityHub</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">School Facilities Management</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {user && (
            <span className="text-sm text-muted-foreground hidden sm:block mr-2">
              {user.username}
            </span>
          )}
          
          {/* AI Report icon */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onAIReportClick} 
                  className="text-primary hover:text-primary/80"
                >
                  <Sparkles className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send AI Report</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Reports icon - mobile only */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onReportsClick} 
            title="Reports"
            className="lg:hidden"
          >
            <FileText className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={onCalendarClick} title="Calendar">
            <CalendarDays className="h-5 w-5" />
          </Button>
          
          {/* Notifications popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs" variant="destructive">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 max-h-[70vh] overflow-y-auto" align="end">
              <div className="p-3 border-b">
                <h4 className="font-semibold text-sm">Notifications</h4>
                <p className="text-xs text-muted-foreground">Recent activity in your facility</p>
              </div>
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No notifications yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((log) => (
                      <div key={log.id} className="p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{getEventIcon(log.event_type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{log.event_description}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(log.created_at), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
          
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};