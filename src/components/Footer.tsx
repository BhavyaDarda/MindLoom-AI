import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Zap, 
  Github, 
  MessageSquare, 
  Mail,
  Heart,
  ExternalLink,
  Trophy,
  Code,
  Lightbulb
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-t from-muted/50 to-background border-t border-white/10 font-unbound ">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hackathon project showcase */}
        <div className="bg-background brutal-border brutal-shadow p-8 md:p-12 mb-16 ">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <h3 className="text-3xl font-black">
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Hackathon Project
                  </span>
                </h3>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built with passion during a hackathon. This AI-powered content transformation tool 
                showcases modern web technologies and intelligent processing capabilities.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="brutal" className="px-6 py-3 font-black">
                <Github className="w-5 h-5 mr-2" />
                VIEW SOURCE CODE
              </Button>
              <Button variant="outline" className="px-6 py-3 font-black">
                <Lightbulb className="w-5 h-5 mr-2" />
                TECHNICAL DETAILS
              </Button>
            </div>
          </div>
        </div>

        {/* Tech stack and project info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Project info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-black">
                  <span className="bg-gradient-primary bg-clip-text ">
                    MindLoom AI
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Hackathon Winner Project
                </p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              An innovative AI-powered content transformation platform built to showcase 
              modern web development and AI integration capabilities.
            </p>
          </div>

          {/* Tech Stack */}
          <div className="space-y-4 ml-36">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Code className="w-4 h-4" />
              Tech Stack
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• React + TypeScript</li>
              <li>• Supabase Backend</li>
              <li>• Tailwind CSS</li>
              <li>• OpenAI/Gemini API</li>
              <li>• Vite Build Tool</li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4 ml-32">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Key Features
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• AI Content Summarization</li>
              <li>• Visual Mindmap Generation</li>
              <li>• Multi-format File Processing</li>
              <li>• Real-time Transformations</li>
              <li>• Secure User Authentication</li>
            </ul>
          </div>
        </div>

        {/* Social links */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground text-center md:text-left">
              <p className="flex items-center gap-1">
                Made with <Heart className="w-4 h-4 text-red-500" /> during a hackathon
              </p>
              <p className="mt-1">
                Demonstrating AI innovation and web development skills
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Github className="w-4 h-4" />
                <a href="https://github.com/Arnav2722/MindLoom-AI"></a>
              </Button>
              {/* <Button variant="ghost" size="sm">
                <MessageSquare className="w-4 h-4" />
              </Button> */}
              <Button variant="ghost" size="sm">
                <Mail className="w-4 h-4" />
                <a href="mailto:"></a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}