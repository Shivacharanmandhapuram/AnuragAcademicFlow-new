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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { useLocation } from "wouter";

interface VerificationResult {
  citation: string;
  status: "verified" | "suspicious" | "fake";
  details: string;
}

export default function CitationCheck() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [content, setContent] = useState("");
  const [style, setStyle] = useState<"APA" | "MLA" | "IEEE">("APA");
  const [results, setResults] = useState<VerificationResult[]>([]);

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

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/faculty/verify-citations", { content, style });
      return response.json() as Promise<{ results: VerificationResult[] }>;
    },
    onSuccess: (data) => {
      setResults(data?.results || []);
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
        description: "Failed to verify citations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified": return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "suspicious": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "fake": return <XCircle className="w-5 h-5 text-destructive" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified": return <Badge className="bg-emerald-500 text-white">Verified</Badge>;
      case "suspicious": return <Badge className="bg-amber-500 text-white">Suspicious</Badge>;
      case "fake": return <Badge variant="destructive">Fake</Badge>;
      default: return null;
    }
  };

  const verifiedCount = results?.filter(r => r.status === "verified").length || 0;
  const suspiciousCount = results?.filter(r => r.status === "suspicious").length || 0;
  const fakeCount = results?.filter(r => r.status === "fake").length || 0;

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
            <h1 className="text-3xl font-semibold" data-testid="text-page-title">Citation Authenticity Checker</h1>
            <p className="text-muted-foreground">Verify the authenticity of academic citations</p>
          </div>
        </div>

        {/* Input Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Paste Citations or Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste citations or upload document..."
              className="min-h-[300px] font-mono text-sm"
              data-testid="textarea-citations"
            />
            <div className="flex gap-4">
              <Select value={style} onValueChange={(v) => setStyle(v as any)}>
                <SelectTrigger className="w-40" data-testid="select-citation-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APA">APA</SelectItem>
                  <SelectItem value="MLA">MLA</SelectItem>
                  <SelectItem value="IEEE">IEEE</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => verifyMutation.mutate()}
                disabled={!content || verifyMutation.isPending}
                size="lg"
                className="flex-1"
                data-testid="button-verify"
              >
                {verifyMutation.isPending ? "Verifying..." : "Verify All →"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results.length > 0 && (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <Card data-testid="card-summary-verified">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                    <div>
                      <div className="text-2xl font-bold">{verifiedCount}</div>
                      <div className="text-sm text-muted-foreground">Verified</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-summary-suspicious">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                    <div>
                      <div className="text-2xl font-bold">{suspiciousCount}</div>
                      <div className="text-sm text-muted-foreground">Suspicious</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-summary-fake">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-8 h-8 text-destructive" />
                    <div>
                      <div className="text-2xl font-bold">{fakeCount}</div>
                      <div className="text-sm text-muted-foreground">Fake</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Citation List */}
            <Card>
              <CardHeader>
                <CardTitle>Citation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.map((result, idx) => (
                  <div key={idx} className="p-4 bg-muted rounded-lg" data-testid={`citation-result-${idx}`}>
                    <div className="flex items-start gap-3 mb-2">
                      {getStatusIcon(result.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono mb-2" data-testid={`text-citation-${idx}`}>{result.citation}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(result.status)}
                          <p className="text-xs text-muted-foreground" data-testid={`text-details-${idx}`}>{result.details}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
