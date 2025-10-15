import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, BookOpen } from "lucide-react";

interface RoleSelectionDialogProps {
  open: boolean;
}

export function RoleSelectionDialog({ open }: RoleSelectionDialogProps) {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<"student" | "faculty" | null>(null);

  const selectRoleMutation = useMutation({
    mutationFn: async (role: "student" | "faculty") => {
      return await apiRequest("POST", "/api/auth/select-role", { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = selectedRole === "faculty" ? "/faculty/dashboard" : "/dashboard";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to select role. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSelectRole = (role: "student" | "faculty") => {
    setSelectedRole(role);
    selectRoleMutation.mutate(role);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-2xl" data-testid="dialog-role-selection">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to AcademicFlow</DialogTitle>
          <DialogDescription>
            Please select your role to get started
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 sm:grid-cols-2 py-4">
          <Card 
            className={`cursor-pointer transition-all duration-150 hover-elevate ${
              selectedRole === "student" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleSelectRole("student")}
            data-testid="card-role-student"
          >
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Student</h3>
                <p className="text-sm text-muted-foreground">
                  Create notes, generate citations, and collaborate with peers
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-150 hover-elevate ${
              selectedRole === "faculty" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleSelectRole("faculty")}
            data-testid="card-role-faculty"
          >
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Faculty</h3>
                <p className="text-sm text-muted-foreground">
                  Review submissions, detect AI content, and verify citations
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectRoleMutation.isPending && (
          <div className="text-center text-sm text-muted-foreground">
            Setting up your account...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
