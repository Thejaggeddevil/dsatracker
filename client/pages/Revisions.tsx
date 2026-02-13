import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import ClickSpark from '@/components/ClickSpark';
import { auth } from "@/lib/firebase";

interface DueRevision {
  id: string;
  submissionId: string;
  questionName: string;
  difficulty: string;
  topic: string;
  revisionNumber: number;
  scheduledDate: string;
  daysSinceLastRevision: number;
}

const Revisions = () => {
  const navigate = useNavigate();
  const [revisions, setRevisions] = useState<DueRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRevision, setMarkingRevision] = useState<string | null>(null);

  // 🔥 Proper Firebase Auth Init
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      const token = await user.getIdToken();
      await loadDueRevisions(token);
    });

    return () => unsubscribe();
  }, []);

  const loadDueRevisions = async (token: string) => {
    try {
      const response = await fetch('/api/revisions/due', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load revisions');
      }

      if (data.success) {
        setRevisions(data.revisions || []);
      }
    } catch (error) {
      console.error('Error loading revisions:', error);
      toast.error('Failed to load revisions');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRevision = async (revisionId: string) => {
    setMarkingRevision(revisionId);

    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch('/api/revisions/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ revisionId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to mark revision');
      }

      toast.success(`Revision marked! +${data.pointsEarned} points`);

      // Remove completed revision from UI
      setRevisions(prev => prev.filter(r => r.id !== revisionId));

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setMarkingRevision(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950';
      case 'hard':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950';
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
    <Layout>
      <ClickSpark sparkColor="rgba(10, 108, 199, 0.8)" sparkCount={10} sparkRadius={20} duration={500} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Due Revisions</h1>
        <p className="text-muted-foreground mb-8">
          Questions scheduled for review today - keep your learning fresh!
        </p>

        {revisions.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No revisions due today!</p>
            <p className="text-muted-foreground">
              Great work! Keep practicing to schedule future revisions.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {revisions.map((revision) => (
              <div
                key={revision.id}
                className="rounded-lg border border-border bg-card p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                        R{revision.revisionNumber}
                      </span>
                      <h3 className="font-semibold text-base">{revision.questionName}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${getDifficultyColor(
                          revision.difficulty
                        )}`}
                      >
                        {revision.difficulty}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                        {revision.topic}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {revision.daysSinceLastRevision} days since last solved
                    </p>
                  </div>

                  <Button
                    onClick={() => handleMarkRevision(revision.id)}
                    disabled={markingRevision === revision.id}
                    className="sm:whitespace-nowrap"
                  >
                    {markingRevision === revision.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Marking...
                      </>
                    ) : (
                      'Mark Revised'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 rounded-lg bg-secondary/50 border border-border">
          <h4 className="font-medium text-sm mb-2">Revision Schedule</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Each question is scheduled for 4 revisions:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 grid grid-cols-2 gap-2">
            <li>• R1: 1 day after solving</li>
            <li>• R2: 3 days after solving</li>
            <li>• R3: 7 days after solving</li>
            <li>• R4: 21 days after solving</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Revisions;
