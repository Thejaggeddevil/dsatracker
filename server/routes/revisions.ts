import { RequestHandler } from 'express';
import { z } from 'zod';
import { revisionDb, submissionDb, streakDb } from '../db/database';

const MarkRevisionSchema = z.object({
  revisionId: z.string().min(1)
});

// Get today's date as YYYY-MM-DD
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/* ================================
   GET DUE REVISIONS
================================ */

export const handleGetDueRevisions: RequestHandler = async (req: any, res) => {
  try {
    const userId = req.user.uid;

    const today = getTodayDate();
    const dueRevisions = revisionDb.findDueByUserIdAndDate(userId, today);

    const result = dueRevisions.map(rev => {
      const submission = submissionDb.findById(rev.submissionId);

      const daysSince = rev.lastRevisedAt
        ? Math.floor(
            (Date.now() - new Date(rev.lastRevisedAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

      return {
        id: rev.id,
        submissionId: rev.submissionId,
        questionName: submission?.questionName || 'Unknown',
        difficulty: submission?.difficulty || 'unknown',
        topic: submission?.topic || 'Unknown',
        revisionNumber: rev.revisionNumber,
        scheduledDate: rev.scheduledDate,
        daysSinceLastRevision: Math.max(0, daysSince)
      };
    });

    res.json({
      success: true,
      revisions: result
    });

  } catch (err) {
    console.error('Get due revisions error:', err);
    res.status(500).json({ success: false });
  }
};

/* ================================
   MARK REVISION
================================ */

export const handleMarkRevision: RequestHandler = async (req: any, res) => {
  try {
    const userId = req.user.uid;

    const validation = MarkRevisionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0]?.message
      });
    }

    const revision = revisionDb.findById(validation.data.revisionId);

    if (!revision || revision.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Revision not found'
      });
    }

    const today = getTodayDate();

    if (today < revision.scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Revision is not yet due'
      });
    }

    if (revision.completedDate) {
      return res.status(400).json({
        success: false,
        message: 'Revision already completed'
      });
    }

    revision.completedDate = today;
    revision.lastRevisedAt = new Date();
    revisionDb.update(revision);

    const streak = streakDb.getOrCreate(userId);
    streak.totalPoints += revision.points;
    streak.updatedAt = new Date();
    streakDb.update(streak);

    res.json({
      success: true,
      message: 'Revision marked as complete',
      pointsEarned: revision.points
    });

  } catch (err) {
    console.error('Mark revision error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/* ================================
   GET REVISION HISTORY
================================ */

export const handleGetRevisionHistory: RequestHandler = async (req: any, res) => {
  try {
    const userId = req.user.uid;

    const allRevisions = revisionDb.findByUserId(userId);

    const result = allRevisions.map(rev => {
      const submission = submissionDb.findById(rev.submissionId);

      return {
        id: rev.id,
        submissionId: rev.submissionId,
        questionName: submission?.questionName || 'Unknown',
        difficulty: submission?.difficulty || 'unknown',
        topic: submission?.topic || 'Unknown',
        revisionNumber: rev.revisionNumber,
        scheduledDate: rev.scheduledDate,
        completedDate: rev.completedDate,
        status: rev.completedDate ? 'completed' : 'pending'
      };
    });

    res.json({
      success: true,
      revisions: result
    });

  } catch (err) {
    console.error('Get revision history error:', err);
    res.status(500).json({ success: false });
  }
};
