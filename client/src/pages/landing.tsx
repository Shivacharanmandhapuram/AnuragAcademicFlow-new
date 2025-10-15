import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, CheckCircle, Shield } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Landing() {
  const [name, setName] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const setNameMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/auth/set-name", { name });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setShowDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set name",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setNameMutation.mutate(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-[#8B5CF6] text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-24 mx-auto max-w-7xl sm:px-8 lg:px-12">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl" data-testid="text-hero-title">
              Modern Academic Workspace
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 font-light" data-testid="text-hero-subtitle">
              Share. Cite. Verify.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 border-white"
                onClick={() => setShowDialog(true)}
                data-testid="button-get-started"
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 text-white border-white/30 backdrop-blur-sm hover:bg-white/20"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="px-6 py-20 mx-auto max-w-7xl sm:px-8 lg:px-12">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="hover-elevate transition-all duration-150" data-testid="card-feature-share">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Share Notes & Code</h3>
              <p className="text-muted-foreground">
                Create and share academic notes, research papers, and code snippets with your peers and faculty.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all duration-150" data-testid="card-feature-citations">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">AI Citations</h3>
              <p className="text-muted-foreground">
                Generate perfectly formatted citations in APA, MLA, and IEEE styles using AI-powered tools.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all duration-150" data-testid="card-feature-verify">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Verify Authenticity</h3>
              <p className="text-muted-foreground">
                Faculty can detect AI-generated content and verify citation authenticity with advanced tools.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="mx-auto max-w-7xl text-center text-sm text-muted-foreground">
          <p>© 2025 AcademicFlow. All rights reserved.</p>
        </div>
      </footer>

      {/* Name Input Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent data-testid="dialog-name-input">
          <DialogHeader>
            <DialogTitle>Welcome to AcademicFlow</DialogTitle>
            <DialogDescription>
              Please enter your name to get started
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              data-testid="input-name"
            />
            <Button 
              type="submit" 
              className="w-full"
              disabled={setNameMutation.isPending || !name.trim()}
              data-testid="button-submit-name"
            >
              {setNameMutation.isPending ? "Setting up..." : "Continue"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
