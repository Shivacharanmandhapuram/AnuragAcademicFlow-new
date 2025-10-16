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
  const [result, setResult] = useState<{
    aiScore: number;
    likelihood: string;
    confidence: string;
    indicators: string[];
    details: {
      averageSentenceLength: number;
      sentenceLengthVariation: string;
      genericPhraseCount: number;
      genericPhrasesFound: string[];
      personalPronounUsage: boolean;
      personalVoiceScore: number;
      reasoning?: string;
      humanLikelihood?: number;
    };
  } | null>(null);

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
      return response.json() as Promise<{
        aiScore: number;
        likelihood: string;
        confidence: string;
        indicators: string[];
        details: {
          averageSentenceLength: number;
          sentenceLengthVariation: string;
          genericPhraseCount: number;
          genericPhrasesFound: string[];
          personalPronounUsage: boolean;
          personalVoiceScore: number;
          reasoning?: string;
          humanLikelihood?: number;
        };
      }>;
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

  const getScoreBadge = (score: number, likelihood: string) => {
    if (likelihood === 'HIGH' || score >= 70) {
      return <Badge variant="destructive" className="text-base px-4 py-1"><AlertTriangle className="w-4 h-4 mr-2" />High Likelihood</Badge>;
    } else if (likelihood === 'MEDIUM' || score >= 40) {
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
                <div className="text-6xl font-bold mb-4" data-testid="text-ai-score">{result.aiScore}%</div>
                <div className="flex justify-center gap-2">
                  {getScoreBadge(result.aiScore, result.likelihood)}
                  <Badge variant="outline" className="text-base px-4 py-1">
                    Confidence: {result.confidence}
                  </Badge>
                </div>
              </div>

              {/* Reasoning */}
              {result.details.reasoning && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Analysis Reasoning:</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-reasoning">{result.details.reasoning}</p>
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Avg Sentence Length</p>
                  <p className="text-lg font-semibold" data-testid="text-avg-sentence">{result.details.averageSentenceLength} words</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Sentence Variation</p>
                  <p className="text-lg font-semibold" data-testid="text-sentence-variation">{result.details.sentenceLengthVariation}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Generic Phrases</p>
                  <p className="text-lg font-semibold" data-testid="text-generic-phrases">{result.details.genericPhraseCount}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Personal Voice</p>
                  <p className="text-lg font-semibold" data-testid="text-personal-voice">
                    {result.details.personalPronounUsage ? 'Present' : 'Absent'}
                  </p>
                </div>
              </div>

              {/* Indicators */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full" data-testid="button-toggle-details">
                    View Indicators ({result.indicators.length})
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
                  {result.details.genericPhrasesFound && result.details.genericPhrasesFound.length > 0 && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">Generic Phrases Detected:</p>
                      <div className="flex flex-wrap gap-2">
                        {result.details.genericPhrasesFound.map((phrase, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            "{phrase}"
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>

              {/* Disclaimer */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> AI detection is probabilistic and should be used as one factor in assessment, not definitive proof. Always consider context and other evidence.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
