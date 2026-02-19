import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, LogIn, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecentUser {
  id: string;
  username: string;
  email: string | null;
}

const Login = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentUsers = async () => {
      const { data } = await supabase
        .from('app_users')
        .select('id, username, email')
        .order('username', { ascending: true });
      if (data) setRecentUsers(data);
    };
    fetchRecentUsers();
  }, []);

  const handleSelectUser = (user: RecentUser) => {
    setSelectedUserId(user.id);
    setUsername(user.username);
    setEmail(user.email || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim().endsWith('@lgc.edu.gh')) {
      toast.error('Only school emails (@lgc.edu.gh) are allowed');
      return;
    }

    setIsLoading(true);
    const result = await login(username, email, password);
    
    if (result.success) {
      toast.success('Welcome to FacilityHub!');
      navigate('/');
    } else {
      toast.error(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-xl gradient-primary">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">FacilityHub</CardTitle>
          <CardDescription>School Facilities Management System</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {recentUsers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Select User</Label>
              <div className="grid grid-cols-3 gap-2">
                {recentUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all hover:bg-accent ${
                      selectedUserId === user.id
                        ? 'border-primary bg-accent ring-2 ring-primary/20'
                        : 'border-border'
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                        {getInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium truncate w-full text-center">
                      {user.username}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setSelectedUserId(null); }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">School Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@lgc.edu.gh"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Only @lgc.edu.gh emails allowed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                'Signing in...'
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
