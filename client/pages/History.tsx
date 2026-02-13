import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Loader2, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface Submission {
  id: string;
  questionName: string;
  platform: string;
  difficulty: string;
  topic: string;
  solveType: string;
  points: number;
  submittedAt: string;
  submittedDate: string;
}

const History = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const token = await user.getIdToken();

        const response = await fetch('/api/submissions/list', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
          setSubmissions(data.submissions || []);
        }
      } catch (error) {
        toast.error('Failed to load submission history');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleDelete = async (id: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const response = await fetch(`/api/submissions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Delete failed");
        return;
      }

      // remove from UI
      setSubmissions(prev => prev.filter(s => s.id !== id));
      toast.success("Submission deleted");

    } catch {
      toast.error("Error deleting submission");
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Submission History</h1>

        {submissions.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            No submissions yet
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="relative rounded-lg border border-border bg-card p-4"
              >

                {/* 3 DOTS MENU */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === submission.id ? null : submission.id)
                    }
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {openMenu === submission.id && (
                    <div className="absolute right-0 mt-2 w-28 bg-card border rounded shadow-lg">
                      <button
                        onClick={() => handleDelete(submission.id)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-destructive/10 text-destructive"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* ORIGINAL CARD CONTENT */}
                <h3 className="font-semibold text-base">
                  {submission.questionName}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {submission.platform} • {submission.difficulty} • {submission.topic}
                </p>
                <p className="text-sm mt-2">
                  +{submission.points} pts
                </p>

              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default History;
