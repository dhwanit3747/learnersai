import { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Check, X, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardModeProps {
  topic: string;
  cards: Flashcard[];
  onReset: () => void;
}

export const FlashcardMode = ({ topic, cards, onReset }: FlashcardModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<number[]>([]);
  const [learningCards, setLearningCards] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  
  const { user } = useAuth();
  const currentCard = cards[currentIndex];
  const progress = ((knownCards.length + learningCards.length) / cards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnow = async () => {
    setKnownCards([...knownCards, currentIndex]);
    moveToNext();
  };

  const handleLearning = () => {
    setLearningCards([...learningCards, currentIndex]);
    moveToNext();
  };

  const moveToNext = async () => {
    setIsFlipped(false);
    
    if (currentIndex < cards.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 200);
    } else {
      setCompleted(true);
      
      // Award points
      const pointsEarned = 5;
      
      await supabase.from('learning_activities').insert({
        user_id: user?.id,
        activity_type: 'flashcards_reviewed',
        points_earned: pointsEarned,
        metadata: { topic, known: knownCards.length + 1, learning: learningCards.length },
      });

      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', user?.id)
        .single();
      
      if (profile) {
        await supabase
          .from('profiles')
          .update({ total_points: profile.total_points + pointsEarned })
          .eq('id', user?.id);
      }
    }
  };

  if (completed) {
    const totalKnown = knownCards.length;
    
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card className="border-border bg-card shadow-card overflow-hidden">
          <div className="gradient-primary p-8 text-center text-white">
            <Trophy className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Deck Complete!</h2>
            <p className="opacity-90">{topic}</p>
          </div>
          
          <div className="p-8 text-center">
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-success">{totalKnown}</div>
                <div className="text-sm text-muted-foreground">Know it</div>
              </div>
              <div className="w-px h-16 bg-border" />
              <div className="text-center">
                <div className="text-4xl font-bold text-warning">{learningCards.length}</div>
                <div className="text-sm text-muted-foreground">Still learning</div>
              </div>
              <div className="w-px h-16 bg-border" />
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">+5</div>
                <div className="text-sm text-muted-foreground">Points</div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={onReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Another Topic
              </Button>
              <Button className="gradient-primary text-primary-foreground" onClick={onReset}>
                Continue Learning
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={onReset}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Exit Flashcards
      </Button>
      
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{topic}</span>
          <span className="text-sm font-medium">{currentIndex + 1} / {cards.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <div
        className="relative h-80 cursor-pointer perspective-1000 mb-6"
        onClick={handleFlip}
      >
        <div
          className={`absolute inset-0 transition-all duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <Card
            className={`absolute inset-0 border-border bg-card shadow-card backface-hidden flex items-center justify-center p-8 ${
              isFlipped ? 'invisible' : ''
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Question</p>
              <h2 className="text-2xl font-semibold">{currentCard.front}</h2>
              <p className="text-sm text-muted-foreground mt-6">Tap to flip</p>
            </div>
          </Card>

          {/* Back */}
          <Card
            className={`absolute inset-0 border-border bg-secondary shadow-card flex items-center justify-center p-8 ${
              isFlipped ? '' : 'invisible'
            }`}
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Answer</p>
              <h2 className="text-2xl font-semibold">{currentCard.back}</h2>
              <p className="text-sm text-muted-foreground mt-6">Tap to flip back</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 border-warning text-warning hover:bg-warning/10"
          onClick={handleLearning}
        >
          <X className="mr-2 h-5 w-5" />
          Still Learning
        </Button>
        <Button
          size="lg"
          className="flex-1 bg-success hover:bg-success/90 text-white"
          onClick={handleKnow}
        >
          <Check className="mr-2 h-5 w-5" />
          Know It
        </Button>
      </div>
    </div>
  );
};
