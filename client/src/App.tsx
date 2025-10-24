import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout";
import { RoleSelectionDialog } from "@/components/role-selection-dialog";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import StudentDashboard from "@/pages/student-dashboard";
import FacultyDashboard from "@/pages/faculty-dashboard";
import Notes from "@/pages/notes";
import Editor from "@/pages/editor";
import SharedNote from "@/pages/shared-note";
import AIDetect from "@/pages/ai-detect";
import CitationCheck from "@/pages/citation-check";
import PDFSharing from "@/pages/pdf-sharing";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show landing page while loading or not authenticated
  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/shared/:token" component={SharedNote} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // Show role selection if user doesn't have a role
  if (isAuthenticated && user && !user.role) {
    return <RoleSelectionDialog open={true} />;
  }

  // Authenticated routes with layout
  return (
    <Layout>
      <Switch>
        {/* Redirect to appropriate dashboard */}
        <Route path="/">
          {user?.role === "faculty" ? <FacultyDashboard /> : <StudentDashboard />}
        </Route>

        {/* Student routes */}
        <Route path="/dashboard" component={StudentDashboard} />
        <Route path="/pdf-sharing" component={PDFSharing} />
        
        {/* Faculty routes */}
        <Route path="/faculty/dashboard" component={FacultyDashboard} />
        <Route path="/faculty/ai-detect" component={AIDetect} />
        <Route path="/faculty/citation-check" component={CitationCheck} />

        {/* Shared routes */}
        <Route path="/notes" component={Notes} />
        <Route path="/editor/:id" component={Editor} />
        <Route path="/shared/:token" component={SharedNote} />

        {/* 404 */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
