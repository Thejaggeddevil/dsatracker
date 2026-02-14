import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Loader2, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRef } from "react";
import ClickSpark from "@/components/ClickSpark";


interface Submission {
  id: string;
  questionName: string;
  questionLink: string;
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
  const [expanded, setExpanded] = useState(false);
  const [gridColor, setGridColor] = useState("green");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/submissions/list", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.success) {
          setSubmissions(data.submissions || []);
        }
      } catch {
        toast.error("Failed to load submission history");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);
const menuRef = useRef<HTMLDivElement | null>(null);
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node)
    ) {
      setOpenMenu(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const response = await fetch(`/api/submissions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Delete failed");
        return;
      }

      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Submission deleted");
    } catch {
      toast.error("Error deleting submission");
    }
  };

  const visibleSubmissions = expanded
    ? submissions
    : submissions.slice(0, 5);

  // ===== GRID LOGIC =====

  const getLastYearDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(new Date(d));
    }

    return dates;
  };

  // ===== CURRENT YEAR UNTIL TODAY =====
// ===== PRODUCTION CALENDAR GRID (JAN → TODAY) =====

const today = new Date();
const currentYear = today.getFullYear();

const startDate = new Date(currentYear, 0, 1);
const endDate = today;

// Build all dates from Jan 1 to today
const allDates: (Date | null)[] = [];
const temp = new Date(startDate);

while (temp <= endDate) {
  allDates.push(new Date(temp));
  temp.setDate(temp.getDate() + 1);
}

// Pad beginning so first column starts on Sunday
const firstDayOffset = startDate.getDay(); // 0 = Sunday
for (let i = 0; i < firstDayOffset; i++) {
  allDates.unshift(null);
}

// Group into weeks (columns)
const weeks: (Date | null)[][] = [];
for (let i = 0; i < allDates.length; i += 7) {
  weeks.push(allDates.slice(i, i + 7));
}

// Submission count per date
const submissionMap = submissions.reduce((acc, curr) => {
  acc[curr.submittedDate] = (acc[curr.submittedDate] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

// 🎨 Exact LeetCode-style color scales
const isDark =
  document.documentElement.classList.contains("dark");

const colorThemes = {
  green: isDark
    ? ["#3a404d", "#086034", "#006d32", "#26a641", "#39d353"] // dark theme
    : ["#97a0ac", "#9be9a8", "#40c463", "#30a14e", "#216e39"], // light theme

  pink: isDark
    ? ["#3a404d", "#4c1d95", "#7e22ce", "#c026d3", "#f472b6"]
    : ["#97a0ac", "#f9a8d4", "#f472b6", "#ec4899", "#be185d"],

  blue: isDark
    ? ["#3a404d", "#0c4a6e", "#0369a1", "#0284c7", "#38bdf8"]
    : ["#97a0ac", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0369a1"],
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-CA"); 
};

const getColor = (count: number) => {
  const colors = colorThemes[gridColor as keyof typeof colorThemes];
  if (count === 0) return colors[0];
  if (count === 1) return colors[1];
  if (count === 2) return colors[2];
  if (count === 3) return colors[3];
  return colors[4];
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
    <ClickSpark
      sparkColor="rgba(10, 108, 199, 0.8)"
      sparkCount={10}
      sparkRadius={20}
      duration={500}
    >
    <Layout>
      
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Submission History</h1>

        {submissions.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            No submissions yet
          </div>
        ) : (
          <div className="space-y-4">

            {/* QUESTIONS */}
            {visibleSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="relative rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition"
              >
                <div ref={menuRef} className="absolute top-3 right-3">

                  <button
                   onClick={() => {
                   setDeleteId(submission.id);
                  setOpenMenu(null);
                }}

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

                <a
                  href={submission.questionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-base hover:underline text-primary"
                >
                  {submission.questionName}
                </a>

                <p className="text-sm text-muted-foreground mt-1">
                  {submission.platform} • {submission.difficulty} • {submission.topic}
                </p>
              </div>
            ))}

            {/* BOLD ROTATED ARROW */}
            {submissions.length > 5 && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="transition-transform duration-300"
                >
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "28px",
                      fontWeight: "bold",
                      transform: expanded
                        ? "rotate(-90deg)"
                        : "rotate(90deg)",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    »
                  </span>
                </button>
              </div>
            )}
{/* ===== LEETCODE STYLE STREAK GRID ===== */}

<div className="mt-10">

  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-semibold">
      {submissions.length} submissions in {currentYear}
    </h2>

    <select
      value={gridColor}
      onChange={(e) => setGridColor(e.target.value)}
      className="border rounded px-3 py-1 bg-card text-sm"
    >
      <option value="green">Green</option>
      <option value="pink">Pink</option>
      <option value="blue">Blue</option>
    </select>
  </div>

  {/* MONTH LABELS */}
  <div className="flex mb-2 text-xs text-muted-foreground">
    {weeks.map((week, index) => {
      const firstDate = week.find((d) => d !== null);
      if (!firstDate) return <div key={index} className="w-[18px]" />;

      const month = firstDate.getMonth();
      const prevWeek = weeks[index - 1];
      const prevMonth =
        prevWeek?.find((d) => d !== null)?.getMonth();

      const showMonth = index === 0 || month !== prevMonth;

      return (
        <div
          key={index}
          className="w-[18px] text-center font-medium"
        >
          {showMonth
            ? firstDate.toLocaleString("default", { month: "short" })
            : ""}
        </div>
      );
    })}
  </div>

  {/* GRID */}
  <div className="flex gap-[4px] overflow-x-auto pb-2">

    {weeks.map((week, wIndex) => (
      <div key={wIndex} className="flex flex-col gap-[4px]">

        {week.map((date, dIndex) => {
          if (!date) {
            return (
              <div
                key={dIndex}
                className="w-[18px] h-[18px]"
              />
            );
          }

        const dateStr = formatDate(date);

          const count = submissionMap[dateStr] || 0;

          const isToday =
            date.toDateString() === today.toDateString();

          return (
            <div
              key={dIndex}
              title={`${dateStr} - ${count} submissions`}
              style={{
                backgroundColor: getColor(count)
              

              }}
              className="w-[18px] h-[18px] rounded-[4px] transition"
            />
          );
        })}

      </div>
    ))}
  </div>

</div>


          </div>
          
        )}
      </div>
      
      {deleteId && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-card p-6 rounded-xl shadow-xl w-[320px]">
      <h3 className="text-lg font-semibold mb-3">
        Confirm Delete
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        Are you sure you want to delete this submission?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setDeleteId(null)}
          className="px-4 py-2 rounded border"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            handleDelete(deleteId);
            setDeleteId(null);
          }}
          className="px-4 py-2 rounded bg-destructive text-white"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

    </Layout>
    </ClickSpark>
  );
};

export default History;
