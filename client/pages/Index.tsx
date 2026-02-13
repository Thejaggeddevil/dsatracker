import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Flame, Zap, Target, TrendingUp } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home if already authenticated
    const token = localStorage.getItem('auth_token');
    if (token) {
      navigate('/home');
    }
  }, [navigate]);

  return (
    <Layout>
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="min-h-[calc(100vh-64px-100px)] flex items-center justify-center py-12">
          <div className="max-w-3xl text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-success/20 to-success-light/20">
                <Flame className="w-12 h-12 text-success" />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              DSA Streak
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A production-grade accountability system to track your consistent Data Structures & Algorithms practice. Stay motivated, build streaks, and master DSA through disciplined daily practice.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" onClick={() => navigate('/signup')} className="text-base">
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="text-base">
                Sign In
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <div className="rounded-lg border border-border bg-card p-6 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Daily Streak Tracking</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Earn streaks based on actual proof of solving, not just app opens. One submission per day, locked to the calendar.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Smart Revision System</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically schedule revisions at optimal intervals (1, 3, 7, 21 days) to reinforce learning.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Honest Progress Tracking</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Track solutions with self-evaluation (self-solved, hints, saw solution) for accurate accountability.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <Flame className="w-5 h-5 text-success" />
                  <h3 className="font-semibold">Secure & Professional</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Production-grade security with hashed passwords, JWT authentication, and secure session management.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 border-t border-border">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Submit Daily</h3>
                  <p className="text-muted-foreground">
                    Solve one DSA problem daily on your platform of choice (LeetCode, GFG, etc.). Submit with your honest self-evaluation.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Build Your Streak</h3>
                  <p className="text-muted-foreground">
                    One valid submission per day increases your streak. Miss a day and it resets. Stay consistent!
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Revise & Reinforce</h3>
                  <p className="text-muted-foreground">
                    Questions automatically schedule for revision at 1, 3, 7, and 21 days. Mark them as done to earn bonus points.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground font-bold">
                    4
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Track Progress</h3>
                  <p className="text-muted-foreground">
                    View your complete history with GitHub-style streak visualization, earned points, and mastery levels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Build Your Streak?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join hundreds of engineers mastering DSA through consistent, honest practice.
            </p>
            <Button size="lg" onClick={() => navigate('/signup')} className="text-base">
              Start Your Streak Now
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
}
