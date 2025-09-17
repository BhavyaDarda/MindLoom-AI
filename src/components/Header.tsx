import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Menu, Zap, Github, MessageSquare, ChevronRight, LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { TransformationHistory } from "@/components/TransformationHistory";
export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut, isLoading } = useAuth();
  const navItems = [{
    label: "Features",
    href: "#features"
  }, {
    label: "Demo",
    href: "#demo"
  }, {
    label: "Upload",
    href: "#upload"
  }];
  return <header className="fixed top-0 w-full z-50 bg-background brutal-border-thick border-t-0 border-l-0 border-r-0 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Brutal Logo */}
          <div className="flex items-center gap-4">
            <div className="bg-primary brutal-border brutal-shadow p-3 transform -rotate-12">
              <Zap className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase">
                MindLoom AI
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navItems.map(item => <a key={item.label} href={item.href} className="text-xs xl:text-sm font-black uppercase text-foreground hover:text-primary transition-colors brutal-hover">
                {item.label}
              </a>)}
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* History button */}
            <div className="hidden sm:block">
              <TransformationHistory />
            </div>

            {!isLoading && (
              <>
                {user ? (
                  <>
                    {/* User info */}
                    <div className="hidden md:flex items-center gap-2 text-sm">
                      <User className="w-4 h-4" />
                      <span className="font-medium truncate max-w-32">
                        {user.email}
                      </span>
                    </div>

                    {/* GitHub link for hackathon credibility */}
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Button>

                    {/* Sign Out button */}
                    <Button variant="outline" size="sm" onClick={signOut} className="font-black">
                      <LogOut className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">SIGN OUT</span>
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Sign In button */}
                    <Button variant="outline" size="sm" asChild className="font-black">
                      <Link to="/auth">
                        <LogIn className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">SIGN IN</span>
                      </Link>
                    </Button>

                    {/* Get Started button */}
                    <Button variant="brutal" size="sm" asChild className="font-black">
                      <Link to="/auth">
                        <span className="hidden sm:inline">GET STARTED</span>
                        <span className="sm:hidden">START</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <Button variant="outline" size="sm" className="lg:hidden font-black" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && <div className="lg:hidden mt-4 pt-4 brutal-border border-l-0 border-r-0 border-b-0">
            <div className="flex flex-col space-y-4">
              {navItems.map(item => <a key={item.label} href={item.href} className="text-sm font-black uppercase text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  {item.label}
                </a>)}
              <div className="flex flex-col gap-3 pt-4 brutal-border border-l-0 border-r-0 border-b-0">
                <div className="sm:hidden">
                  <TransformationHistory />
                </div>
                
                {!isLoading && (
                  <>
                    {user ? (
                      <>
                        <div className="flex items-center gap-2 text-sm md:hidden">
                          <User className="w-4 h-4" />
                          <span className="font-medium truncate">
                            {user.email}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" className="justify-start">
                          <Github className="w-4 h-4 mr-2" />
                          View on GitHub
                        </Button>
                        <Button variant="outline" size="sm" onClick={signOut} className="justify-start">
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <Button variant="brutal" size="sm" asChild className="justify-start">
                        <Link to="/auth">
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In / Get Started
                        </Link>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>}
      </div>
    </header>;
}