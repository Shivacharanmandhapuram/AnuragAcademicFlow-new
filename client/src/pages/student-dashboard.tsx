import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit3, Code, Search, Plus } from "lucide-react";
import { useLocation } from "wouter";
import type { Note } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function StudentDashboard() {
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

  const { data: notes, isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
    enabled: isAuthenticated,
  });

  const createNoteMutation = useMutation({
    mutationFn: async (noteType: "research" | "code" | "general") => {
      return await apiRequest("POST", "/api/notes", { 
        title: "Untitled Note",
        content: "",
        noteType,
        isPublic: false
      });
    },
    onSuccess: (data: Note) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setLocation(`/editor/${data.id}`);
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
        description: "Failed to create note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getNoteTypeIcon = (type: string) => {
    switch (type) {
      case "research": return <Edit3 className="w-4 h-4" />;
      case "code": return <Code className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getNoteTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "research": return "default";
      case "code": return "secondary";
      default: return "outline";
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8 mx-auto max-w-7xl sm:px-8 lg:px-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-welcome">
            Welcome back, {user?.firstName || "Student"}!
          </h1>
          <p className="text-muted-foreground">Ready to create something amazing today?</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card 
              className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-150" 
              onClick={() => createNoteMutation.mutate("general")}
              data-testid="card-action-share-notes"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Share Notes</h3>
                    <p className="text-sm text-muted-foreground">General notes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-150" 
              onClick={() => createNoteMutation.mutate("research")}
              data-testid="card-action-write-paper"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Edit3 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Write Paper</h3>
                    <p className="text-sm text-muted-foreground">Research notes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-150" 
              onClick={() => createNoteMutation.mutate("code")}
              data-testid="card-action-share-code"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Code className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Share Code</h3>
                    <p className="text-sm text-muted-foreground">Code snippets</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-150" 
              onClick={() => setLocation("/notes")}
              data-testid="card-action-find-notes"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Search className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Find Notes</h3>
                    <p className="text-sm text-muted-foreground">Browse library</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Notes Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Notes</h2>
          {notesLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading notes...</div>
          ) : notes && notes.length > 0 ? (
            <div className="space-y-3">
              {notes.slice(0, 5).map((note) => (
                <Card 
                  key={note.id} 
                  className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-150"
                  onClick={() => setLocation(`/editor/${note.id}`)}
                  data-testid={`card-note-${note.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          {getNoteTypeIcon(note.noteType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate" data-testid={`text-note-title-${note.id}`}>{note.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {note.updatedAt && formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getNoteTypeBadgeVariant(note.noteType) as any} data-testid={`badge-note-type-${note.id}`}>
                        {note.noteType}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No notes yet. Create your first note to get started!</p>
                <Button onClick={() => createNoteMutation.mutate("general")} data-testid="button-create-first-note">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Note
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        onClick={() => createNoteMutation.mutate("general")}
        data-testid="button-floating-create"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
