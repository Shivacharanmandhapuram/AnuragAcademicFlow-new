import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Home, FileText, GraduationCap, LogOut } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    },
  });

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
            <div className="flex items-center gap-3">
              {user?.firstName && (
                <span className="text-sm text-muted-foreground" data-testid="text-user-name">
                  {user.firstName}
                </span>
              )}
              {user?.role && (
                <span className="text-xs text-muted-foreground capitalize hidden sm:inline" data-testid="text-user-role">
                  {user.role}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
