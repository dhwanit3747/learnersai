import { Link } from 'react-router-dom';
import { Brain, Zap, BookOpen, Gamepad2, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Quizzes',
    description: 'Generate personalized quizzes on any topic with adaptive difficulty that grows with you.',
  },
  {
    icon: BookOpen,
    title: 'Smart Flashcards',
    description: 'AI creates perfect flashcards that help you memorize and retain information effectively.',
  },
  {
    icon: Sparkles,
    title: 'Comic Story Mode',
    description: 'Learn complex topics through fun, illustrated comic-style narratives.',
  },
  {
    icon: Gamepad2,
    title: 'Gamified Learning',
    description: 'Earn points, maintain streaks, and track your progress to stay motivated.',
  },
];

const benefits = [
  'Learn any topic you can imagine',
  'AI adapts to your learning style',
  'Track your progress with streaks',
  'Beautiful, distraction-free interface',
];

export default function Landing() {
  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary mb-8 animate-fade-in">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Powered by AI</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
            Learn Anything with
            <span className="block text-gradient mt-2">Learner's AI</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Transform the way you learn. Our AI generates personalized quizzes, flashcards, and comic stories to make any topic fun and memorable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow px-8 h-14 text-lg">
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="px-8 h-14 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to <span className="text-gradient">Master Any Topic</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform adapts to your learning style and helps you achieve your goals.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="group border-border bg-card shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="border-border bg-card shadow-card overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">
                    Why Choose <span className="text-gradient">Learner's AI</span>?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Join thousands of learners who are mastering new topics every day with our AI-powered platform.
                  </p>
                  <ul className="space-y-3">
                    {benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <div className="aspect-square rounded-2xl gradient-primary opacity-20 absolute inset-0" />
                  <div className="relative p-8 flex items-center justify-center">
                    <Brain className="h-32 w-32 text-primary animate-float" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-muted-foreground mb-8">
            Start your learning journey today. It's completely free to get started.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow px-10 h-14 text-lg">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-bold text-gradient">Learner's AI</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/auth" className="hover:text-foreground transition-colors">Sign In</Link>
              <Link to="/auth?mode=signup" className="hover:text-foreground transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
