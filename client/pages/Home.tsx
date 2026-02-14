import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Flame, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import ClickSpark from '@/components/ClickSpark';
import { auth } from "@/lib/firebase";


interface Streak {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  lastSubmissionDate?: string;
}


const Home = () => {
  const navigate = useNavigate();
  
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
 const [questionName, setQuestionName] = useState('');
const [questionLink, setQuestionLink] = useState('');
const [platform, setPlatform] = useState('');

  const [difficulty, setDifficulty] = useState('');
  const [topic, setTopic] = useState('');
  const [solveType, setSolveType] = useState('');
  const [submittedToday, setSubmittedToday] = useState(false);

  // Check authentication and load streak
useEffect(() => {
  loadStreak();
}, []);



  const loadStreak = async () => {
  try {
    const token = await auth.currentUser?.getIdToken();

    if (!token) {
      navigate('/login');
      return;
    }

    const response = await fetch('/api/streak', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Failed to load streak');
    }

    const data = await response.json();

    if (data.success) {
      setStreak(data.streak);

      const today = new Date().toISOString().split('T')[0];
      if (data.streak.lastSubmissionDate === today) {
        setSubmittedToday(true);
      }
    }

  } catch (error) {
    console.error('Error loading streak:', error);
    toast.error('Failed to load your streak');
  } finally {
    setLoading(false);
  }
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Validation
    if (!questionName || !questionLink || !platform || !difficulty || !topic || !solveType){

      toast.error('All fields are required');
      setSubmitting(false);
      return;
    }
 

if (!questionLink.startsWith("http")) {
  toast.error("Please enter a valid link");
  setSubmitting(false);
  return;
}


    const token = await auth.currentUser?.getIdToken();



    try {
      const response = await fetch('/api/submissions/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          questionName,
          questionLink,
          platform,
          difficulty,
          topic,
          solveType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Submission failed');
        setSubmitting(false);
        return;
      }

      toast.success('🎉 Question submitted! Keep up the streak!');
      
      // Update streak
      setStreak(data.streak);
      setSubmittedToday(true);

      // Reset form
      setQuestionName('');
      setQuestionLink('');
      setPlatform('');
      setDifficulty('');
      setTopic('');
      setSolveType('');
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
     <Layout>

        <div className="flex items-center justify-center min-h-[calc(100vh-64px-100px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <ClickSpark sparkColor="rgba(10, 108, 199, 0.8)" sparkCount={10} sparkRadius={20} duration={500}>
  <Layout>

      
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Streak Card */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Streak */}
            <div className="rounded-xl border border-border bg-gradient-to-br from-success/10 to-success-light/10 p-6">
              <div className="flex items-center gap-3 mb-3">
                <Flame className="w-6 h-6 text-success animate-pulse" />
                <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
              </div>
              <p className="text-4xl font-bold text-success">
                {streak?.currentStreak ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-2">days in a row</p>
            </div>

            {/* Longest Streak */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Longest Streak</h3>
              <p className="text-4xl font-bold text-primary">
                {streak?.longestStreak ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-2">days</p>
            </div>

           
          </div>

          {/* Alert if already submitted */}
          {submittedToday && (
            <div className="mb-6 p-4 rounded-lg bg-secondary/50 border border-border flex gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Great job today!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You've already submitted a question today. Come back tomorrow to continue your streak!
                </p>
              </div>
            </div>
          )}

          {/* Submission Form */}
          <div className="rounded-xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6">Daily Question Submission</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Submit one DSA problem per day to maintain your streak. Only one submission counts per calendar day.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="questionName">Question Name</Label>
                <Input
                  id="questionName"
                  placeholder="e.g., Two Sum, Longest Substring Without Repeating"
                  value={questionName}
                  onChange={(e) => setQuestionName(e.target.value)}
                  disabled={submitting}
                  className="mt-2"
                />
              </div>
              <div>
  <Label htmlFor="questionLink">Question Link</Label>
  <Input
    id="questionLink"
    placeholder="Paste problem link (e.g., https://leetcode.com/...)"
    value={questionLink}
    onChange={(e) => setQuestionLink(e.target.value)}
    disabled={submitting}
    className="mt-2"
  />
</div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}disabled={submitting}>
                    <SelectTrigger id="platform" className="mt-2">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leetcode">LeetCode</SelectItem>
                      <SelectItem value="gfg">GeeksforGeeks</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty} disabled={submitting}>
                    <SelectTrigger id="difficulty" className="mt-2">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="topic">Topic</Label>
                <Select value={topic} onValueChange={setTopic} disabled={submitting}>
                  <SelectTrigger id="topic" className="mt-2">
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Array">Array</SelectItem>
                    <SelectItem value="String">String</SelectItem>
                    <SelectItem value="Tree">Tree</SelectItem>
                    <SelectItem value="Graph">Graph</SelectItem>
                    <SelectItem value="DP">Dynamic Programming</SelectItem>
                    <SelectItem value="Linked List">Linked List</SelectItem>
                    <SelectItem value="Stack">Stack</SelectItem>
                    <SelectItem value="Queue">Queue</SelectItem>
                    <SelectItem value="Hash Map">Hash Map</SelectItem>
                    <SelectItem value="Heap">Heap</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="solveType">How did you solve it?</Label>
                <Select value={solveType} onValueChange={setSolveType} disabled={submitting}>
                  <SelectTrigger id="solveType" className="mt-2">
                    <SelectValue placeholder="Select solve type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Fully self-solved</SelectItem>
                    <SelectItem value="hint">Needed hints</SelectItem>
                    <SelectItem value="solution">Saw solution</SelectItem>
                  </SelectContent>
                </Select>
                
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={submitting}
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : submittedToday ? (
                  'Already submitted today'
                ) : (
                  'Submit Question'
                )}
              </Button>
            </form>
          </div>

          {/* Info Box */}
        

            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <h4 className="font-medium text-sm mb-2"> Streak Rules</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✓ Locked to calendar day</li>
                <li>✓ Miss a day = streak resets</li>
              </ul>
            </div>
          
        </div>
      
    </Layout>
    </ClickSpark>
  );
};

export default Home;
