import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FileUploadOptions {
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

interface UploadedFile {
  id: string;
  file: File;
  content: string;
  type: 'text' | 'pdf' | 'document' | 'audio' | 'video' | 'image' | 'json';
  storagePath?: string;
  contentPreview?: string;
}

export function useEnhancedFileUpload(options: FileUploadOptions = {}) {
  const { 
    maxSize = 50, 
    allowedTypes = [
      'text/plain', 
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'application/json',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ] 
  } = options;
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const validateFile = useCallback((file: File): string | null => {
    // Size validation
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    
    // Empty file validation
    if (file.size === 0) {
      return 'File is empty';
    }
    
    // Type validation
    if (!allowedTypes.includes(file.type) && !allowedTypes.includes('*/*')) {
      return `File type ${file.type} is not supported. Allowed types: ${allowedTypes.join(', ')}`;
    }
    
    // File name validation
    if (file.name.length > 255) {
      return 'File name is too long (max 255 characters)';
    }
    
    // Check for potentially malicious files
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (suspiciousExtensions.includes(fileExtension)) {
      return 'File type not allowed for security reasons';
    }
    
    return null;
  }, [maxSize, allowedTypes]);

  const getFileType = (file: File): UploadedFile['type'] => {
    if (file.type.includes('pdf')) return 'pdf';
    if (file.type.includes('word') || file.type.includes('document')) return 'document';
    if (file.type.includes('audio')) return 'audio';
    if (file.type.includes('video')) return 'video';
    if (file.type.includes('image')) return 'image';
    if (file.type.includes('json')) return 'json';
    return 'text';
  };

  const readFileContent = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      // For text files, read as text
      if (file.type === 'text/plain' || file.type === 'application/json') {
        reader.readAsText(file);
      } else {
        // For binary files, read as data URL for preview
        reader.readAsDataURL(file);
      }
    });
  }, []);

  const uploadToStorage = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    try {
      const { error } = await supabase.storage
        .from('uploads')
        .upload(fileName, file);

      if (error) throw error;
      return fileName;
    } catch (error) {
      console.error('Storage upload error:', error);
      return null;
    }
  }, [user]);

  const saveFileRecord = useCallback(async (
    file: File,
    storagePath: string,
    contentPreview?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('file_uploads')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: storagePath,
          content_preview: contentPreview
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Database insert error:', error);
      return null;
    }
  }, [user]);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setIsUploading(true);
    
    try {
      const processedFiles: UploadedFile[] = [];
      
      // Validate file count
      if (fileArray.length > 10) {
        toast({
          title: "Too Many Files",
          description: "Maximum 10 files allowed at once",
          variant: "destructive",
        });
        return;
      }
      
      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          toast({
            title: "Invalid File",
            description: `${file.name}: ${validationError}`,
            variant: "destructive",
          });
          continue;
        }
        
        try {
          const content = await readFileContent(file);
          const fileType = getFileType(file);
          
          // Upload to storage if user is authenticated
          let storagePath: string | undefined;
          let fileId: string | null = null;
          
          if (user) {
            storagePath = await uploadToStorage(file);
            if (storagePath) {
              // Create content preview for text files
              const contentPreview = fileType === 'text' || fileType === 'json' 
                ? content.substring(0, 500) 
                : undefined;
              
              fileId = await saveFileRecord(file, storagePath, contentPreview);
            }
            
            if (!fileId) {
              toast({
                title: "Upload Failed",
                description: `Failed to save ${file.name} to database`,
                variant: "destructive",
              });
              continue;
            }
          } else {
            // For non-authenticated users, create a temporary ID
            fileId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            toast({
              title: "Limited Mode",
              description: "Sign in to save files permanently and access full features",
              variant: "default",
            });
          }
          
          processedFiles.push({
            id: fileId,
            file,
            content,
            type: fileType,
            storagePath,
            contentPreview: fileType === 'text' || fileType === 'json' ? content.substring(0, 500) : undefined
          });
        } catch (error) {
          console.error('File processing error:', error);
          toast({
            title: "File Processing Error",
            description: `Failed to process ${file.name}: ${error.message}`,
            variant: "destructive",
          });
        }
      }
      
      if (processedFiles.length > 0) {
        setUploadedFiles(prev => [...prev, ...processedFiles]);
        toast({
          title: "Files Processed",
          description: `Successfully processed ${processedFiles.length} file(s)`,
        });
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [validateFile, readFileContent, uploadToStorage, saveFileRecord, toast, user]);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  return {
    uploadFiles,
    removeFile,
    clearFiles,
    uploadedFiles,
    isUploading,
    validateFile,
  };
}