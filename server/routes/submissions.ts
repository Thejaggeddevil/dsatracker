import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../firebaseAdmin";

const SubmissionSchema = z.object({
  questionName: z.string().min(1).max(500),
  platform: z.enum(["leetcode", "gfg", "other"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  topic: z.string().min(1).max(100),
  solveType: z.enum(["self", "hint", "solution"]),
});

/* ================================
   HELPERS
================================ */

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
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
      platform,
      difficulty,
      topic,
      solveType,
    } = validation.data;

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    /* ========================
       CREATE USER IF NOT EXISTS
    ========================= */
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

    /* ========================
       SAVE SUBMISSION
    ========================= */

    await userRef.collection("submissions").doc(submissionId).set({
      id: submissionId,
      questionName,
      platform,
      difficulty,
      topic,
      solveType,
      submittedAt: new Date(),
      submittedDate: today,
    });

    /* ========================
       UPDATE STREAK
    ========================= */

    const freshUserSnap = await userRef.get();
    const userData = freshUserSnap.data() as any;

    let streak = userData.streak || {
      currentStreak: 0,
      longestStreak: 0,
      lastSubmissionDate: "",
    };

    const yesterday = addDays(today, -1);

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

    /* ========================
       SCHEDULE REVISIONS
    ========================= */

    const schedule = [1, 3, 7, 21];

    for (let i = 0; i < schedule.length; i++) {
      const revisionId = crypto.randomUUID();

      await userRef.collection("revisions").doc(revisionId).set({
        id: revisionId,
        submissionId,
        revisionNumber: i + 1,
        scheduledDate: addDays(today, schedule[i]),
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

    const userSnap = await db.collection("users").doc(userId).get();

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

    const data = userSnap.data();

    res.json({
      success: true,
      streak: data?.streak || {
        currentStreak: 0,
        longestStreak: 0,
        lastSubmissionDate: "",
      },
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
