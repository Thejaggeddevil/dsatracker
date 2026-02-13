import * as fs from 'fs';
import * as path from 'path';
import { User, Submission, Revision, Streak } from './schema';

const DATA_DIR = path.join(process.cwd(), '.data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const REVISIONS_FILE = path.join(DATA_DIR, 'revisions.json');
const STREAKS_FILE = path.join(DATA_DIR, 'streaks.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Load JSON file
function loadData<T>(file: string, defaultValue: T): T {
  ensureDataDir();
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error loading ${file}:`, err);
  }
  return defaultValue;
}

// Save JSON file
function saveData<T>(file: string, data: T): void {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

/* ================================
   USER OPERATIONS
================================ */

let users: Map<string, User> = new Map();

function initUsers() {
  const data = loadData<Record<string, User>>(USERS_FILE, {});
  users.clear();
  Object.values(data).forEach(user => {
    users.set(user.id, user);
  });
}

export const userDb = {
  create(user: User): User {
    users.set(user.id, user);
    saveUsersToFile();
    return user;
  },

  findById(id: string): User | undefined {
    return users.get(id);
  },

  findByEmail(email: string): User | undefined {
    return Array.from(users.values()).find(u => u.email === email);
  },

  update(user: User): User {
    users.set(user.id, user);
    saveUsersToFile();
    return user;
  },

  delete(id: string): void {
    users.delete(id);
    saveUsersToFile();
  }
};

function saveUsersToFile() {
  const data: Record<string, User> = {};
  users.forEach((user, id) => {
    data[id] = user;
  });
  saveData(USERS_FILE, data);
}

/* ================================
   SUBMISSION OPERATIONS
================================ */

let submissions: Map<string, Submission> = new Map();

function initSubmissions() {
  const data = loadData<Record<string, Submission>>(SUBMISSIONS_FILE, {});
  submissions.clear();
  Object.values(data).forEach(sub => {
    submissions.set(sub.id, sub);
  });
}

export const submissionDb = {
  create(submission: Submission): Submission {
    submissions.set(submission.id, submission);
    saveSubmissionsToFile();
    return submission;
  },

  findById(id: string): Submission | undefined {
    return submissions.get(id);
  },

  findByUserId(userId: string): Submission[] {
    return Array.from(submissions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) =>
        new Date(b.submittedAt).getTime() -
        new Date(a.submittedAt).getTime()
      );
  },

  findByUserIdAndDate(userId: string, date: string): Submission | undefined {
    return Array.from(submissions.values()).find(
      s => s.userId === userId && s.submittedDate === date
    );
  },

  update(submission: Submission): Submission {
    submissions.set(submission.id, submission);
    saveSubmissionsToFile();
    return submission;
  }
};

function saveSubmissionsToFile() {
  const data: Record<string, Submission> = {};
  submissions.forEach((sub, id) => {
    data[id] = sub;
  });
  saveData(SUBMISSIONS_FILE, data);
}

/* ================================
   REVISION OPERATIONS
================================ */

let revisions: Map<string, Revision> = new Map();

function initRevisions() {
  const data = loadData<Record<string, Revision>>(REVISIONS_FILE, {});
  revisions.clear();
  Object.values(data).forEach(rev => {
    revisions.set(rev.id, rev);
  });
}

export const revisionDb = {
  create(revision: Revision): Revision {
    revisions.set(revision.id, revision);
    saveRevisionsToFile();
    return revision;
  },

  findById(id: string): Revision | undefined {
    return revisions.get(id);
  },

  findByUserId(userId: string): Revision[] {
    return Array.from(revisions.values())
      .filter(r => r.userId === userId)
      .sort((a, b) =>
        a.scheduledDate.localeCompare(b.scheduledDate)
      );
  },

  findDueByUserIdAndDate(userId: string, date: string): Revision[] {
    return Array.from(revisions.values())
      .filter(r =>
        r.userId === userId &&
        r.scheduledDate <= date &&
        !r.completedDate
      )
      .sort((a, b) =>
        a.scheduledDate.localeCompare(b.scheduledDate)
      );
  },

  update(revision: Revision): Revision {
    revisions.set(revision.id, revision);
    saveRevisionsToFile();
    return revision;
  }
};

function saveRevisionsToFile() {
  const data: Record<string, Revision> = {};
  revisions.forEach((rev, id) => {
    data[id] = rev;
  });
  saveData(REVISIONS_FILE, data);
}

/* ================================
   STREAK OPERATIONS
================================ */

let streaks: Map<string, Streak> = new Map();

function initStreaks() {
  const data = loadData<Record<string, Streak>>(STREAKS_FILE, {});
  streaks.clear();
  Object.values(data).forEach(streak => {
    streaks.set(streak.userId, streak);
  });
}

export const streakDb = {
  create(streak: Streak): Streak {
    streaks.set(streak.userId, streak);
    saveStreaksToFile();
    return streak;
  },

  findByUserId(userId: string): Streak | undefined {
    return streaks.get(userId);
  },

  update(streak: Streak): Streak {
    streaks.set(streak.userId, streak);
    saveStreaksToFile();
    return streak;
  },

  getOrCreate(userId: string): Streak {
    let streak = streaks.get(userId);

    if (!streak) {
      streak = {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      streaks.set(userId, streak);
      saveStreaksToFile();
    }

    return streak;
  }
};

function saveStreaksToFile() {
  const data: Record<string, Streak> = {};
  streaks.forEach((streak, userId) => {
    data[userId] = streak;
  });
  saveData(STREAKS_FILE, data);
}

/* ================================
   INIT
================================ */

export function initDatabase() {
  initUsers();
  initSubmissions();
  initRevisions();
  initStreaks();
}
