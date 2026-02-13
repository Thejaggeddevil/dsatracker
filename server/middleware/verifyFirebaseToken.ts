import { Request, Response, NextFunction } from "express";
import admin from "../firebaseAdmin";

export async function verifyFirebaseToken(
  req: any,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false });
    }

    const token = header.split("Bearer ")[1];

    const decoded = await admin.auth().verifyIdToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ success: false });
  }
}
