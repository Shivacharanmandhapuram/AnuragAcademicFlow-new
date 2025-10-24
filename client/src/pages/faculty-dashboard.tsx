import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function FacultyDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8 mx-auto max-w-7xl sm:px-8 lg:px-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-faculty-welcome">
            Professor Dashboard
          </h1>
          <p className="text-muted-foreground">Academic integrity and assessment tools</p>
        </div>

        {/* Faculty Tools Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Faculty Tools</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            <Card 
              className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-150" 
              onClick={() => setLocation("/faculty/ai-detect")}
              data-testid="card-tool-ai-detection"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Detection</h3>
                    <p className="text-sm text-muted-foreground">Analyze content</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-150" 
              onClick={() => setLocation("/faculty/citation-check")}
              data-testid="card-tool-citation-check"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Citation Checker</h3>
                    <p className="text-sm text-muted-foreground">Verify sources</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
