import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  X, 
  File,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesUploaded: (files: { file: File; content: string; type: string }[]) => void;
  className?: string;
  maxFiles?: number;
}

export function FileUpload({ onFilesUploaded, className, maxFiles = 5 }: FileUploadProps) {
  const { uploadFiles, removeFile, uploadedFiles, isUploading } = useFileUpload({
    maxSize: 10,
    allowedTypes: [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/json'
    ]
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      return;
    }
    
    await uploadFiles(acceptedFiles);
  }, [uploadFiles, uploadedFiles.length, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: maxFiles - uploadedFiles.length,
    disabled: isUploading || uploadedFiles.length >= maxFiles,
  });

  // Notify parent when files change
  React.useEffect(() => {
    if (uploadedFiles.length > 0) {
      onFilesUploaded(uploadedFiles);
    }
  }, [uploadedFiles, onFilesUploaded]);

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('text')) return '📃';
    if (type.includes('csv')) return '📊';
    return '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-6 font-unbound', className)}>
      {/* Upload area */}
      <div
        {...getRootProps()}
        className={cn(
          "brutal-border bg-background p-8 text-center cursor-pointer transition-all duration-200",
          isDragActive && "bg-primary/10 border-primary",
          isUploading && "opacity-50 cursor-not-allowed",
          uploadedFiles.length >= maxFiles && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        
        {isDragActive ? (
          <p className="text-lg font-bold uppercase">DROP FILES HERE!</p>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-bold uppercase">
              {uploadedFiles.length >= maxFiles 
                ? `Maximum ${maxFiles} files reached`
                : `Drag files here or click to browse`
              }
            </p>
            <p className="text-sm text-muted-foreground">
              Supports: PDF, DOC, DOCX, TXT, CSV, JSON (max 10MB each)
            </p>
            <p className="text-xs text-muted-foreground">
              {uploadedFiles.length}/{maxFiles} files uploaded
            </p>
          </div>
        )}
      </div>

      {/* Upload progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold">PROCESSING FILES...</span>
          </div>
          <Progress value={undefined} className="brutal-border" />
        </div>
      )}

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-black uppercase">Uploaded Files:</h4>
          
          {uploadedFiles.map((uploadedFile, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-muted brutal-border"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl">
                  {getFileIcon(uploadedFile.file.type)}
                </span>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {uploadedFile.file.name}
                    </p>
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(uploadedFile.file.size)}</span>
                    <Badge variant="secondary" className="text-xs">
                      {uploadedFile.type}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="flex-shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}