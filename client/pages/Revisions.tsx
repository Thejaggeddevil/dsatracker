import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Bell } from "lucide-react";
import { toast } from "sonner";
import ClickSpark from "@/components/ClickSpark";
import { auth } from "@/lib/firebase";
import { apiFetch } from "@/lib/api";
interface DueRevision {
  id: string;
  submissionId: string;
  questionName: string;
  difficulty: string;
  topic: string;
  revisionNumber: number;
  scheduledDate: string;
  questionLink?: string;
  note?: string;
  color?: string;
}

interface RevisionHistoryItem extends DueRevision {
  completedDate: string;
}

const Revisions = () => {
  const navigate = useNavigate();

  const [revisions, setRevisions] = useState<DueRevision[]>([]);
  const [revisionHistory, setRevisionHistory] = useState<RevisionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRevision, setMarkingRevision] = useState<string | null>(null);

  const [notes, setNotes] = useState<
    Record<string, { content: string; color: string }>
  >({});

  const [expandedDue, setExpandedDue] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const [stickyOpen, setStickyOpen] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [stickyContent, setStickyContent] = useState("");
  const [stickyColor, setStickyColor] = useState("#FFFDD0");

  const notificationRef = useRef<HTMLDivElement | null>(null);

  /* ================= AUTH ================= */

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const token = await user.getIdToken();
      await Promise.all([
        loadDueRevisions(token),
        loadRevisionHistory(token),
      ]);
    });

    return () => unsubscribe();
  }, []);

  /* ================= CLOSE DROPDOWN ================= */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ================= LOAD DUE ================= */

  const loadDueRevisions = async (token: string) => {
    try {
      const response = await apiFetch("/api/revisions/due", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      if (data.success) {
        const newRevisions = data.revisions || [];
        setRevisions(newRevisions);

        const noteMap: Record<string, { content: string; color: string }> = {};

        newRevisions.forEach((r: any) => {
          if (r.note) {
            noteMap[r.id] = {
              content: r.note,
              color: r.color || "#FFFDD0",
            };
          }
        });

        setNotes(noteMap);
        if (newRevisions.length > 0) setHasUnread(true);
      }
    } catch {
      toast.error("Failed to load revisions");
    }
  };

  /* ================= LOAD HISTORY ================= */

  const loadRevisionHistory = async (token: string) => {
    try {
      const response = await apiFetch("/api/revisions/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      if (data.success) {
        setRevisionHistory(data.revisions || []);
      }
    } catch {
      toast.error("Failed to load revision history");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SAVE NOTE ================= */

  const saveStickyNote = async () => {
    if (!activeNoteId) return;

    try {
      const token = await auth.currentUser?.getIdToken();

      await apiFetch("/api/revisions/note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          revisionId: activeNoteId,
          note: stickyContent,
          color: stickyColor,
        }),
      });

      setNotes((prev) => ({
        ...prev,
        [activeNoteId]: {
          content: stickyContent,
          color: stickyColor,
        },
      }));

      toast.success("Note saved");
      setStickyOpen(false);
      setActiveNoteId(null);
      setStickyContent("");

    } catch {
      toast.error("Failed to save note");
    }
  };

  /* ================= DELETE NOTE ================= */

  const deleteNote = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();

      await apiFetch(`/api/revisions/note/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotes((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  /* ================= MARK ================= */

  const handleMarkRevision = async (revision: DueRevision) => {
    setMarkingRevision(revision.id);

    try {
      const token = await auth.currentUser?.getIdToken();

      await apiFetch("/api/revisions/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ revisionId: revision.id }),
      });

      toast.success("Revision marked!");
      await loadDueRevisions(token!);
      await loadRevisionHistory(token!);

    } catch {
      toast.error("Something went wrong");
    } finally {
      setMarkingRevision(null);
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

  const visibleDue = expandedDue ? revisions : revisions.slice(0, 5);
  const visibleHistory = expandedHistory
    ? revisionHistory
    : revisionHistory.slice(0, 5);

  const pastelColors = [
    "#FFD1DC",
    "#89CFF0",
    "#B2FBA5",
    "#E6E6FA",
    "#FFDAB9",
    "#63eccc",
    "#F89C74",
    "#adc0e7",
    "#C8A2C8",
    "#bf8d78",
  ];

  return (
    <ClickSpark sparkColor="rgba(10,108,199,0.8)" sparkCount={10} sparkRadius={20} duration={500}>
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Due Revisions</h1>

            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setHasUnread(false);
                }}
                className="relative"
              >
                <Bell className="w-6 h-6" />
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* DUE SECTION */}
          {revisions.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-8 text-center shadow-md">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
              <p>No revisions due today!</p>
            </div>
          )}

          <div className="space-y-4">
            {visibleDue.map((revision) => (
              <div
                key={revision.id}
                className="rounded-lg border border-border bg-card p-4 shadow-lg hover:shadow-xl transition"
              >
                <a
                  href={revision.questionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:underline"
                >
                  {revision.questionName}
                </a>

                <div className="mt-2 text-sm">
                  {notes[revision.id] ? (
                    <>
                      <button
                        className="text-xs mr-3 underline"
                        onClick={() => {
                          const noteObj = notes[revision.id];
                          setStickyContent(noteObj.content);
                          setStickyColor(noteObj.color);
                          setActiveNoteId(revision.id);
                          setStickyOpen(true);
                        }}
                      >
                        View Note
                      </button>
                      <button
                        className="text-xs text-destructive"
                        onClick={() => deleteNote(revision.id)}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      className="text-xs underline"
                      onClick={() => {
                        setStickyContent("");
                        setStickyColor("#d4d19b");
                        setActiveNoteId(revision.id);
                        setStickyOpen(true);
                      }}
                    >
                      + Add Note
                    </button>
                  )}
                </div>

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

          {/* HISTORY */}
          {revisionHistory.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-3">Revision History</h2>

              <div className="space-y-3">
                {visibleHistory.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border bg-card p-4 shadow-lg"
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
                      Revised on {new Date(item.completedDate).toLocaleDateString()}
                    </p>

                    {(notes[item.id] || item.note) && (
                      <button
                        className="text-xs mt-2 underline"
                        onClick={() => {
                          const noteData = notes[item.id] || {
                            content: item.note!,
                            color: item.color || "#d3f4f3",
                          };

                          setStickyContent(noteData.content);
                          setStickyColor(noteData.color);
                          setActiveNoteId(item.id);
                          setStickyOpen(true);
                        }}
                      >
                        View Note
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* STICKY MODAL */}
        {stickyOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div
              className="rounded-2xl shadow-2xl w-[520px] max-w-[95%] p-8"
              style={{ backgroundColor: stickyColor }}
            >
              <h3 className="text-xl font-semibold text-center mb-6 text-gray-800">
                Revision Notes
              </h3>

              <textarea
                value={stickyContent}
                onChange={(e) => setStickyContent(e.target.value)}
                className="w-full h-44 p-4 rounded-xl bg-white/70 text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
              />

              <div className="mt-6 flex gap-3 flex-wrap">
                {pastelColors.map((color) => (
                  <div
                    key={color}
                    onClick={() => setStickyColor(color)}
                    className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                      stickyColor === color ? "border-black scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <Button variant="outline" onClick={() => setStickyOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveStickyNote}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}

      </Layout>
    </ClickSpark>
  );
};

export default Revisions;
