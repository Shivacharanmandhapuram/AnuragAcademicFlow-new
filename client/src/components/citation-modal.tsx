import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Copy, Check } from "lucide-react";

interface CitationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId: string;
}

export function CitationModal({ open, onOpenChange, noteId }: CitationModalProps) {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [style, setStyle] = useState<"APA" | "MLA" | "IEEE">("APA");
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/citations/generate", {
        noteId,
        inputText: input,
        citationStyle: style,
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      setResult(data.formattedCitation);
      queryClient.invalidateQueries({ queryKey: ["/api/citations", noteId] });
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
        description: "Failed to generate citation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Citation copied to clipboard",
      });
    }
  };

  const handleClose = () => {
    setInput("");
    setResult(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl" data-testid="dialog-citation">
        <DialogHeader>
          <DialogTitle>Generate Citation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Enter DOI, URL, or description"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              data-testid="input-citation-source"
            />
          </div>

          <div>
            <Select value={style} onValueChange={(v) => setStyle(v as any)}>
              <SelectTrigger data-testid="select-citation-style">
                <SelectValue placeholder="Citation Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APA">APA</SelectItem>
                <SelectItem value="MLA">MLA</SelectItem>
                <SelectItem value="IEEE">IEEE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!input || generateMutation.isPending}
            className="w-full"
            data-testid="button-generate-citation"
          >
            {generateMutation.isPending ? "Generating..." : "Generate Citation →"}
          </Button>

          {result && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm" data-testid="text-citation-result">{result}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCopy}
                    className="flex-1"
                    data-testid="button-copy-citation"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleClose}
                    className="flex-1"
                    data-testid="button-insert-citation"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
