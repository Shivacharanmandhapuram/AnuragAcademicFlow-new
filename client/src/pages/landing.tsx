import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [showDialog, setShowDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setShowDialog(false);
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
      const res = await apiRequest("POST", "/api/auth/signup", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setShowDialog(false);
      toast({
        title: "Account created!",
        description: "Welcome to AcademicFlow.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Signup failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail.trim() && loginPassword.trim()) {
      loginMutation.mutate({ email: loginEmail.trim(), password: loginPassword.trim() });
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupEmail.trim() && signupPassword.trim()) {
      signupMutation.mutate({
        email: signupEmail.trim(),
        password: signupPassword.trim(),
        firstName: signupFirstName.trim() || undefined,
        lastName: signupLastName.trim() || undefined,
      });
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

      {/* Auth Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-auth">
          <DialogHeader>
            <DialogTitle>Welcome to AcademicFlow</DialogTitle>
            <DialogDescription>
              Sign in to your account or create a new one
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    data-testid="input-login-email"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    data-testid="input-login-password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending || !loginEmail.trim() || !loginPassword.trim()}
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="First Name (optional)"
                    value={signupFirstName}
                    onChange={(e) => setSignupFirstName(e.target.value)}
                    data-testid="input-signup-firstname"
                  />
                  <Input
                    type="text"
                    placeholder="Last Name (optional)"
                    value={signupLastName}
                    onChange={(e) => setSignupLastName(e.target.value)}
                    data-testid="input-signup-lastname"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    data-testid="input-signup-email"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    data-testid="input-signup-password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={signupMutation.isPending || !signupEmail.trim() || !signupPassword.trim()}
                  data-testid="button-signup"
                >
                  {signupMutation.isPending ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
