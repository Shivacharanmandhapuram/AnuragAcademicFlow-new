import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, CheckCircle, FileCheck, FileUp } from "lucide-react";
import { useLocation } from "wouter";
import type { Submission } from "@shared/schema";

export default function FacultyDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
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

  const { data: submissions } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
    enabled: isAuthenticated && user?.role === "faculty",
  });

  const ungradedCount = submissions?.filter(s => !s.grade).length || 0;
  const aiDetectedCount = submissions?.filter(s => s.aiDetectionScore && s.aiDetectionScore > 70).length || 0;

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

            <Card 
              className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-150" 
              onClick={() => setLocation("/faculty/submissions")}
              data-testid="card-tool-submissions"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Review Submissions</h3>
                    <p className="text-sm text-muted-foreground">Grade work</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-150" 
              onClick={() => setLocation("/notes")}
              data-testid="card-tool-share-materials"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Share Materials</h3>
                    <p className="text-sm text-muted-foreground">Create notes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <Card 
              className="hover-elevate cursor-pointer transition-all duration-150"
              onClick={() => setLocation("/faculty/submissions")}
              data-testid="card-activity-ungraded"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{ungradedCount} new submissions awaiting review</p>
                      <p className="text-sm text-muted-foreground">Click to review</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {aiDetectedCount > 0 && (
              <Card 
                className="hover-elevate cursor-pointer transition-all duration-150"
                onClick={() => setLocation("/faculty/submissions")}
                data-testid="card-activity-ai-alerts"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium">{aiDetectedCount} AI detection alerts</p>
                        <p className="text-sm text-muted-foreground">High likelihood detected</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
