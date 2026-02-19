import "dotenv/config";
import express from "express";
import cors from "cors";

import { handleSubmitQuestion, handleGetStreak, handleGetSubmissions, handleDeleteSubmission } from "./routes/submissions";
import { handleGetDueRevisions, handleMarkRevision, handleGetRevisionHistory, handleSaveRevisionNote, handleDeleteRevisionNote } from "./routes/revisions";
import { handleGetProfile, handleUpdateProfile } from "./routes/profile";
import { initDatabase } from "./db/database";
import { verifyFirebaseToken } from "./middleware/verifyFirebaseToken";

export function createServer() {
  const app = express();

  // Initialize JSON DB (temporary until PostgreSQL)
  initDatabase();

  // Global Middleware
  app.use(
  cors({
    origin: true,
    credentials: true,
  })
);


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
