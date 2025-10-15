import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { Home, FileText, LogOut, GraduationCap } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || "U";
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b bg-card sticky top-0 z-50">
        <div className="px-6 py-3 mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            {/* Logo and Nav Links */}
            <div className="flex items-center gap-6">
              <Link href={user?.role === "faculty" ? "/faculty/dashboard" : "/dashboard"}>
                <div className="flex items-center gap-2 cursor-pointer" data-testid="link-logo">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-semibold text-lg">AcademicFlow</span>
                </div>
              </Link>

              <div className="hidden sm:flex items-center gap-1">
                <Link href={user?.role === "faculty" ? "/faculty/dashboard" : "/dashboard"}>
                  <Button 
                    variant={isActive(user?.role === "faculty" ? "/faculty/dashboard" : "/dashboard") ? "secondary" : "ghost"}
                    size="sm"
                    data-testid="nav-dashboard"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>

                <Link href="/notes">
                  <Button 
                    variant={isActive("/notes") ? "secondary" : "ghost"}
                    size="sm"
                    data-testid="nav-notes"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Notes
                  </Button>
                </Link>
              </div>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.email || "User"} className="object-cover" />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium" data-testid="text-user-name">
                      {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "User"}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid="text-user-email">
                      {user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize" data-testid="text-user-role">
                      {user?.role}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/api/logout'} data-testid="menu-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
