import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useLocation } from "wouter";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function AIDetect() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [content, setContent] = useState("");
  const [result, setResult] = useState<{ score: number; indicators: string[] } | null>(null);

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

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/faculty/detect-ai", { content });
      return response as unknown as { score: number; indicators: string[] };
    },
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getScoreBadge = (score: number) => {
    if (score >= 70) {
      return <Badge variant="destructive" className="text-base px-4 py-1"><AlertTriangle className="w-4 h-4 mr-2" />High Likelihood</Badge>;
    } else if (score >= 40) {
      return <Badge className="bg-amber-500 text-white text-base px-4 py-1"><AlertTriangle className="w-4 h-4 mr-2" />Moderate</Badge>;
    } else {
      return <Badge className="bg-emerald-500 text-white text-base px-4 py-1"><CheckCircle className="w-4 h-4 mr-2" />Low Likelihood</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (user?.role !== "faculty") {
    return <div className="flex items-center justify-center min-h-screen">Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8 mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/faculty/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold" data-testid="text-page-title">AI Content Detection</h1>
            <p className="text-muted-foreground">Analyze student submissions for AI-generated content</p>
          </div>
        </div>

        {/* Input Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Paste Submission Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste student submission or upload file..."
              className="min-h-[400px] font-mono text-sm"
              data-testid="textarea-content"
            />
            <Button
              onClick={() => analyzeMutation.mutate()}
              disabled={!content || analyzeMutation.isPending}
              size="lg"
              className="w-full"
              data-testid="button-analyze"
            >
              {analyzeMutation.isPending ? "Analyzing..." : "Analyze Content →"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <Card data-testid="card-results">
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score */}
              <div className="text-center py-6">
                <div className="text-6xl font-bold mb-4" data-testid="text-ai-score">{result.score}%</div>
                <div className="flex justify-center">{getScoreBadge(result.score)}</div>
              </div>

              {/* Details */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full" data-testid="button-toggle-details">
                    Analysis Details
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="space-y-2">
                    {result.indicators && result.indicators.length > 0 ? (
                      result.indicators.map((indicator, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-3 bg-muted rounded-lg" data-testid={`indicator-${idx}`}>
                          <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{indicator}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No specific indicators found</p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
