import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Trophy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizModeProps {
  topic: string;
  questions: Question[];
  onReset: () => void;
  onComplete?: (score: number, total: number) => void;
}

export const QuizMode = ({ topic, questions, onReset, onComplete }: QuizModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [completed, setCompleted] = useState(false);
  
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;
    
    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedAnswer;
    setAnswers(newAnswers);
    
    if (selectedAnswer === currentQuestion.correctIndex) {
      setScore(score + 1);
    }
    
    setShowResult(true);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setCompleted(true);
      
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete(score + (selectedAnswer === currentQuestion.correctIndex ? 1 : 0), questions.length);
      }
    }
  };

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card className="border-border bg-card shadow-card overflow-hidden">
          <div className="gradient-primary p-8 text-center text-white">
            <Trophy className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
            <p className="opacity-90">{topic}</p>
          </div>
          
          <CardContent className="p-8 text-center">
            <div className="mb-8">
              <div className="text-6xl font-bold text-gradient mb-2">{percentage}%</div>
              <p className="text-xl text-muted-foreground">
                You got {score} out of {questions.length} correct
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{score}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{questions.length - score}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">+{10 + (score === questions.length ? 5 : 0)}</div>
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={onReset}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Exit Quiz
      </Button>
      
      <Card className="border-border bg-card shadow-card">
        <CardContent className="p-6">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{topic}</span>
              <span className="text-sm font-medium">{currentIndex + 1} / {questions.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => {
              let className = 'w-full p-4 text-left border rounded-lg transition-all ';
              
              if (showResult) {
                if (index === currentQuestion.correctIndex) {
                  className += 'border-success bg-success/10 text-success';
                } else if (index === selectedAnswer && index !== currentQuestion.correctIndex) {
                  className += 'border-destructive bg-destructive/10 text-destructive';
                } else {
                  className += 'border-border bg-muted/50 opacity-50';
                }
              } else if (selectedAnswer === index) {
                className += 'border-primary bg-primary/10';
              } else {
                className += 'border-border hover:border-primary/50 hover:bg-secondary cursor-pointer';
              }

              return (
                <button
                  key={index}
                  className={className}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={showResult}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {showResult && index === currentQuestion.correctIndex && (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    )}
                    {showResult && index === selectedAnswer && index !== currentQuestion.correctIndex && (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showResult && (
            <div className="p-4 rounded-lg bg-secondary mb-6 animate-fade-in">
              <p className="text-sm font-medium mb-1">Explanation:</p>
              <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end">
            {!showResult ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="gradient-primary text-primary-foreground"
              >
                Check Answer
              </Button>
            ) : (
              <Button onClick={handleNext} className="gradient-primary text-primary-foreground">
                {currentIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  'See Results'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
