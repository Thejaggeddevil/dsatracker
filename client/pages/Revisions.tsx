import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import ClickSpark from "@/components/ClickSpark";
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
  questionLink?: string;
}

interface RevisionHistoryItem extends DueRevision {
  revisedAt: string;
  note?: string;
}

const Revisions = () => {
  const navigate = useNavigate();

  const [revisions, setRevisions] = useState<DueRevision[]>([]);
  const [revisionHistory, setRevisionHistory] = useState<RevisionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRevision, setMarkingRevision] = useState<string | null>(null);

  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  // 🔥 Auth Init
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const token = await user.getIdToken();
      await loadDueRevisions(token);
    });

    return () => unsubscribe();
  }, []);

  const loadDueRevisions = async (token: string) => {
    try {
      const response = await fetch("/api/revisions/due", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      if (data.success) {
        setRevisions(data.revisions || []);
      }
    } catch (error) {
      toast.error("Failed to load revisions");
    } finally {
      setLoading(false);
    }
  };

  // ✅ MARK REVISION
  const handleMarkRevision = async (revision: DueRevision) => {
    setMarkingRevision(revision.id);

    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const response = await fetch("/api/revisions/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ revisionId: revision.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast.success(`Revision marked! +${data.pointsEarned} points`);

      // Move to history
      const historyItem: RevisionHistoryItem = {
        ...revision,
        revisedAt: new Date().toISOString(),
        note: notes[revision.id] || "",
      };

      setRevisionHistory((prev) => [historyItem, ...prev]);
      setRevisions((prev) => prev.filter((r) => r.id !== revision.id));

    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setMarkingRevision(null);
    }
  };

  // ✅ SAVE NOTE
  const saveNote = async (revisionId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      await fetch("/api/revisions/note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          revisionId,
          note: notes[revisionId],
        }),
      });

      toast.success("Note saved");
      setEditingNote(null);
    } catch {
      toast.error("Failed to save note");
    }
  };

  const deleteNote = async (revisionId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      await fetch(`/api/revisions/note/${revisionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotes((prev) => {
        const updated = { ...prev };
        delete updated[revisionId];
        return updated;
      });

      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950";
      case "hard":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950";
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
    <ClickSpark sparkColor="rgba(10,108,199,0.8)" sparkCount={10} sparkRadius={20} duration={500}>
    <Layout>
      
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">Due Revisions</h1>

          {/* DUE REVISIONS */}
          {revisions.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
              <p>No revisions due today!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {revisions.map((revision) => (
                <div
                  key={revision.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <a
                    href={revision.questionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:underline"
                  >
                    {revision.questionName}
                  </a>

                  {/* NOTE SECTION */}
                  {editingNote === revision.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={notes[revision.id] || ""}
                        onChange={(e) =>
                          setNotes((prev) => ({
                            ...prev,
                            [revision.id]: e.target.value,
                          }))
                        }
                        className="w-full border rounded p-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveNote(revision.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingNote(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm">
                      {notes[revision.id] ? (
                        <>
                          <p>{notes[revision.id]}</p>
                          <div className="flex gap-3 text-xs mt-1">
                            <button onClick={() => setEditingNote(revision.id)}>
                              Edit
                            </button>
                            <button onClick={() => deleteNote(revision.id)}>
                              Delete
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          className="text-xs"
                          onClick={() => setEditingNote(revision.id)}
                        >
                          + Add Note
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-3">
                    <Button
                      onClick={() => handleMarkRevision(revision)}
                      disabled={markingRevision === revision.id}
                    >
                      {markingRevision === revision.id ? "Marking..." : "Mark Revised"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* REVISION HISTORY */}
          {revisionHistory.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-3">Revision History</h2>

              <div className="space-y-3">
                {revisionHistory.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <a
                      href={item.questionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:underline"
                    >
                      {item.questionName}
                    </a>

                    <p className="text-xs text-muted-foreground mt-1">
                      Revised on {new Date(item.revisedAt).toLocaleDateString()}
                    </p>

                    {item.note && (
                      <p className="text-sm mt-2">{item.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      
    </Layout>
    </ClickSpark>
  );
};

export default Revisions;
