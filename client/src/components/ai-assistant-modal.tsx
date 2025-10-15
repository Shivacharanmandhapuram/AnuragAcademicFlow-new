import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

interface AIAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "improve" | "summarize" | "grammar";
  content: string;
  onApply: (newContent: string) => void;
}

export function AIAssistantModal({ open, onOpenChange, mode, content, onApply }: AIAssistantModalProps) {
  const { toast } = useToast();
  const [result, setResult] = useState<string>("");

  const getTitle = () => {
    switch (mode) {
      case "improve": return "Improve Text";
      case "summarize": return "Summarize Text";
      case "grammar": return "Fix Grammar";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "improve": return "AI will enhance your text for clarity and professional tone";
      case "summarize": return "AI will create a concise summary of your text";
      case "grammar": return "AI will fix grammar and improve your text";
    }
  };

  const processMutation = useMutation({
    mutationFn: async () => {
      const endpoint = mode === "improve" ? "/api/ai/improve" : 
                      mode === "summarize" ? "/api/ai/summarize" : 
                      "/api/ai/grammar";
      return await apiRequest("POST", endpoint, { text: content });
    },
    onSuccess: (data: { result: string }) => {
      setResult(data.result);
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
        description: "Failed to process text. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setResult("");
    onOpenChange(false);
  };

  const handleApply = () => {
    if (result) {
      onApply(result);
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl" data-testid="dialog-ai-assistant">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!result ? (
            <div className="text-center py-8">
              <Button
                onClick={() => processMutation.mutate()}
                disabled={!content || processMutation.isPending}
                size="lg"
                data-testid="button-process-ai"
              >
                {processMutation.isPending ? "Processing..." : `${getTitle()} →`}
              </Button>
              {!content && (
                <p className="text-sm text-muted-foreground mt-4">
                  Add some content to your note first
                </p>
              )}
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Result:</label>
                <Textarea
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="min-h-[200px]"
                  data-testid="textarea-ai-result"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  data-testid="button-cancel-ai"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApply}
                  className="flex-1"
                  data-testid="button-apply-ai"
                >
                  Apply Changes
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
