import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Headphones, 
  FileText, 
  Download, 
  Zap, 
  Globe, 
  BookOpen, 
  MessageSquare,
  BarChart3,
  Share2,
  Clock,
  Sparkles
} from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Summaries",
      description: "Extract key insights from any content with advanced AI that understands context and meaning.",
      badge: "Core Feature",
      color: "text-primary"
    },
    {
      icon: Headphones,
      title: "Podcast Generation",
      description: "Convert articles and documents into engaging podcast-style audio content.",
      badge: "Audio",
      color: "text-secondary"
    },
    {
      icon: BookOpen,
      title: "Interactive Mindmaps",
      description: "Visualize complex information as beautiful, navigable mind maps.",
      badge: "Visual",
      color: "text-accent"
    },
    {
      icon: MessageSquare,
      title: "Chat with Content",
      description: "Ask questions and get instant answers from your transformed content.",
      badge: "AI Chat",
      color: "text-primary"
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Transform content in over 50 languages with automatic translation.",
      badge: "Global",
      color: "text-secondary"
    },
    {
      icon: BarChart3,
      title: "Content Analytics",
      description: "Get detailed insights about reading time, complexity, and key topics.",
      badge: "Analytics",
      color: "text-accent"
    },
    {
      icon: Share2,
      title: "Easy Sharing",
      description: "Share transformed content with teams or export in multiple formats.",
      badge: "Collaboration",
      color: "text-primary"
    },
    {
      icon: Clock,
      title: "Real-time Processing",
      description: "Lightning-fast content transformation powered by advanced AI models.",
      badge: "Speed",
      color: "text-secondary"
    },
    {
      icon: Download,
      title: "Multiple Export Formats",
      description: "Export as PDF, DOCX, MP3, or interactive web formats.",
      badge: "Export",
      color: "text-accent"
    }
  ];

  const transformationModes = [
    {
      title: "Summary Mode",
      description: "Condense lengthy articles into digestible key points",
      icon: FileText,
      gradient: "from-primary to-accent"
    },
    {
      title: "Study Mode", 
      description: "Create structured notes perfect for learning and revision",
      icon: BookOpen,
      gradient: "from-accent to-secondary"
    },
    {
      title: "Audio Mode",
      description: "Listen to content on-the-go with natural AI narration",
      icon: Headphones,
      gradient: "from-secondary to-primary"
    },
    {
      title: "Visual Mode",
      description: "Transform complex concepts into clear visual representations",
      icon: Brain,
      gradient: "from-primary to-secondary"
    }
  ];

  return (
    <section id="features" className="py-24 px-6 bg-background font-unbound">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section header */}
        <div className="text-center space-y-8">
          <div className="bg-primary text-primary-foreground brutal-border brutal-shadow px-6 py-3 inline-block transform rotate-2">
            <div className="flex items-center gap-3 text-sm font-black uppercase">
              <Sparkles className="w-5 h-5" />
              POWERFUL FEATURES
            </div>
          </div>
          
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase leading-none">
            <div className="bg-foreground text-background brutal-border brutal-shadow-lg px-3 xs:px-4 sm:px-6 py-2 xs:py-3 sm:py-4 mb-2 xs:mb-3 sm:mb-4 transform -rotate-1 inline-block">
              EVERYTHING YOU NEED
            </div>
            <br />
            <div className="bg-primary text-primary-foreground brutal-border brutal-shadow-lg px-3 xs:px-4 sm:px-6 py-2 xs:py-3 sm:py-4 transform rotate-1 inline-block">
              TO SIMPLIFY CONTENT
            </div>
          </h2>
          
          <div className="bg-muted brutal-border px-3 xs:px-4 sm:px-6 md:px-8 py-3 xs:py-4 sm:py-5 md:py-6 max-w-4xl mx-auto">
            <p className="text-sm xs:text-base sm:text-lg font-bold uppercase leading-relaxed">
              OUR ADVANCED AI TECHNOLOGY TRANSFORMS HOW YOU CONSUME AND INTERACT WITH DIGITAL CONTENT,
              MAKING COMPLEX INFORMATION ACCESSIBLE AND ACTIONABLE.
            </p>
          </div>
        </div>

        {/* Transformation modes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {transformationModes.map((mode, index) => (
            <div key={index} className="bg-background brutal-border brutal-shadow hover:brutal-shadow-lg transition-all duration-100 p-6 text-center cursor-pointer group hover:-translate-y-2">
              <div className="bg-secondary brutal-border p-6 mb-6 mx-auto w-fit group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <mode.icon className="w-12 h-12" />
              </div>
              <h3 className="font-black uppercase mb-3 text-lg group-hover:text-primary transition-colors">
                {mode.title}
              </h3>
              <p className="text-sm font-bold uppercase text-muted-foreground leading-tight">
                {mode.description}
              </p>
            </div>
          ))}
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-background brutal-border brutal-shadow hover:brutal-shadow-lg transition-all duration-100 p-6 group hover:-translate-y-1">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-muted brutal-border p-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-100">
                  <feature.icon className="w-8 h-8" />
                </div>
                <div className="bg-secondary text-secondary-foreground brutal-border px-3 py-1 text-xs font-black uppercase">
                  {feature.badge}
                </div>
              </div>
              <h3 className="text-xl font-black uppercase mb-4 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm font-bold leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats section */}
        <div className="bg-background brutal-border-thick brutal-shadow-lg p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-3">
              <div className="text-5xl md:text-6xl font-black text-primary">
                10M+
              </div>
              <div className="text-sm font-black uppercase text-muted-foreground">
                CONTENT PIECES TRANSFORMED
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-5xl md:text-6xl font-black text-secondary">
                50+
              </div>
              <div className="text-sm font-black uppercase text-muted-foreground">
                LANGUAGES SUPPORTED
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-5xl md:text-6xl font-black text-primary">
                95%
              </div>
              <div className="text-sm font-black uppercase text-muted-foreground">
                ACCURACY RATE
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-5xl md:text-6xl font-black text-secondary">
                2s
              </div>
              <div className="text-sm font-black uppercase text-muted-foreground">
                AVERAGE PROCESSING TIME
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}