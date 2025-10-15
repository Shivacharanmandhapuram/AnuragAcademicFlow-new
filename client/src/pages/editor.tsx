import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Share2, MoreVertical, Sparkles, Book, ChevronRight, ChevronLeft, Trash2 } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import type { Note, Citation } from "@shared/schema";
import dynamic from 'next/dynamic';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { CitationModal } from "@/components/citation-modal";
import { AIAssistantModal } from "@/components/ai-assistant-modal";

// Dynamically import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function Editor() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/editor/:id");
  const noteId = params?.id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState<"research" | "code" | "general">("general");
  const [language, setLanguage] = useState("javascript");
  const [isPublic, setIsPublic] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [citationModalOpen, setCitationModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiMode, setAiMode] = useState<"improve" | "summarize" | "grammar">("improve");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  const { data: note, isLoading } = useQuery<Note>({
    queryKey: ["/api/notes", noteId],
    enabled: isAuthenticated && !!noteId,
  });

  const { data: citations } = useQuery<Citation[]>({
    queryKey: ["/api/citations", noteId],
    enabled: isAuthenticated && !!noteId && noteType === "research",
  });

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setNoteType(note.noteType);
      setLanguage(note.language || "javascript");
      setIsPublic(note.isPublic);
      setShareToken(note.shareToken || null);
    }
  }, [note]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Note>) => {
      return await apiRequest("PUT", `/api/notes/${noteId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes", noteId] });
      setLastSaved(new Date());
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
    },
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/notes/${noteId}/share`);
    },
    onSuccess: (data: { shareToken: string }) => {
      setShareToken(data.shareToken);
      const shareUrl = `${window.location.origin}/shared/${data.shareToken}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard.",
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
        description: "Failed to generate share link.",
        variant: "destructive",
      });
    },
  });

  const deleteCitationMutation = useMutation({
    mutationFn: async (citationId: string) => {
      return await apiRequest("DELETE", `/api/citations/${citationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/citations", noteId] });
      toast({
        title: "Citation deleted",
        description: "Citation has been removed.",
      });
    },
  });

  // Auto-save with debounce
  useEffect(() => {
    if (!note) return;
    
    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content || noteType !== note.noteType || language !== note.language || isPublic !== note.isPublic) {
        updateMutation.mutate({ title, content, noteType, language, isPublic });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, content, noteType, language, isPublic]);

  const getLanguageExtension = () => {
    switch (language) {
      case "python": return python();
      case "java": return java();
      case "cpp": return cpp();
      case "html": return html();
      case "css": return css();
      default: return javascript();
    }
  };

  if (authLoading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!note) {
    return <div className="flex items-center justify-center min-h-screen">Note not found</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-3 border-b flex-wrap">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation(-1)}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 min-w-0 border-0 focus-visible:ring-0 text-lg font-medium"
          placeholder="Untitled Note"
          data-testid="input-title"
        />

        <div className="flex items-center gap-2">
          <Select value={noteType} onValueChange={(v) => setNoteType(v as any)}>
            <SelectTrigger className="w-32" data-testid="select-note-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="code">Code</SelectItem>
            </SelectContent>
          </Select>

          {noteType === "code" && (
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32" data-testid="select-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button 
            variant="outline"
            onClick={() => shareMutation.mutate()}
            disabled={shareMutation.isPending}
            data-testid="button-share"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>

          {noteType === "research" && (
            <Button 
              onClick={() => setCitationModalOpen(true)}
              data-testid="button-citation"
            >
              <Book className="w-4 h-4 mr-2" />
              Cite
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-ai-menu">
                <Sparkles className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setAiMode("improve"); setAiModalOpen(true); }} data-testid="menu-ai-improve">
                Improve Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setAiMode("summarize"); setAiModalOpen(true); }} data-testid="menu-ai-summarize">
                Summarize
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setAiMode("grammar"); setAiModalOpen(true); }} data-testid="menu-ai-grammar">
                Fix Grammar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-more">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsPublic(!isPublic)} data-testid="menu-toggle-public">
                {isPublic ? "Make Private" : "Make Public"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          {noteType === "research" ? (
            <div className="max-w-4xl mx-auto">
              <ReactQuill
                value={content}
                onChange={setContent}
                className="h-full"
                theme="snow"
                placeholder="Start writing your research paper..."
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link'],
                    ['clean']
                  ]
                }}
              />
            </div>
          ) : noteType === "code" ? (
            <CodeMirror
              value={content}
              height="100%"
              extensions={[getLanguageExtension()]}
              onChange={(value) => setContent(value)}
              theme={oneDark}
              className="text-base"
            />
          ) : (
            <div className="max-w-4xl mx-auto">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[500px] text-base resize-none border-0 focus-visible:ring-0"
                placeholder="Start typing..."
                data-testid="textarea-content"
              />
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        {noteType === "research" && (
          <div className={`border-l transition-all duration-200 ${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
            <div className="w-80 p-4 h-full overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Citations</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  data-testid="button-close-sidebar"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              {citations && citations.length > 0 ? (
                <div className="space-y-3">
                  {citations.map((citation) => (
                    <div key={citation.id} className="p-3 bg-muted rounded-lg group" data-testid={`citation-${citation.id}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="outline" data-testid={`badge-style-${citation.id}`}>{citation.citationStyle}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteCitationMutation.mutate(citation.id)}
                          data-testid={`button-delete-citation-${citation.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm" data-testid={`text-citation-${citation.id}`}>{citation.formattedCitation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No citations yet. Click the Cite button to add one.
                </p>
              )}
            </div>
          </div>
        )}

        {!sidebarOpen && noteType === "research" && (
          <div className="border-l">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="m-2"
              data-testid="button-open-sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t px-6 py-2 text-sm text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isPublic && <Badge variant="outline">Public</Badge>}
          {shareToken && <span className="text-xs">Shareable</span>}
        </div>
        <div data-testid="text-autosave-status">
          {lastSaved ? `Auto-saved ${Math.floor((Date.now() - lastSaved.getTime()) / 1000 / 60)} min ago` : "Not saved yet"}
        </div>
      </div>

      {/* Modals */}
      <CitationModal
        open={citationModalOpen}
        onOpenChange={setCitationModalOpen}
        noteId={noteId || ""}
      />

      <AIAssistantModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        mode={aiMode}
        content={content}
        onApply={(newContent) => {
          setContent(newContent);
          setAiModalOpen(false);
        }}
      />
    </div>
  );
}
