import { Link, useNavigate } from 'react-router-dom';
import { Brain, LogOut, Menu, X, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Brain className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold text-gradient">Learner's AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link to="/learn" className="text-muted-foreground hover:text-foreground transition-colors">
                  Learn
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
                  <Flame className="h-4 w-4 text-streak" />
                  <span className="text-sm font-medium">0</span>
                </div>
                <ThemeToggle />
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link to="/auth">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button className="gradient-primary text-primary-foreground shadow-glow">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            {user ? (
              <div className="flex flex-col gap-3">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/learn"
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Learn
                </Link>
                <Button variant="ghost" className="justify-start" onClick={handleSignOut}>
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">Sign In</Button>
                </Link>
                <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full gradient-primary text-primary-foreground">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
