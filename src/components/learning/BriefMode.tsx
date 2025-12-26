import { useState } from 'react';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, Lightbulb, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface BriefContent {
  title: string;
  summary: string;
  keyPoints: string[];
  funFact: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface BriefModeProps {
  topic: string;
  content: BriefContent;
  onReset: () => void;
  onComplete: () => void;
}

export function BriefMode({ topic, content, onReset, onComplete }: BriefModeProps) {
  const [expandedPoints, setExpandedPoints] = useState<number[]>([]);
  const [readPoints, setReadPoints] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);

  const progress = (readPoints.length / content.keyPoints.length) * 100;

  const togglePoint = (index: number) => {
    if (expandedPoints.includes(index)) {
      setExpandedPoints(expandedPoints.filter(i => i !== index));
    } else {
      setExpandedPoints([...expandedPoints, index]);
      if (!readPoints.includes(index)) {
        setReadPoints([...readPoints, index]);
      }
    }
  };

  const handleComplete = () => {
    setCompleted(true);
    onComplete();
  };

  const difficultyColors = {
    beginner: 'from-green-500 to-emerald-600',
    intermediate: 'from-yellow-500 to-orange-500',
    advanced: 'from-red-500 to-rose-600',
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="ghost" className="mb-6" onClick={onReset}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to modes
      </Button>

      <Card className="border-border bg-card shadow-card mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${difficultyColors[content.difficulty]}`}>
              {content.difficulty.charAt(0).toUpperCase() + content.difficulty.slice(1)}
            </span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              {content.keyPoints.length} key points
            </div>
          </div>
          <CardTitle className="text-2xl text-gradient">{content.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed mb-6">{content.summary}</p>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Reading Progress</span>
              <span className="text-sm text-muted-foreground">{readPoints.length}/{content.keyPoints.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Key Points
        </h3>
        {content.keyPoints.map((point, index) => (
          <Card
            key={index}
            className={`border-border bg-card shadow-card cursor-pointer transition-all hover:shadow-glow ${
              readPoints.includes(index) ? 'border-primary/50' : ''
            }`}
            onClick={() => togglePoint(index)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      readPoints.includes(index) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <p className={`font-medium ${expandedPoints.includes(index) ? 'text-primary' : ''}`}>
                      {point.split('.')[0]}
                    </p>
                  </div>
                  {expandedPoints.includes(index) && (
                    <p className="mt-3 pl-8 text-muted-foreground animate-in fade-in slide-in-from-top-2">
                      {point}
                    </p>
                  )}
                </div>
                {expandedPoints.includes(index) ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-card mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Fun Fact!</h4>
              <p className="text-muted-foreground">{content.funFact}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!completed ? (
        <Button
          onClick={handleComplete}
          className="w-full h-14 text-lg gradient-primary text-primary-foreground shadow-glow"
          disabled={readPoints.length < content.keyPoints.length}
        >
          <Zap className="mr-2 h-5 w-5" />
          {readPoints.length < content.keyPoints.length 
            ? `Read all ${content.keyPoints.length} points to complete` 
            : 'Complete & Earn Points!'}
        </Button>
      ) : (
        <Card className="border-primary bg-primary/5 text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Great job!</h3>
            <p className="text-muted-foreground mb-4">You've learned the basics of {topic}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={onReset}>
                Learn Another Topic
              </Button>
              <Button className="gradient-primary text-primary-foreground" onClick={() => window.location.href = '/learn?mode=quiz'}>
                Test Your Knowledge
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}