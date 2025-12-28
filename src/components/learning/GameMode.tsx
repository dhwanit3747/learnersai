import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Trophy, Gamepad2, Timer, CheckCircle2, XCircle, Zap, Star, Target } from 'lucide-react';

interface GameQuestion {
  type: 'fill_blank' | 'true_false' | 'word_scramble' | 'speed_match';
  question: string;
  answer: string;
  options?: string[];
  hint?: string;
}

interface GameModeProps {
  topic: string;
  games: GameQuestion[];
  onReset: () => void;
  onComplete?: (score: number, total: number) => void;
}

export function GameMode({ topic, games, onReset, onComplete }: GameModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(true);

  const currentGame = games[currentIndex];
  const progress = ((currentIndex + 1) / games.length) * 100;

  // Timer countdown
  useEffect(() => {
    if (!timerActive || showResult || completed) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, showResult, completed, currentIndex]);

  const handleTimeUp = () => {
    setShowResult(true);
    setIsCorrect(false);
    setStreak(0);
  };

  const checkAnswer = useCallback((answer: string) => {
    const correct = answer.toLowerCase().trim() === currentGame.answer.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);
    setTimerActive(false);
    
    if (correct) {
      const timeBonus = Math.floor(timeLeft / 3);
      const streakBonus = Math.min(streak, 5);
      const points = 10 + timeBonus + streakBonus;
      setScore(prev => prev + points);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }
  }, [currentGame, timeLeft, streak]);

  const handleNext = () => {
    if (currentIndex < games.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setShowResult(false);
      setTimeLeft(15);
      setTimerActive(true);
    } else {
      setCompleted(true);
      onComplete?.(score, games.length * 10);
    }
  };

  const getScrambledWord = (word: string) => {
    return word.split('').sort(() => Math.random() - 0.5).join('');
  };

  if (completed) {
    const percentage = Math.round((score / (games.length * 15)) * 100);
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-border bg-card shadow-card overflow-hidden">
          <div className="gradient-primary p-8 text-center">
            <Trophy className="h-16 w-16 text-primary-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-primary-foreground mb-2">Game Complete!</h2>
            <p className="text-primary-foreground/80">Topic: {topic}</p>
          </div>
          <CardContent className="p-8">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-xl bg-secondary">
                <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">{score}</p>
                <p className="text-sm text-muted-foreground">Points</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-secondary">
                <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{percentage}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-secondary">
                <Zap className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{maxStreak}</p>
                <p className="text-sm text-muted-foreground">Best Streak</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button variant="outline" onClick={onReset} className="flex-1">
                Play Again
              </Button>
              <Button onClick={onReset} className="flex-1 gradient-primary text-primary-foreground">
                New Topic
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" className="mb-6" onClick={onReset}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Exit Game
      </Button>

      {/* Header Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold">{score}</span>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-500">
              <Zap className="h-4 w-4" />
              <span className="font-semibold">{streak}x</span>
            </div>
          )}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${timeLeft <= 5 ? 'bg-destructive/20 text-destructive animate-pulse' : 'bg-secondary'}`}>
          <Timer className="h-4 w-4" />
          <span className="font-semibold">{timeLeft}s</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentIndex + 1} of {games.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-border bg-card shadow-card">
        <CardContent className="p-8">
          {/* Game Type Badge */}
          <div className="flex justify-center mb-6">
            <span className={`px-4 py-1 rounded-full text-sm font-medium ${
              currentGame.type === 'fill_blank' ? 'bg-blue-500/20 text-blue-500' :
              currentGame.type === 'true_false' ? 'bg-green-500/20 text-green-500' :
              currentGame.type === 'word_scramble' ? 'bg-purple-500/20 text-purple-500' :
              'bg-orange-500/20 text-orange-500'
            }`}>
              {currentGame.type === 'fill_blank' && '📝 Fill in the Blank'}
              {currentGame.type === 'true_false' && '✓✗ True or False'}
              {currentGame.type === 'word_scramble' && '🔀 Word Scramble'}
              {currentGame.type === 'speed_match' && '⚡ Speed Match'}
            </span>
          </div>

          {/* Question */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold mb-4">{currentGame.question}</h3>
            
            {currentGame.type === 'word_scramble' && !showResult && (
              <p className="text-2xl font-mono tracking-widest text-primary">
                {getScrambledWord(currentGame.answer)}
              </p>
            )}
            
            {currentGame.hint && !showResult && (
              <p className="text-sm text-muted-foreground mt-2">💡 Hint: {currentGame.hint}</p>
            )}
          </div>

          {/* Answer Area */}
          {!showResult ? (
            <div className="space-y-4">
              {(currentGame.type === 'true_false') ? (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-16 text-lg hover:bg-green-500/20 hover:border-green-500"
                    onClick={() => checkAnswer('true')}
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    True
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-16 text-lg hover:bg-destructive/20 hover:border-destructive"
                    onClick={() => checkAnswer('false')}
                  >
                    <XCircle className="mr-2 h-5 w-5" />
                    False
                  </Button>
                </div>
              ) : currentGame.options ? (
                <div className="grid grid-cols-2 gap-3">
                  {currentGame.options.map((option, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="h-14 text-left justify-start px-4 hover:bg-primary/10 hover:border-primary"
                      onClick={() => checkAnswer(option)}
                    >
                      <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3 text-sm font-semibold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {option}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && userAnswer && checkAnswer(userAnswer)}
                    placeholder="Type your answer..."
                    className="flex-1 h-14 px-4 rounded-lg border border-border bg-background text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  <Button
                    onClick={() => checkAnswer(userAnswer)}
                    disabled={!userAnswer}
                    className="h-14 px-6 gradient-primary text-primary-foreground"
                  >
                    Submit
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl text-center ${isCorrect ? 'bg-green-500/20' : 'bg-destructive/20'}`}>
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p className="text-xl font-bold text-green-500">Correct! 🎉</p>
                    {streak > 1 && <p className="text-sm text-green-500/80 mt-1">{streak}x Streak Bonus!</p>}
                  </>
                ) : (
                  <>
                    <XCircle className="h-12 w-12 mx-auto mb-3 text-destructive" />
                    <p className="text-xl font-bold text-destructive">Not quite!</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      The answer was: <span className="font-semibold text-foreground">{currentGame.answer}</span>
                    </p>
                  </>
                )}
              </div>
              
              <Button onClick={handleNext} className="w-full h-12 gradient-primary text-primary-foreground">
                {currentIndex < games.length - 1 ? 'Next Challenge' : 'See Results'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
