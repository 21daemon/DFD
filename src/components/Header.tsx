
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, FileVideo, BarChart3, User, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const handleLogout = async () => {
    await signOut();
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="font-medium text-xl hidden sm:inline-block">Deep fake Detection</span>
          </Link>
        </div>
        
        <nav className="flex items-center space-x-1">
          <NavLink to="/" exact icon={<Shield className="w-4 h-4" />} label="Home" current={location.pathname} />
          
          {user ? (
            <>
              <NavLink to="/detect" icon={<FileVideo className="w-4 h-4" />} label="Detect" current={location.pathname} />
              <NavLink to="/results" icon={<BarChart3 className="w-4 h-4" />} label="Results" current={location.pathname} />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-2">
                    <User className="w-4 h-4 mr-2" />
                    <span className="hidden md:inline">{user.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <span className="text-muted-foreground">{user.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  current: string;
  exact?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, current, exact = false }) => {
  const isActive = exact ? current === to : current.startsWith(to);
  
  return (
    <Link to={to}>
      <Button 
        variant="ghost" 
        size="sm"
        className={cn(
          "flex items-center space-x-1 px-3 py-2 rounded-md transition-all",
          isActive 
            ? "bg-primary/10 text-primary" 
            : "hover:bg-secondary"
        )}
      >
        {icon}
        <span className="ml-2">{label}</span>
      </Button>
    </Link>
  );
};

export default Header;
