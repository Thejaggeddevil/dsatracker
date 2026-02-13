// Simple in-memory database with file persistence
// In production, replace with proper DB (PostgreSQL, MySQL, etc.)

/*
  IMPORTANT:
  Authentication is now handled by Firebase.
  User.id = Firebase UID
*/

export interface User {
  id: string;              // Firebase UID
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  id: string;
  userId: string;          // Firebase UID
  questionName: string;
  platform: 'leetcode' | 'gfg' | 'other';
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  solveType: 'self' | 'hint' | 'solution';
  submittedAt: Date;
  submittedDate: string;   // YYYY-MM-DD
  points: number;
}

export interface Revision {
  id: string;
  submissionId: string;
  userId: string;          // Firebase UID
  scheduledDate: string;   // YYYY-MM-DD
  completedDate?: string;  // YYYY-MM-DD
  revisionNumber: number;  // 1, 2, 3, or 4
  lastRevisedAt?: Date;
  points: number;
}

export interface Streak {
  userId: string;          // Firebase UID
  currentStreak: number;
  longestStreak: number;
  lastSubmissionDate?: string; // YYYY-MM-DD
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
}
