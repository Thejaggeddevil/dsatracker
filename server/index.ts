import "dotenv/config";
import express from "express";
import cors from "cors";

import {
  handleSubmitQuestion,
  handleGetStreak,
  handleGetSubmissions,
  handleDeleteSubmission,
} from "./routes/submissions";

import {
  handleGetDueRevisions,
  handleMarkRevision,
  handleGetRevisionHistory,
  handleSaveRevisionNote,
  handleDeleteRevisionNote,
} from "./routes/revisions";

import {
  handleGetProfile,
  handleUpdateProfile,
} from "./routes/profile";

import { initDatabase } from "./db/database";
import { verifyFirebaseToken } from "./middleware/verifyFirebaseToken";

export function createServer() {
  const app = express();

  // Initialize DB
  initDatabase();

  /* =========================================
     CORS CONFIG (SAFE + RENDER + VERCEL)
  ========================================== */

  const allowedOrigins = [
    "http://localhost:5173",
    "https://dsatracker-sandy.vercel.app",
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  // Explicit preflight handling
  app.options("*", cors());

  /* =========================================
     GLOBAL MIDDLEWARE
  ========================================== */

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  /* =========================================
     PROTECTED ROUTES
  ========================================== */

  app.post("/api/submissions/submit", verifyFirebaseToken, handleSubmitQuestion);
  app.get("/api/submissions/list", verifyFirebaseToken, handleGetSubmissions);
  app.get("/api/streak", verifyFirebaseToken, handleGetStreak);
  app.delete("/api/submissions/:id", verifyFirebaseToken, handleDeleteSubmission);

  app.get("/api/revisions/due", verifyFirebaseToken, handleGetDueRevisions);
  app.post("/api/revisions/mark", verifyFirebaseToken, handleMarkRevision);
  app.get("/api/revisions/history", verifyFirebaseToken, handleGetRevisionHistory);
  app.post("/api/revisions/note", verifyFirebaseToken, handleSaveRevisionNote);
  app.delete("/api/revisions/note/:id", verifyFirebaseToken, handleDeleteRevisionNote);

  app.get("/api/profile", verifyFirebaseToken, handleGetProfile);
  app.put("/api/profile", verifyFirebaseToken, handleUpdateProfile);

  /* =========================================
     PUBLIC ROUTES
  ========================================== */

  app.get("/api/ping", (_req, res) => {
    res.json({ message: process.env.PING_MESSAGE ?? "ping" });
  });

  return app;
}

/* =========================================
   START SERVER (RENDER SAFE)
========================================= */

const PORT = process.env.PORT || 5000;

const app = createServer();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});