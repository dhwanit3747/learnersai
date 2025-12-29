import { Link } from 'react-router-dom';
import { Brain, Flame, Trophy, BookOpen, Sparkles, ArrowRight, Zap, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';

export default function Dashboard() {
  const learningModes = [
    {
      icon: Zap,
      title: 'Quick Learn',
      description: 'Get a brief overview of any topic',
      href: '/learn?mode=brief',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      icon: Brain,
      title: 'Quiz Mode',
      description: 'Test your knowledge with AI-generated questions',
      href: '/learn?mode=quiz',
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: BookOpen,
      title: 'Flashcards',
      description: 'Review key concepts with smart flashcards',
      href: '/learn?mode=flashcards',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: Sparkles,
      title: 'Comic Story',
      description: 'Learn through illustrated narratives',
      href: '/learn?mode=comic',
      color: 'from-pink-500 to-rose-600',
    },
    {
      icon: Gamepad2,
      title: 'AI Games',
      description: 'Play interactive games to reinforce learning',
      href: '/learn?mode=games',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome to <span className="text-gradient">Learner's AI</span>!
          </h1>
          <p className="text-muted-foreground">Ready to start your learning journey?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-border bg-card shadow-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border bg-card shadow-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border bg-card shadow-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Activities</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Start Learning</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {learningModes.map((mode) => (
              <Link key={mode.title} to={mode.href}>
                <Card className="border-border bg-card shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-full">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <mode.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-1">{mode.title}</h3>
                    <p className="text-sm text-muted-foreground">{mode.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Get Started Section */}
        <Card className="border-border bg-card shadow-card">
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Ready to Learn?</h3>
            <p className="text-muted-foreground mb-4">Choose a learning mode above to get started!</p>
            <Link to="/learn">
              <Button className="gradient-primary text-primary-foreground">
                Start Learning <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
