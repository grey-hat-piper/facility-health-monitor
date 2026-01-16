import { Bell, FileText, Building2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg gradient-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
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
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs" variant="critical">
              3
            </Badge>
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <FileText className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
