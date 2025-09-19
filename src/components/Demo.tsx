import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Volume2, 
  Download, 
  Share2, 
  Eye,
  FileText,
  Upload,
  Brain,
  BookOpen,
  Sparkles,
  Clock,
  BarChart3,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useEnhancedFileUpload } from "@/hooks/useEnhancedFileUpload";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTransformationHistory } from "@/hooks/useTransformationHistory";
import { supabase } from "@/integrations/supabase/client";
import { useDropzone } from "react-dropzone";

export function Demo() {
  const [currentDemo, setCurrentDemo] = useState("summary");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transformationResult, setTransformationResult] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveTransformation } = useTransformationHistory();
  const { uploadFiles, uploadedFiles, isUploading, clearFiles } = useEnhancedFileUpload();

  const onDrop = async (acceptedFiles: File[]) => {
    await uploadFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'video/mp4': ['.mp4'],
      'application/json': ['.json'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    }
  });

  const demoContent = {
    summary: {
      title: "AI Summary Example",
      type: "Article Summary",
      duration: "30 sec read",
      content: `
         Key Points: 
        • Advanced AI models can now understand context and nuance in human language
        • Natural language processing has improved dramatically with transformer architectures
        • Applications include content summarization, translation, and creative writing
        • Ethical considerations around AI bias and misinformation remain important challenges
        
         Main Insight: 
        The rapid advancement in AI language models represents a paradigm shift in how we interact with and process information, requiring both excitement and caution as we integrate these tools into daily workflows.
      `,
      icon: FileText,
      color: "text-primary"
    },
    mindmap: {
      title: "Interactive Mindmap",
      type: "Visual Structure", 
      duration: "Interactive",
      content: `
        🧠 ✅AI Language Models
        ├── 📚 Core Technologies
        │   ├── Transformer Architecture
        │   ├── Attention Mechanisms
        │   └── Neural Networks
        ├── 🎯 Applications
        │   ├── Content Summarization
        │   ├── Language Translation
        │   ├── Creative Writing
        │   └── Code Generation
        ├── ⚡ Benefits
        │   ├── Increased Productivity
        │   ├── Better Accessibility
        │   └── Enhanced Creativity
        └── ⚠️ Challenges
            ├── Bias & Fairness
            ├── Misinformation
            └── Ethical Use
      `,
      icon: Brain,
      color: "text-accent"
    },
    files: {
      title: "File Processing",
      type: "Multi-format Support",
      duration: "Instant",
      content: transformationResult || `
        📁  Upload Any File Type: 
        
        •  Documents : PDF, DOCX, TXT files
        •  Audio : MP3, WAV files for transcription
        •  Video : MP4 files for analysis
        •  Data : JSON, CSV files for processing
        •  Images : PNG, JPG for OCR and analysis
        
         AI Processing: 
        • Automatic content extraction
        • Intelligent text analysis
        • Multi-modal understanding
        • Context-aware transformations
        
        ${uploadedFiles.length > 0 ? ` Uploaded Files:  ${uploadedFiles.map(f => f.file.name).join(', ')}` : ' Drop a file above to start processing! '}
      `,
      icon: Upload,
      color: "text-accent"
    },
    notes: {
      title: "Study Notes",
      type: "Learning Material",
      duration: "Study guide",
      content: `
        📖  Study Guide: AI Language Models 
        
         Definition: 
        AI language models are neural networks trained to understand and generate human language by learning patterns from vast text datasets.
        
         Key Concepts to Remember: 
        1.  Transformer Architecture  - The foundation of modern language models
        2.  Attention Mechanisms  - How models focus on relevant information
        3.  Fine-tuning  - Adapting models for specific tasks
        
         Study Questions: 
        • What makes transformer architecture different from previous approaches?
        • How do attention mechanisms improve model performance?
        • What are the main ethical considerations when deploying AI language models?
        
         Further Reading: 
        • "Attention Is All You Need" - Original transformer paper
        • AI Ethics guidelines from major tech companies
      `,
      icon: BookOpen,
      color: "text-primary"
    }
  };

  const demoTypes = [
    { id: "summary", label: "Summary", icon: FileText },
    { id: "mindmap", label: "Mindmap", icon: Brain },
    { id: "files", label: "Files", icon: Upload },
    { id: "notes", label: "Study Notes", icon: BookOpen }
  ];

  const processFile = async (transformationType: string) => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No File Selected",
        description: "Please upload a file first.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to process files.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const file = uploadedFiles[0];
      const session = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('file-processor', {
        body: {
          fileId: file.id,
          transformationType,
          customPrompt: transformationType === 'notes' ? 'Create comprehensive study notes with key concepts and questions' : null
        },
        headers: session.data.session ? {
          Authorization: `Bearer ${session.data.session.access_token}`
        } : {}
      });

      if (error) throw error;

      if (data.success) {
        setTransformationResult(data.transformedContent);
        setCurrentDemo('files');
        
        // Save to transformation history
        await saveTransformation(
          undefined,
          data.title || `${transformationType} of ${file.file.name}`,
          transformationType,
          { transformedContent: data.transformedContent },
          file.content
        );
        
        toast({
          title: "File Processed",
          description: "Your file has been successfully transformed!",
        });
      } else {
        throw new Error(data.error || 'Processing failed');
      }
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Processing Error",
        description: error.message || "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const currentContent = demoContent[currentDemo as keyof typeof demoContent];

  return (
    <section id="demo" className="py-24 px-6 font-unbound">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section header */}
        <div className="text-center space-y-6">
          <Badge variant="outline" className="bg-accent text-accent-foreground brutal-border font-black px-4 py-2 text-lg">
            {/* <Play className="w-4 h-4 mr-2" /> */}
            Live Demo
          </Badge>
          
          <h2 className="text-4xl md:text-6xl font-black">
            <span className="text-foreground">See MindLoom AI</span>
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              In Action
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience how MindLoom AI transforms complex content into your preferred format. 
            Try our interactive demo with real AI-generated examples.
          </p>
        </div>

        {/* Demo interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Demo type selector */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Choose Transformation</h3>
            {demoTypes.map((type) => (
              <Button
                key={type.id}
                variant={currentDemo === type.id ? "brutal" : "ghost"}
                className="w-full justify-start text-left h-auto p-4 font-black uppercase"
                onClick={() => {
                  setCurrentDemo(type.id);
                  if (type.id !== 'files' && uploadedFiles.length > 0) {
                    processFile(type.id);
                  }
                }}
                disabled={isProcessing}
              >
                {isProcessing && type.id !== 'files' && uploadedFiles.length > 0 ? (
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                ) : (
                  <type.icon className="w-5 h-5 mr-3" />
                )}
                <div>
                  <div className="font-black">{type.label}</div>
                  <div className="text-sm opacity-70">
                    {demoContent[type.id as keyof typeof demoContent].type}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Demo content */}
          <div className="lg:col-span-2">
            <Card className="bg-background brutal-border brutal-shadow h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br from-muted to-muted/50`}>
                      <currentContent.icon className={`w-6 h-6 ${currentContent.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{currentContent.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {currentContent.duration}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {currentDemo === "podcast" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {currentDemo === "files" && (
                  <div className="space-y-4">
                    {/* File Upload Zone */}
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                        ${isUploading ? 'opacity-50 pointer-events-none' : 'hover:border-primary hover:bg-primary/5'}
                      `}
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      
                      {isUploading ? (
                        <div className="space-y-2">
                          <Loader2 className="w-6 h-6 mx-auto animate-spin" />
                          <p className="text-sm text-muted-foreground">Uploading file...</p>
                        </div>
                      ) : uploadedFiles.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            File uploaded: {uploadedFiles[0].file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Choose a transformation type above to process
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              clearFiles();
                              setTransformationResult(null);
                            }}
                          >
                            Upload Different File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            {isDragActive ? 'Drop your file here' : 'Drop a file here or click to browse'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Supports PDF, DOCX, TXT, MP3, MP4, JSON, and images
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Processing indicator */}
                    {isProcessing && (
                      <div className="bg-muted brutal-border p-4 space-y-2">
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm font-medium">Processing file...</span>
                        </div>
                        <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-primary h-full w-2/3 rounded-full animate-pulse" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-line text-sm leading-relaxed">
                    {currentContent.content}
                  </div>
                </div>

                {/* Demo stats */}
                <div className="bg-muted brutal-border p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {currentDemo === 'files' && uploadedFiles.length > 0 ? '99%' : '95%'}
                      </div>
                      <div className="text-xs text-muted-foreground">Accuracy</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-secondary">
                        {currentDemo === 'files' && transformationResult ? '1.8s' : '2.3s'}
                      </div>
                      <div className="text-xs text-muted-foreground">Process Time</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-accent">
                        {currentDemo === 'files' && transformationResult 
                          ? transformationResult.split(' ').length 
                          : '847'
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">Words</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Try demo CTA */}
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-bold">Ready to Transform Your Content?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="brutal" size="lg" className="text-lg px-8 font-black">
              <Sparkles className="w-5 h-5 mr-2" />
              START FREE TRIAL
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 font-black">
              <Eye className="w-5 h-5 mr-2" />
              WATCH FULL DEMO
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}