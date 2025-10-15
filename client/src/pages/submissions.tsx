import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Eye, Bot, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import type { Submission, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function Submissions() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("all");

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

  const { data: submissions, isLoading: submissionsLoading } = useQuery<(Submission & { student: User })[]>({
    queryKey: ["/api/submissions"],
    enabled: isAuthenticated && user?.role === "faculty",
  });

  const getStatusBadge = (submission: Submission) => {
    if (submission.grade) {
      return <Badge className="bg-emerald-500 text-white">Graded</Badge>;
    }
    if (submission.aiDetectionScore && submission.aiDetectionScore > 70) {
      return <Badge variant="destructive">AI Detected ({submission.aiDetectionScore}%)</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const filteredSubmissions = submissions?.filter(s => {
    switch (activeTab) {
      case "ungraded": return !s.grade;
      case "flagged": return s.aiDetectionScore && s.aiDetectionScore > 70;
      case "graded": return !!s.grade;
      default: return true;
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (user?.role !== "faculty") {
    return <div className="flex items-center justify-center min-h-screen">Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8 mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/faculty/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold" data-testid="text-page-title">Assignment Submissions</h1>
            <p className="text-muted-foreground">Review and grade student work</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList data-testid="tabs-filter">
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            <TabsTrigger value="ungraded" data-testid="tab-ungraded">Ungraded</TabsTrigger>
            <TabsTrigger value="flagged" data-testid="tab-flagged">Flagged</TabsTrigger>
            <TabsTrigger value="graded" data-testid="tab-graded">Graded</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {submissionsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading submissions...</div>
            ) : filteredSubmissions && filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((submission) => (
                <Card 
                  key={submission.id} 
                  className="hover-elevate transition-all duration-150"
                  data-testid={`card-submission-${submission.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-semibold text-lg" data-testid={`text-assignment-${submission.id}`}>
                            {submission.assignmentName}
                          </h3>
                          {getStatusBadge(submission)}
                        </div>
                        <p className="text-muted-foreground mb-3">
                          Student: {submission.student?.firstName} {submission.student?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Submitted {submission.submittedAt && formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                        </p>
                        {submission.grade && (
                          <div className="mt-3">
                            <Badge variant="outline" data-testid={`badge-grade-${submission.id}`}>Grade: {submission.grade}</Badge>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/faculty/submissions/${submission.id}`)}
                          data-testid={`button-view-${submission.id}`}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No submissions found in this category.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
