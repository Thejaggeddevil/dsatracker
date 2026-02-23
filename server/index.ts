import "dotenv/config";
import express from "express";
import cors from "cors";

import {
  handleSubmitQuestion,
  handleGetStreak,
  handleGetSubmissions,
  handleDeleteSubmission,
} from "./routes/submissions.js";

import {
  handleGetDueRevisions,
  handleMarkRevision,
  handleGetRevisionHistory,
  handleSaveRevisionNote,
  handleDeleteRevisionNote,
} from "./routes/revisions.js";

import {
  handleGetProfile,
  handleUpdateProfile,
} from "./routes/profile.js";

import { initDatabase } from "./db/database.js";
import { verifyFirebaseToken } from "./middleware/verifyFirebaseToken.js";

export function createServer() {
  const app = express();

  // Initialize DB
  initDatabase();

  /* =========================================
     CORS CONFIG (FIXED FOR VERCEL + RENDER)
  ========================================== */

  const allowedOrigins = [
    "http://localhost:5173",
    "https://dsatracker-sandy.vercel.app",
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Handle preflight explicitly
  app.options("*", cors());

  /* =========================================
     GLOBAL MIDDLEWARE
  ========================================== */

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  /* =========================================
     PROTECTED ROUTES (Firebase Verified)
  ========================================== */

  // Submission routes
  app.post("/api/submissions/submit", verifyFirebaseToken, handleSubmitQuestion);
  app.get("/api/submissions/list", verifyFirebaseToken, handleGetSubmissions);
  app.get("/api/streak", verifyFirebaseToken, handleGetStreak);
  app.delete("/api/submissions/:id", verifyFirebaseToken, handleDeleteSubmission);

  // Revision routes
  app.get("/api/revisions/due", verifyFirebaseToken, handleGetDueRevisions);
  app.post("/api/revisions/mark", verifyFirebaseToken, handleMarkRevision);
  app.get("/api/revisions/history", verifyFirebaseToken, handleGetRevisionHistory);
  app.post("/api/revisions/note", verifyFirebaseToken, handleSaveRevisionNote);
  app.delete("/api/revisions/note/:id", verifyFirebaseToken, handleDeleteRevisionNote);

  // Profile routes
  app.get("/api/profile", verifyFirebaseToken, handleGetProfile);
  app.put("/api/profile", verifyFirebaseToken, handleUpdateProfile);

  /* =========================================
     PUBLIC ROUTES
  ========================================== */

  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  return app;
}