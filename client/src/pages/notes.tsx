import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Edit3, Code, Search, Plus, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import type { Note } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function Notes() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

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

  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      return await apiRequest("DELETE", `/api/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Success",
        description: "Note deleted successfully.",
      });
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
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/notes", { 
        title: "Untitled Note",
        content: "",
        noteType: "general",
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

  const filteredNotes = notes?.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8 mx-auto max-w-7xl sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">All Notes</h1>
            <p className="text-muted-foreground">Manage your notes and documents</p>
          </div>
          <Button onClick={() => createNoteMutation.mutate()} data-testid="button-create-note">
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-notes"
          />
        </div>

        {/* Notes List */}
        {notesLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading notes...</div>
        ) : filteredNotes && filteredNotes.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <Card 
                key={note.id} 
                className="hover-elevate transition-all duration-150 group"
                data-testid={`card-note-${note.id}`}
              >
                <CardContent className="p-4">
                  <div 
                    className="cursor-pointer mb-3"
                    onClick={() => setLocation(`/editor/${note.id}`)}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {getNoteTypeIcon(note.noteType)}
                      </div>
                      <Badge variant={getNoteTypeBadgeVariant(note.noteType) as any} data-testid={`badge-type-${note.id}`}>
                        {note.noteType}
                      </Badge>
                    </div>
                    <h3 className="font-medium mb-1 truncate" data-testid={`text-title-${note.id}`}>{note.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {note.content ? note.content.substring(0, 100) : "Empty note"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {note.updatedAt && formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1"
                      onClick={() => setLocation(`/editor/${note.id}`)}
                      data-testid={`button-open-${note.id}`}
                    >
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure you want to delete this note?")) {
                          deleteMutation.mutate(note.id);
                        }
                      }}
                      data-testid={`button-delete-${note.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No notes found matching your search." : "No notes yet. Create your first note to get started!"}
              </p>
              {!searchQuery && (
                <Button onClick={() => createNoteMutation.mutate()} data-testid="button-create-first">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Note
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
