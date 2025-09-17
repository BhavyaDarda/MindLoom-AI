import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Link2, FileText, PlayCircle, Zap, Brain, Headphones, Download, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "@/components/FileUpload";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Skeleton } from "@/components/ui/skeleton";
import heroBackground from "@/assets/hero-background.jpg";

export function Hero() {
  const [inputUrl, setInputUrl] = useState("");
  const [inputText, setInputText] = useState("");
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformResult, setTransformResult] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const { saveTransformation } = useLocalStorage();

  const transformationTypes = [
    {
      id: "summary",
      label: "Summary",
      icon: FileText,
      description: "Get concise key points",
      color: "text-primary"
    },
    {
      id: "mindmap",
      label: "Mindmap",
      icon: Brain,
      description: "Visual knowledge structure",
      color: "text-accent"
    },
    {
      id: "podcast",
      label: "Podcast",
      icon: Headphones,
      description: "AI-generated audio content",
      color: "text-secondary"
    },
    {
      id: "legal",
      label: "Legal Analysis",
      icon: Download,
      description: "Demystify legal documents",
      color: "text-destructive"
    }
  ];

  // URL validation
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleTransformUrl = async (transformationType = "summary") => {
    if (!inputUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(inputUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }
    
    setIsTransforming(true);
    setTransformResult(null);
    
    try {
      toast({
        title: "Processing Content",
        description: "Extracting content from URL...",
      });

      // Step 1: Extract content from URL
      const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke('content-scraper', {
        body: { url: inputUrl }
      });

      if (scrapeError || !scrapeData?.success) {
        throw new Error(scrapeData?.error || 'Failed to extract content from URL');
      }

      toast({
        title: "Content Extracted",
        description: "Transforming with AI...",
      });

      // Step 2: Transform content
      const { data: transformData, error: transformError } = await supabase.functions.invoke('content-transformer', {
        body: {
          content: scrapeData.content,
          transformationType,
          title: scrapeData.title
        }
      });

      if (transformError || !transformData?.success) {
        throw new Error(transformData?.error || 'Failed to transform content');
      }

      // Save to local storage
      const resultId = saveTransformation(
        inputUrl,
        scrapeData.title,
        transformationType,
        transformData,
        scrapeData.content
      );

      const fullResult = {
        ...transformData,
        transformationType,
        title: scrapeData.title,
        url: inputUrl,
        timestamp: Date.now(),
      };

      setTransformResult(fullResult);
      setShowResults(true);
      
      toast({
        title: "Transformation Complete!",
        description: `Successfully created ${transformationType}`,
      });

    } catch (error) {
      console.error('Transformation error:', error);
      toast({
        title: "Transformation Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsTransforming(false);
    }
  };

  const handleTransformText = async (transformationType = "summary") => {
    if (!inputText.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter some text to transform",
        variant: "destructive",
      });
      return;
    }

    if (inputText.trim().length < 50) {
      toast({
        title: "Text Too Short",
        description: "Please enter at least 50 characters",
        variant: "destructive",
      });
      return;
    }
    
    setIsTransforming(true);
    setTransformResult(null);
    
    try {
      toast({
        title: "Processing Text",
        description: "Transforming with AI...",
      });

      // Transform content directly
      const { data: transformData, error: transformError } = await supabase.functions.invoke('content-transformer', {
        body: {
          content: inputText,
          transformationType,
          title: "Direct Text Input"
        }
      });

      if (transformError || !transformData?.success) {
        throw new Error(transformData?.error || 'Failed to transform content');
      }

      // Save to local storage
      const resultId = saveTransformation(
        undefined,
        "Direct Text Input",
        transformationType,
        transformData,
        inputText
      );

      const fullResult = {
        ...transformData,
        transformationType,
        title: "Direct Text Input",
        timestamp: Date.now(),
      };

      setTransformResult(fullResult);
      setShowResults(true);
      
      toast({
        title: "Transformation Complete!",
        description: `Successfully created ${transformationType}`,
      });

    } catch (error) {
      console.error('Transformation error:', error);
      toast({
        title: "Transformation Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsTransforming(false);
    }
  };

  const handleFilesUploaded = (files: any[]) => {
    setUploadedFiles(files);
  };

  const handleTransformFiles = async (transformationType = "summary") => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files",
        description: "Please upload files first",
        variant: "destructive",
      });
      return;
    }
    
    setIsTransforming(true);
    setTransformResult(null);
    
    try {
      toast({
        title: "Processing Files",
        description: "Transforming uploaded content with AI...",
      });

      // Combine all file contents
      const combinedContent = uploadedFiles.map(f => f.content).join('\n\n---\n\n');
      const fileNames = uploadedFiles.map(f => f.file.name).join(', ');

      // Transform content
      const { data: transformData, error: transformError } = await supabase.functions.invoke('content-transformer', {
        body: {
          content: combinedContent,
          transformationType,
          title: `Uploaded Files: ${fileNames}`
        }
      });

      if (transformError || !transformData?.success) {
        throw new Error(transformData?.error || 'Failed to transform content');
      }

      // Save to local storage
      const resultId = saveTransformation(
        undefined,
        `Uploaded Files: ${fileNames}`,
        transformationType,
        transformData,
        combinedContent
      );

      const fullResult = {
        ...transformData,
        transformationType,
        title: `Uploaded Files: ${fileNames}`,
        timestamp: Date.now(),
      };

      setTransformResult(fullResult);
      setShowResults(true);
      
      toast({
        title: "Transformation Complete!",
        description: `Successfully processed ${uploadedFiles.length} file(s)`,
      });

    } catch (error) {
      console.error('Transformation error:', error);
      toast({
        title: "Transformation Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsTransforming(false);
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center py-24 px-6">
      {/* Brutal background pattern */}
      <div className="absolute inset-0 brutal-pattern" />
      <div className="absolute inset-0 brutal-dots" />

      {/* Floating brutal elements - Better mobile positioning */}
      <div className="absolute top-20 left-4 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 bg-primary brutal-border brutal-shadow rotate-12 animate-brutal-bounce" />
      <div className="absolute top-32 right-4 sm:top-40 sm:right-20 w-10 h-10 sm:w-16 sm:h-16 bg-secondary brutal-border brutal-shadow -rotate-12 animate-brutal-shake" />
      <div className="absolute bottom-32 left-4 sm:bottom-40 sm:left-20 w-16 h-8 sm:w-24 sm:h-12 bg-accent brutal-border brutal-shadow rotate-45" />

      <div className="relative z-10 max-w-6xl mx-auto text-center space-y-12">
        {/* Brutal headline */}
        <div className="space-y-8">
          <div className="bg-primary text-primary-foreground brutal-border brutal-shadow-lg px-8 py-4 inline-block transform -rotate-2">
            <div className="flex items-center gap-3 text-lg font-black uppercase">
              <Sparkles className="w-6 h-6" />
              AI CONTENT TRANSFORMER
            </div>
          </div>
          
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black tracking-tighter leading-none">
            <div className="bg-foreground text-background brutal-border brutal-shadow-lg px-3 xs:px-4 sm:px-6 md:px-8 py-2 xs:py-3 sm:py-4 mb-2 xs:mb-3 sm:mb-4 transform rotate-1">
              MAKE
            </div>
            <div className="bg-primary text-primary-foreground brutal-border brutal-shadow-lg px-3 xs:px-4 sm:px-6 md:px-8 py-2 xs:py-3 sm:py-4 mb-2 xs:mb-3 sm:mb-4 transform -rotate-1">
              COMPLEX
            </div>
            <div className="bg-secondary text-secondary-foreground brutal-border brutal-shadow-lg px-3 xs:px-4 sm:px-6 md:px-8 py-2 xs:py-3 sm:py-4 mb-2 xs:mb-3 sm:mb-4 transform rotate-2">
              SIMPLE
            </div>
            <div className="bg-accent text-accent-foreground brutal-border brutal-shadow-lg px-3 xs:px-4 sm:px-6 md:px-8 py-2 xs:py-3 sm:py-4 transform -rotate-1">
              AGAIN.
            </div>
          </h1>

          <div className="bg-muted brutal-border brutal-shadow px-3 xs:px-4 sm:px-6 md:px-8 py-3 xs:py-4 sm:py-5 md:py-6 max-w-4xl mx-auto">
            <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold uppercase leading-tight">
              HACKATHON PROJECT: Transform any content into summaries, mindmaps, and more using AI. 
              Built with React, Supabase, and modern AI APIs.
            </p>
          </div>
        </div>

        {/* Brutal content transformation interface */}
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-background brutal-border-thick brutal-shadow-lg">
            <div className="bg-foreground text-background p-4">
              <h2 className="text-2xl font-black uppercase tracking-wider">AI CONTENT PROCESSOR</h2>
            </div>
            
            <Tabs defaultValue="url" className="w-full">
              <div className="p-6 space-y-6">
                <TabsList className="bg-muted brutal-border w-full h-auto p-1 xs:p-2 grid grid-cols-3 gap-1">
                  <TabsTrigger value="url" className="brutal-border bg-primary text-primary-foreground font-black uppercase text-xs sm:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground p-1 xs:p-2">
                    <Link2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">URL</span>
                    <span className="xs:hidden">U</span>
                  </TabsTrigger>
                  <TabsTrigger value="text" className="brutal-border bg-primary text-primary-foreground font-black uppercase text-xs sm:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground p-1 xs:p-2">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">TEXT</span>
                    <span className="xs:hidden">T</span>
                  </TabsTrigger>
                  <TabsTrigger value="video" className="brutal-border bg-primary text-primary-foreground font-black uppercase text-xs sm:text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground p-1 xs:p-2">
                    <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">VIDEO</span>
                    <span className="xs:hidden">V</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-6">
                  <div className="space-y-6">
                    <div className="bg-secondary text-secondary-foreground brutal-border p-4 transform -rotate-1">
                      <h3 className="text-xl font-black uppercase">PASTE ANY URL TO DESTROY</h3>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Input
                          type="url"
                          placeholder="https://example.com/article or https://youtube.com/watch?v=..."
                          value={inputUrl}
                          onChange={(e) => setInputUrl(e.target.value)}
                          className="h-12 sm:h-16 text-sm sm:text-lg bg-background brutal-border font-bold pl-12 sm:pl-16"
                        />
                        <Link2 className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-foreground w-4 h-4 sm:w-6 sm:h-6" />
                      </div>
                      <Button 
                        variant="warning" 
                        size="lg" 
                        onClick={() => handleTransformUrl("summary")}
                        disabled={!inputUrl.trim() || isTransforming}
                        className="h-12 sm:h-16 px-4 sm:px-8 text-sm sm:text-lg w-full sm:w-auto"
                      >
                        {isTransforming ? (
                          <>
                            <Zap className="w-4 h-4 sm:w-6 sm:h-6 mr-2 animate-brutal-shake" />
                            <span className="hidden xs:inline">DESTROYING...</span>
                            <span className="xs:hidden">...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 sm:w-6 sm:h-6 mr-2" />
                            <span className="hidden xs:inline">DESTROY!</span>
                            <span className="xs:hidden">GO!</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-6">
                  <div className="space-y-6">
                    <div className="bg-secondary text-secondary-foreground brutal-border p-4 transform rotate-1">
                      <h3 className="text-xl font-black uppercase">PASTE OR TYPE YOUR CONTENT</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <Textarea
                        placeholder="PASTE YOUR ARTICLE, RESEARCH PAPER, OR ANY TEXT CONTENT HERE..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-40 bg-background brutal-border font-bold resize-none text-sm placeholder:text-muted-foreground"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{inputText.length} characters (minimum 50)</span>
                        {inputText.length >= 50 && <span className="text-green-500">✓ Ready to transform</span>}
                      </div>
                      <Button 
                        variant="brutal" 
                        size="lg" 
                        className="w-full"
                        onClick={() => handleTransformText("summary")}
                        disabled={inputText.trim().length < 50 || isTransforming}
                      >
                        {isTransforming ? (
                          <>
                            <Zap className="w-5 h-5 mr-2 animate-brutal-shake" />
                            DESTROYING TEXT...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5 mr-2" />
                            DESTROY TEXT
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="video" className="space-y-6">
                  <div className="space-y-6">
                    <div className="bg-accent text-accent-foreground brutal-border p-4 transform -rotate-1">
                      <h3 className="text-xl font-black uppercase">UPLOAD FILES OR DOCUMENTS</h3>
                    </div>
                    
                    <FileUpload 
                      onFilesUploaded={handleFilesUploaded}
                      maxFiles={3}
                    />
                    
                    {uploadedFiles.length > 0 && (
                      <Button 
                        variant="warning" 
                        size="lg" 
                        className="w-full"
                        onClick={() => handleTransformFiles("summary")}
                        disabled={isTransforming}
                      >
                        {isTransforming ? (
                          <>
                            <Zap className="w-5 h-5 mr-2 animate-brutal-shake" />
                            PROCESSING FILES...
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 mr-2" />
                            DESTROY {uploadedFiles.length} FILE(S)
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Loading state */}
        {isTransforming && (
          <div className="bg-background brutal-border brutal-shadow-lg p-8 space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-primary animate-brutal-shake" />
                <h3 className="text-2xl font-black uppercase">DESTRUCTION IN PROGRESS</h3>
              </div>
              <p className="text-muted-foreground font-bold">AI is analyzing and transforming your content...</p>
            </div>
            
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        )}

        {/* Brutal transformation options */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {transformationTypes.map((type) => (
            <div key={type.id} className="bg-background brutal-border brutal-shadow hover:brutal-shadow-lg transition-all duration-100 p-6 text-center cursor-pointer group hover:-translate-y-2">
              <div className="bg-muted brutal-border p-4 mb-4 mx-auto w-fit group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <type.icon className="w-8 h-8" />
              </div>
              <h4 className="font-black uppercase mb-2 text-sm">{type.label}</h4>
              <p className="text-xs font-bold uppercase text-muted-foreground">{type.description}</p>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button variant="brutal" size="lg" className="text-xl px-12 py-6 h-auto">
            <Sparkles className="w-6 h-6 mr-3" />
            START DESTROYING
          </Button>
          <Button variant="warning" size="lg" className="text-xl px-12 py-6 h-auto">
            INSTALL BOOKMARKLET
          </Button>
        </div>
      </div>
      
      {/* Results Display Modal */}
      {showResults && transformResult && (
        <ResultsDisplay 
          result={transformResult}
          onClose={() => setShowResults(false)}
        />
      )}
    </section>
  );
}