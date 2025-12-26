import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Flame, Trophy, BookOpen, Sparkles, FileText, ArrowRight, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  display_name: string;
  total_points: number;
  current_streak: number;
  longest_streak: number;
}

interface RecentActivity {
  id: string;
  type: string;
  topic: string;
  date: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchRecentActivities();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('display_name, total_points, current_streak, longest_streak')
      .eq('id', user?.id)
      .single();
    
    if (data) setProfile(data);
  };

  const fetchRecentActivities = async () => {
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('id, topic_name, created_at')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(3);

    const { data: flashcards } = await supabase
      .from('flashcard_decks')
      .select('id, topic_name, created_at')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(3);

    const activities: RecentActivity[] = [
      ...(quizzes || []).map(q => ({
        id: q.id,
        type: 'quiz',
        topic: q.topic_name,
        date: q.created_at,
      })),
      ...(flashcards || []).map(f => ({
        id: f.id,
        type: 'flashcards',
        topic: f.topic_name,
        date: f.created_at,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    setRecentActivities(activities);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Brain className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

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
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{profile?.display_name || 'Learner'}</span>!
          </h1>
          <p className="text-muted-foreground">Ready to continue your learning journey?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-border bg-card shadow-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profile?.current_streak || 0}</p>
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
                <p className="text-2xl font-bold">{profile?.total_points || 0}</p>
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
                <p className="text-2xl font-bold">{profile?.longest_streak || 0}</p>
                <p className="text-sm text-muted-foreground">Best Streak</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Start Learning</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Link to="/learn">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <Card key={activity.id} className="border-border bg-card shadow-card">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      {activity.type === 'quiz' ? (
                        <Brain className="h-5 w-5 text-primary" />
                      ) : (
                        <FileText className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.topic}</p>
                      <p className="text-sm text-muted-foreground capitalize">{activity.type}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {new Date(activity.date).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border bg-card shadow-card">
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No activity yet</h3>
                <p className="text-muted-foreground mb-4">Start learning to see your progress here!</p>
                <Link to="/learn">
                  <Button className="gradient-primary text-primary-foreground">
                    Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
