import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Upload, FileText, Download, Trash2, User } from "lucide-react";
import type { Pdf } from "@shared/schema";

export default function PDFSharing() {
  const { toast } = useToast();
  const [uploadData, setUploadData] = useState({
    title: "",
    subject: "",
    description: "",
    file: null as File | null,
  });

  const { data: allPdfs, isLoading: isLoadingAll } = useQuery<(Pdf & { user: { firstName: string | null; lastName: string | null } })[]>({
    queryKey: ["/api/pdfs"],
  });

  const { data: myPdfs, isLoading: isLoadingMy } = useQuery<Pdf[]>({
    queryKey: ["/api/pdfs/my"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/pdfs/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to upload PDF");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pdfs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pdfs/my"] });
      setUploadData({ title: "", subject: "", description: "", file: null });
      toast({
        title: "Success",
        description: "PDF uploaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload PDF",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/pdfs/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pdfs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pdfs/my"] });
      toast({
        title: "Success",
        description: "PDF deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete PDF",
        variant: "destructive",
      });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pdfs/${id}/download`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to get download URL");
      }
      return await res.json() as { downloadUrl: string; fileName: string };
    },
    onSuccess: (data: { downloadUrl: string; fileName: string }) => {
      window.open(data.downloadUrl, '_blank');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadData(prev => ({ ...prev, file: acceptedFiles[0] }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleUpload = () => {
    if (!uploadData.file || !uploadData.title || !uploadData.subject) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select a PDF file",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('title', uploadData.title);
    formData.append('subject', uploadData.subject);
    if (uploadData.description) {
      formData.append('description', uploadData.description);
    }

    uploadMutation.mutate(formData);
  };

  const handleDownload = (id: string) => {
    downloadMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this PDF?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="container mx-auto py-8 px-4" data-testid="page-pdf-sharing">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">PDF Sharing</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Share and access subject PDFs with other students
      </p>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList data-testid="tabs-pdf">
          <TabsTrigger value="all" data-testid="tab-all-pdfs">All PDFs</TabsTrigger>
          <TabsTrigger value="my" data-testid="tab-my-pdfs">My PDFs</TabsTrigger>
          <TabsTrigger value="upload" data-testid="tab-upload">Upload PDF</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoadingAll ? (
            <div className="text-center py-8" data-testid="loading-all">Loading PDFs...</div>
          ) : !allPdfs || allPdfs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">No PDFs available yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allPdfs.map((pdf) => (
                <Card key={pdf.id} data-testid={`card-pdf-${pdf.id}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5" />
                      {pdf.title}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4" />
                        {pdf.user.firstName} {pdf.user.lastName}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{pdf.subject}</p>
                    </div>
                    {pdf.description && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{pdf.description}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{formatFileSize(pdf.fileSize)}</p>
                      <Button 
                        size="sm" 
                        onClick={() => handleDownload(pdf.id)}
                        data-testid={`button-download-${pdf.id}`}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="space-y-4">
          {isLoadingMy ? (
            <div className="text-center py-8" data-testid="loading-my">Loading your PDFs...</div>
          ) : !myPdfs || myPdfs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">You haven't uploaded any PDFs yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myPdfs.map((pdf) => (
                <Card key={pdf.id} data-testid={`card-my-pdf-${pdf.id}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5" />
                      {pdf.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{pdf.subject}</p>
                    </div>
                    {pdf.description && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{pdf.description}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{formatFileSize(pdf.fileSize)}</p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDownload(pdf.id)}
                          data-testid={`button-download-my-${pdf.id}`}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDelete(pdf.id)}
                          data-testid={`button-delete-${pdf.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload New PDF</CardTitle>
              <CardDescription>Share a subject PDF with other students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Data Structures Notes"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Computer Science"
                  value={uploadData.subject}
                  onChange={(e) => setUploadData({ ...uploadData, subject: e.target.value })}
                  data-testid="input-subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Provide more details about the PDF content..."
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  data-testid="input-description"
                />
              </div>

              <div className="space-y-2">
                <Label>PDF File *</Label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                  }`}
                  data-testid="dropzone-upload"
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  {uploadData.file ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{uploadData.file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(uploadData.file.size)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isDragActive ? 'Drop the PDF here' : 'Drag & drop a PDF here, or click to select'}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">Maximum file size: 10 MB</p>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="w-full"
                data-testid="button-upload"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload PDF"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
