import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// IMPORTANT:
// When running `node dist/server/node-build.mjs`,
// process.cwd() is project root (dsatracker).
// So we use absolute path from project root.

const serviceAccountPath = path.resolve(
  process.cwd(),
  "server",
  "serviceAccountKey.json"
);

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error("Service account JSON file not found at: " + serviceAccountPath);
}

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();
export default admin;
