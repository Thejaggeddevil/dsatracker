import { RequestHandler } from "express";
import { db } from "../firebaseAdmin";

/* ================================
   HELPER: Get IST Date
================================ */

function getTodayDate(): string {
  const now = new Date();
  const istDate = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  return istDate.toISOString().split("T")[0];
}

/* ================================
   TYPES
================================ */

interface RevisionDoc {
  id: string;
  submissionId: string;
  questionName?: string;
  questionLink?: string;
  difficulty?: string;
  topic?: string;
  revisionNumber: number;
  scheduledDate: string;
  completedDate?: string | null;
  note?: string | null;
  color?: string | null;
}

/* ================================
   GET DUE REVISIONS
================================ */

export const handleGetDueRevisions: RequestHandler = async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const today = getTodayDate();

    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("revisions")
      .where("scheduledDate", "<=", today)
      .get();

    const revisions: RevisionDoc[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<RevisionDoc, "id">;

      return {
        id: doc.id,
        ...data,
      };
    });

    const filtered = revisions
      .filter((rev) => !rev.completedDate)
      .sort(
        (a, b) =>
          new Date(a.scheduledDate).getTime() -
          new Date(b.scheduledDate).getTime()
      );

    res.json({
      success: true,
      revisions: filtered, // ✅ return filtered not revisions
    });

  } catch (err) {
    console.error("Get due revisions error:", err);
    res.status(500).json({ success: false });
  }
};

/* ================================
   MARK REVISION
================================ */

export const handleMarkRevision: RequestHandler = async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { revisionId } = req.body;

    if (!revisionId) {
      return res.status(400).json({
        success: false,
        message: "revisionId is required",
      });
    }

    const revisionRef = db
      .collection("users")
      .doc(userId)
      .collection("revisions")
      .doc(revisionId);

    const revisionSnap = await revisionRef.get();

    if (!revisionSnap.exists) {
      return res.status(404).json({
        success: false,
        message: "Revision not found",
      });
    }

    const revision = revisionSnap.data() as RevisionDoc;

    if (revision.completedDate) {
      return res.status(400).json({
        success: false,
        message: "Already completed",
      });
    }

    await revisionRef.update({
      completedDate: getTodayDate(),
      lastRevisedAt: new Date(),
    });

    res.json({
      success: true,
      message: "Revision marked as complete",
    });

  } catch (err) {
    console.error("Mark revision error:", err);
    res.status(500).json({ success: false });
  }
};

/* ================================
   SAVE / UPDATE NOTE
================================ */

export const handleSaveRevisionNote: RequestHandler = async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { revisionId, note, color } = req.body;

    if (!revisionId) {
      return res.status(400).json({
        success: false,
        message: "revisionId is required",
      });
    }

    const revisionRef = db
      .collection("users")
      .doc(userId)
      .collection("revisions")
      .doc(revisionId);

    const revisionSnap = await revisionRef.get();

    if (!revisionSnap.exists) {
      return res.status(404).json({
        success: false,
        message: "Revision not found",
      });
    }

    await revisionRef.set(
      {
        note: note ?? "",
        color: color ?? "#F5E6D3",
        noteUpdatedAt: new Date(),
      },
      { merge: true }
    );

    res.json({
      success: true,
      message: "Note saved successfully",
    });

  } catch (err) {
    console.error("Save note error:", err);
    res.status(500).json({ success: false });
  }
};

/* ================================
   DELETE NOTE
================================ */

export const handleDeleteRevisionNote: RequestHandler = async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const revisionId = req.params.id;

    if (!revisionId) {
      return res.status(400).json({
        success: false,
        message: "revisionId is required",
      });
    }

    const revisionRef = db
      .collection("users")
      .doc(userId)
      .collection("revisions")
      .doc(revisionId);

    await revisionRef.set(
      {
        note: null,
        color: null,
        noteUpdatedAt: null,
      },
      { merge: true }
    );

    res.json({
      success: true,
      message: "Note deleted successfully",
    });

  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ success: false });
  }
};

/* ================================
   GET REVISION HISTORY
================================ */

export const handleGetRevisionHistory: RequestHandler = async (req: any, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("revisions")
      .get();

    const history: RevisionDoc[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<RevisionDoc, "id">;

      return {
        id: doc.id,
        ...data,
      };
    });

    const filtered = history
      .filter((rev) => !!rev.completedDate)
      .sort(
        (a, b) =>
          new Date(b.completedDate as string).getTime() -
          new Date(a.completedDate as string).getTime()
      );

    res.json({
      success: true,
      revisions: filtered,
    });

  } catch (err) {
    console.error("Get revision history error:", err);
    res.status(500).json({ success: false });
  }
};
