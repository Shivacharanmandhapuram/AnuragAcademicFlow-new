import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRoute } from "wouter";
import type { Note } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { FileText, Edit3, Code } from "lucide-react";

export default function SharedNote() {
  const [, params] = useRoute("/shared/:token");
  const token = params?.token;

  const { data: note, isLoading, error } = useQuery<Note>({
    queryKey: ["/api/notes/shared", token],
    enabled: !!token,
  });

  const getNoteTypeIcon = (type: string) => {
    switch (type) {
      case "research": return <Edit3 className="w-5 h-5" />;
      case "code": return <Code className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">This note is not available or has been made private.</p>
            <Button onClick={() => window.location.href = "/"}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="px-6 py-4 mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {getNoteTypeIcon(note.noteType)}
              </div>
              <div>
                <h1 className="text-2xl font-semibold" data-testid="text-note-title">{note.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Shared {note.updatedAt && formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <Badge variant={getNoteTypeBadgeVariant(note.noteType) as any} data-testid="badge-note-type">
              {note.noteType}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 mx-auto max-w-5xl">
        <Card>
          <CardContent className="p-8">
            {note.noteType === "code" ? (
              <pre className="bg-muted p-4 rounded-lg overflow-auto">
                <code className="text-sm font-mono" data-testid="code-content">{note.content}</code>
              </pre>
            ) : (
              <div 
                className="prose prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: note.content }}
                data-testid="text-content"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
