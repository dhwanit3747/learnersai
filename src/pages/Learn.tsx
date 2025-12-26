import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Brain, BookOpen, Sparkles, Search, Loader2, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { QuizMode } from '@/components/learning/QuizMode';
import { FlashcardMode } from '@/components/learning/FlashcardMode';
import { ComicMode } from '@/components/learning/ComicMode';
import { BriefMode } from '@/components/learning/BriefMode';

type LearningMode = 'select' | 'quiz' | 'flashcards' | 'comic' | 'brief';

export default function Learn() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<LearningMode>('select');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<any>(null);
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam && ['quiz', 'flashcards', 'comic', 'brief'].includes(modeParam)) {
      setMode(modeParam as LearningMode);
    }
  }, [searchParams]);

  const awardPoints = async (points: number, activityType: string) => {
    if (!user) return;
    
    try {
      // Log the learning activity
      await supabase.from('learning_activities').insert({
        user_id: user.id,
        activity_type: activityType,
        points_earned: points,
        metadata: { topic },
      });

      // Update profile points and streak
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points, current_streak, longest_streak, last_activity_date')
        .eq('id', user.id)
        .single();

      if (profile) {
        const today = new Date().toISOString().split('T')[0];
        const lastActivity = profile.last_activity_date;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        let newStreak = profile.current_streak || 0;
        if (lastActivity === yesterday) {
          newStreak += 1;
        } else if (lastActivity !== today) {
          newStreak = 1;
        }

        const longestStreak = Math.max(newStreak, profile.longest_streak || 0);

        await supabase
          .from('profiles')
          .update({
            total_points: (profile.total_points || 0) + points,
            current_streak: newStreak,
            longest_streak: longestStreak,
            last_activity_date: today,
          })
          .eq('id', user.id);

        toast({
          title: `+${points} Points!`,
          description: newStreak > 1 ? `🔥 ${newStreak} day streak!` : 'Keep learning to build your streak!',
        });
      }
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

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
      const { data, error } = await supabase.functions.invoke('generate-learning-content', {
        body: { topic, mode },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast({
            title: 'Rate limit reached',
            description: 'Please wait a moment before trying again.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }

      setContent(data);
      
      // Save to database
      if (mode === 'quiz' && data.questions) {
        await supabase.from('quizzes').insert({
          user_id: user?.id,
          topic_name: topic,
          questions: data.questions,
          total_questions: data.questions.length,
        });
      } else if (mode === 'flashcards' && data.cards) {
        await supabase.from('flashcard_decks').insert({
          user_id: user?.id,
          topic_name: topic,
          cards: data.cards,
        });
      } else if (mode === 'comic' && data.panels) {
        await supabase.from('comic_stories').insert({
          user_id: user?.id,
          topic_name: topic,
          panels: data.panels,
        });
      }
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
    const basePoints = 10;
    const bonusPoints = score === total ? 5 : 0;
    awardPoints(basePoints + bonusPoints, 'quiz_completed');
  };

  const handleFlashcardsComplete = () => {
    awardPoints(5, 'flashcards_reviewed');
  };

  const handleComicComplete = () => {
    awardPoints(15, 'comic_read');
  };

  const handleBriefComplete = () => {
    awardPoints(8, 'brief_completed');
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
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Brain className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

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
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
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
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    {mode === 'quiz' && 'Quiz Mode'}
                    {mode === 'flashcards' && 'Flashcard Mode'}
                    {mode === 'comic' && 'Comic Story Mode'}
                    {mode === 'brief' && 'Quick Learn Mode'}
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
          </>
        )}
      </main>
    </div>
  );
}
