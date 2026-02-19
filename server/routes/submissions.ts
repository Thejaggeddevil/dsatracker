import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../firebaseAdmin";

/* ================================
   SCHEMA
================================ */

const SubmissionSchema = z.object({
  questionName: z.string().min(1).max(500),

  questionLink: z.string().url().min(5),

  platform: z.union([
    z.enum(["leetcode", "gfg", "other"]),
    z.string().min(1).max(50)
  ]),

  difficulty: z.union([
    z.enum(["easy", "medium", "hard"]),
    z.string().min(1).max(20)
  ]),

  topic: z.string().min(1).max(100),

  solveType: z.union([
    z.enum(["self", "hint", "solution"]),
    z.string().min(1).max(50)
  ]),

  method: z.string().min(1),
});


/* ================================
   HELPERS (SAFE IST)
================================ */

function getTodayDate(): string {
  const now = new Date();
  const istDate = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  return istDate.toISOString().split("T")[0];
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/* ================================
   SUBMIT QUESTION
================================ */

export const handleSubmitQuestion: RequestHandler = async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const email = req.user.email;
    const name = req.user.name || "User";

    const validation = SubmissionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0]?.message,
      });
    }

    const today = getTodayDate();
    const submissionId = crypto.randomUUID();

    const {
      questionName,
      questionLink,
      platform,
      difficulty,
      topic,
      method,
      solveType,
    } = validation.data;

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    /* CREATE USER IF NOT EXISTS */
    if (!userSnap.exists) {
      await userRef.set({
        name,
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
        streak: {
          currentStreak: 0,
          longestStreak: 0,
          lastSubmissionDate: "",
        },
      });
    }

    /* PREVENT MULTIPLE SUBMISSIONS SAME DAY */
    const existingToday = await userRef
      .collection("submissions")
      .where("submittedDate", "==", today)
      .limit(1)
      .get();

    if (!existingToday.empty) {
      return res.status(400).json({
        success: false,
        message: "You already submitted today",
      });
    }

    /* SAVE SUBMISSION */
    await userRef.collection("submissions").doc(submissionId).set({
      id: submissionId,
      questionName,
      questionLink,
      platform,
      method,
      difficulty,
      topic,
      solveType,
      submittedAt: new Date(),
      submittedDate: today,
    });

    /* UPDATE STREAK (CORRECT LOGIC) */

    const freshUserSnap = await userRef.get();
    const userData = freshUserSnap.data() as any;

    let streak = userData.streak || {
      currentStreak: 0,
      longestStreak: 0,
      lastSubmissionDate: "",
    };

    const yesterday = addDays(today, -1);

    // 🔥 Reset if skipped
    if (
      streak.lastSubmissionDate &&
      streak.lastSubmissionDate !== yesterday &&
      streak.lastSubmissionDate !== today
    ) {
      streak.currentStreak = 0;
    }

    // 🔥 Apply today's submission
    if (streak.lastSubmissionDate !== today) {
      if (streak.lastSubmissionDate === yesterday) {
        streak.currentStreak += 1;
      } else {
        streak.currentStreak = 1;
      }

      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }

      streak.lastSubmissionDate = today;
    }

    await userRef.update({ streak });

    /* SCHEDULE REVISIONS */

    const schedule = [1, 3, 7, 21];

    for (let i = 0; i < schedule.length; i++) {
      const revisionId = crypto.randomUUID();

      await userRef.collection("revisions").doc(revisionId).set({
        id: revisionId,
        submissionId,
        revisionNumber: i + 1,
        scheduledDate: addDays(today, schedule[i]),
        completedDate: null,

        // snapshot data (no extra reads needed)
        questionName,
        questionLink,
        difficulty,
        topic,
      });
    }

    res.status(201).json({
      success: true,
      submissionId,
      streak,
    });

  } catch (err) {
    console.error("Submit error:", err);
    res.status(500).json({ success: false });
  }
};

/* ================================
   GET STREAK
================================ */

export const handleGetStreak: RequestHandler = async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const today = getTodayDate();
    const yesterday = addDays(today, -1);

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.json({
        success: true,
        streak: {
          currentStreak: 0,
          longestStreak: 0,
          lastSubmissionDate: "",
        },
      });
    }

    const userData = userSnap.data() as any;
    let streak = userData.streak;

    if (!streak) {
      streak = {
        currentStreak: 0,
        longestStreak: 0,
        lastSubmissionDate: "",
      };
    }

    // Optional defensive reset
    if (
      streak.lastSubmissionDate &&
      streak.lastSubmissionDate !== yesterday &&
      streak.lastSubmissionDate !== today
    ) {
      streak.currentStreak = 0;
      await userRef.update({ streak });
    }

    res.json({
      success: true,
      streak,
    });

  } catch (err) {
    console.error("Streak error:", err);
    res.status(500).json({ success: false });
  }
};

/* ================================
   GET SUBMISSIONS
================================ */

export const handleGetSubmissions: RequestHandler = async (req: any, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("submissions")
      .orderBy("submittedAt", "desc")
      .get();

    const submissions = snapshot.docs.map(doc => doc.data());

    res.json({
      success: true,
      submissions,
    });

  } catch (err) {
    console.error("Get submissions error:", err);
    res.status(500).json({ success: false });
  }
};

/* ================================
   DELETE SUBMISSION
================================ */

export const handleDeleteSubmission: RequestHandler = async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const submissionId = req.params.id;

    const docRef = db
      .collection("users")
      .doc(userId)
      .collection("submissions")
      .doc(submissionId);

    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    await docRef.delete();

    res.json({
      success: true,
      message: "Submission deleted successfully",
    });

  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false });
  }
};
