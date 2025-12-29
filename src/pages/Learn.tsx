import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Brain, BookOpen, Sparkles, Search, Loader2, ArrowLeft, ArrowRight, Zap, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { QuizMode } from '@/components/learning/QuizMode';
import { FlashcardMode } from '@/components/learning/FlashcardMode';
import { ComicMode } from '@/components/learning/ComicMode';
import { BriefMode } from '@/components/learning/BriefMode';
import { GameMode } from '@/components/learning/GameMode';

type LearningMode = 'select' | 'quiz' | 'flashcards' | 'comic' | 'brief' | 'games';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function Learn() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<LearningMode>('select');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<any>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam && ['quiz', 'flashcards', 'comic', 'brief', 'games'].includes(modeParam)) {
      setMode(modeParam as LearningMode);
    }
  }, [searchParams]);

  const generateContent = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Enter a topic',
        description: 'Please enter a topic you want to learn about.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/generate-content/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, mode }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setContent(data);
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetContent = () => {
    setContent(null);
    setTopic('');
  };

  const handleQuizComplete = (score: number, total: number) => {
    toast({
      title: `Quiz Complete!`,
      description: `You scored ${score}/${total}. Great job!`,
    });
  };

  const handleFlashcardsComplete = () => {
    toast({
      title: 'Flashcards Complete!',
      description: 'You reviewed all the cards. Keep learning!',
    });
  };

  const handleComicComplete = () => {
    toast({
      title: 'Story Complete!',
      description: 'You finished reading the comic story!',
    });
  };

  const handleBriefComplete = () => {
    toast({
      title: 'Brief Complete!',
      description: 'You learned the key points about this topic!',
    });
  };

  const handleGamesComplete = (score: number, total: number) => {
    toast({
      title: 'Game Complete!',
      description: `You scored ${score}/${total}. Well done!`,
    });
  };

  const modes = [
    {
      id: 'brief' as const,
      icon: Zap,
      title: 'Quick Learn',
      description: 'Get a brief overview of any topic in minutes',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'quiz' as const,
      icon: Brain,
      title: 'Quiz Mode',
      description: 'Test your knowledge with AI-generated multiple-choice questions',
      color: 'from-violet-500 to-purple-600',
    },
    {
      id: 'flashcards' as const,
      icon: BookOpen,
      title: 'Flashcards',
      description: 'Review key concepts with interactive flip cards',
      color: 'from-purple-500 to-pink-600',
    },
    {
      id: 'comic' as const,
      icon: Sparkles,
      title: 'Comic Story',
      description: 'Learn through fun, illustrated comic-style narratives',
      color: 'from-pink-500 to-rose-600',
    },
    {
      id: 'games' as const,
      icon: Gamepad2,
      title: 'AI Games',
      description: 'Learn through fun timed challenges, word scrambles & more',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {mode === 'select' ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Choose Your <span className="text-gradient">Learning Mode</span></h1>
              <p className="text-muted-foreground">Select how you want to learn your topic</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
              {modes.map((m) => (
                <Card
                  key={m.id}
                  className="border-border bg-card shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
                  onClick={() => setMode(m.id)}
                >
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <m.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{m.title}</h3>
                    <p className="text-sm text-muted-foreground">{m.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : !content ? (
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => setMode('select')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to modes
            </Button>
            
            <Card className="border-border bg-card shadow-card">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${modes.find(m => m.id === mode)?.color} flex items-center justify-center mx-auto mb-4`}>
                    {mode === 'quiz' && <Brain className="h-8 w-8 text-white" />}
                    {mode === 'flashcards' && <BookOpen className="h-8 w-8 text-white" />}
                    {mode === 'comic' && <Sparkles className="h-8 w-8 text-white" />}
                    {mode === 'brief' && <Zap className="h-8 w-8 text-white" />}
                    {mode === 'games' && <Gamepad2 className="h-8 w-8 text-white" />}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    {mode === 'quiz' && 'Quiz Mode'}
                    {mode === 'flashcards' && 'Flashcard Mode'}
                    {mode === 'comic' && 'Comic Story Mode'}
                    {mode === 'brief' && 'Quick Learn Mode'}
                    {mode === 'games' && 'AI Games Mode'}
                  </h2>
                  <p className="text-muted-foreground">Enter any topic and our AI will create personalized content for you</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Enter a topic (e.g., Photosynthesis, World War II, Machine Learning)"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="pl-12 h-14 text-lg"
                      onKeyDown={(e) => e.key === 'Enter' && generateContent()}
                    />
                  </div>
                  
                  <Button
                    onClick={generateContent}
                    className="w-full h-14 text-lg gradient-primary text-primary-foreground shadow-glow"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Content
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center mb-3">Popular topics:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Photosynthesis', 'Solar System', 'World War II', 'Machine Learning', 'Climate Change'].map((t) => (
                      <Button
                        key={t}
                        variant="secondary"
                        size="sm"
                        onClick={() => setTopic(t)}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {mode === 'quiz' && <QuizMode topic={topic} questions={content.questions} onReset={resetContent} onComplete={handleQuizComplete} />}
            {mode === 'flashcards' && <FlashcardMode topic={topic} cards={content.cards} onReset={resetContent} onComplete={handleFlashcardsComplete} />}
            {mode === 'comic' && <ComicMode topic={topic} panels={content.panels} onReset={resetContent} onComplete={handleComicComplete} />}
            {mode === 'brief' && <BriefMode topic={topic} content={content} onReset={resetContent} onComplete={handleBriefComplete} />}
            {mode === 'games' && <GameMode topic={topic} games={content.games} onReset={resetContent} onComplete={handleGamesComplete} />}
          </>
        )}
      </main>
    </div>
  );
}
