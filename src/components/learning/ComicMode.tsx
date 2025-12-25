import { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Panel {
  title: string;
  content: string;
  character: string;
  emotion: string;
}

interface ComicModeProps {
  topic: string;
  panels: Panel[];
  onReset: () => void;
}

const characterEmojis: Record<string, Record<string, string>> = {
  professor: {
    happy: '🧑‍🏫',
    thinking: '🤔',
    excited: '🤩',
    explaining: '👨‍🔬',
  },
  student: {
    confused: '😕',
    curious: '🧐',
    understanding: '😊',
    amazed: '😮',
  },
  narrator: {
    default: '📖',
    important: '⚡',
    conclusion: '🎯',
  },
};

export const ComicMode = ({ topic, panels, onReset }: ComicModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  const { user } = useAuth();
  const currentPanel = panels[currentIndex];
  const progress = ((currentIndex + 1) / panels.length) * 100;

  const getEmoji = (character: string, emotion: string) => {
    const charEmojis = characterEmojis[character.toLowerCase()] || characterEmojis.narrator;
    return charEmojis[emotion.toLowerCase()] || charEmojis.default || '🎭';
  };

  const handleNext = async () => {
    if (currentIndex < panels.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(true);
      
      // Award points
      const pointsEarned = 15;
      
      await supabase.from('learning_activities').insert({
        user_id: user?.id,
        activity_type: 'comic_read',
        points_earned: pointsEarned,
        metadata: { topic, panels: panels.length },
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

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card className="border-border bg-card shadow-card overflow-hidden">
          <div className="gradient-primary p-8 text-center text-white">
            <Trophy className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Story Complete!</h2>
            <p className="opacity-90">{topic}</p>
          </div>
          
          <CardContent className="p-8 text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-xl text-muted-foreground">
                You've completed all {panels.length} panels!
              </p>
              <div className="mt-4 text-2xl font-bold text-primary">+15 Points</div>
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={onReset}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Exit Story
      </Button>
      
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{topic}</span>
          <span className="text-sm font-medium">Panel {currentIndex + 1} / {panels.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Comic Panel */}
      <Card className="border-border bg-card shadow-card overflow-hidden mb-6 animate-fade-in">
        <div className="gradient-secondary p-4 border-b border-border">
          <h3 className="font-semibold text-center">{currentPanel.title}</h3>
        </div>
        
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            {/* Character */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-4xl">
                {getEmoji(currentPanel.character, currentPanel.emotion)}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2 capitalize">
                {currentPanel.character}
              </p>
            </div>
            
            {/* Speech Bubble */}
            <div className="flex-1 relative">
              <div className="absolute left-0 top-6 w-0 h-0 border-t-8 border-t-transparent border-r-12 border-r-secondary border-b-8 border-b-transparent -translate-x-3" />
              <div className="bg-secondary rounded-2xl p-6">
                <p className="text-lg leading-relaxed">{currentPanel.content}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex gap-1">
          {panels.map((_, idx) => (
            <button
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? 'bg-primary w-4' : 'bg-muted'
              }`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
        
        <Button onClick={handleNext} className="gradient-primary text-primary-foreground">
          {currentIndex < panels.length - 1 ? (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            'Finish Story'
          )}
        </Button>
      </div>
    </div>
  );
};
