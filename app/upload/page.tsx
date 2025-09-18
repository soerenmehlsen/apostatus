'use client';
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  filename: string;
  uploadDate: string;
  location: string;
  products?: any[];
}

// Function to format date consistently
const formatDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC' // Force UTC to avoid server/client mismatch
    }).format(new Date(dateString));
  } catch (error) {
    return 'Invalid Date';
  }
};


export default function UploadPage() {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client before rendering dates
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // Simulate progress
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(i);
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Refresh file list
        await fetchUploadedFiles();
        
         toast.success("Upload successful", {
          description: result.message,
          duration: 3000,
        });
      } else {
        toast.error("Upload failed", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Upload failed", {
        description: "An error occurred during upload",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const fetchUploadedFiles = async () => {
    try {
      const response = await fetch('/api/upload');
      const data = await response.json();
      setUploadedFiles(data.files || []);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      toast.error("Failed to fetch files");
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/upload?id=${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
         toast.success("File deleted", {
          description: "File has been removed successfully",
        });
      } else {
        toast.error("Delete failed", {
          description: "Failed to delete file",
        });
      }
    } catch (error) {
      toast.error("Delete failed", {
        description: "Failed to delete file",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Load files on component mount
  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  return (
    <div className="space-y-6 px-6 py-4">
      <h1 className="text-2xl font-bold">Create New Stocktake Session</h1>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >  
        <h2 className="text-xl font-bold py-4">
          Drag and drop your CSV files here
        </h2>
        <p className="text-lg font-medium">
          You can upload multiple files at once. Each file should contain stock
          data for a specific location.
        </p>
        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4 mt-4" />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Show progress bar when uploading */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Uploading files...</span>
            <span className="text-sm text-gray-500">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-medium">Uploaded Files</CardTitle>
        </CardHeader>
        <CardContent>
         {uploadedFiles.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No files uploaded yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadedFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.filename}</TableCell>
                    <TableCell> {isClient ? formatDate(file.uploadDate) : 'Loading...'}</TableCell>
                    <TableCell>{file.location}</TableCell>
                    <TableCell>{file.products?.length || 0}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
