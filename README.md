# DSA Tracker – Consistency With DSA

A production-grade accountability system to track Data Structures & Algorithms consistency, submissions, streaks, and revision cycles.

---

## Live Demo

Frontend (Vercel)  
https://consistencywithdsa.vercel.app  

Backend (Render)  
https://dsatracker-dub8.onrender.com  

---

## About The Project

DSA Tracker is a full-stack web application built to enforce disciplined DSA practice through:

- Daily submission tracking  
- Automated streak calculation  
- Smart revision scheduling  
- Profile management  
- Analytics-style submission heatmap  

Unlike basic trackers, this system:

- Verifies submissions using Firebase Authentication  
- Validates tokens on the backend using Firebase Admin SDK  
- Secures all protected routes  
- Is deployed in a real production environment  

---

## Tech Stack

### Frontend

- React (Vite)
- TypeScript
- TailwindCSS
- Firebase Authentication
- React Router
- Lucide Icons
- Sonner (toast notifications)
- Custom submission heatmap grid

### Backend

- Node.js
- Express
- TypeScript
- Firebase Admin SDK
- Production-ready CORS configuration
- Token verification middleware

### Deployment

- Frontend deployed on Vercel  
- Backend deployed on Render  
- Environment variables securely managed  

---

## Core Features

### 1. Daily Submission Tracking

- Submit DSA questions  
- Tracks platform, difficulty, topic, and solving method  
- Stores submission timestamp  

---

### 2. Streak System

- Calculates daily streak automatically  
- Enforces one valid submission per day  
- Fully protected using Firebase token verification  

---

### 3. Submission History

- Displays submission history  
- Expand/collapse functionality  
- Delete submission with confirmation modal  
- Backend-protected API calls  

---

### 4. Heatmap Submission Grid

- Calendar-based grid similar to LeetCode  
- Year-to-date submission tracking  
- Theme selector (Green / Pink / Blue)  
- Color intensity based on submission count  

---

### 5. Revision System

- Tracks revision history  
- Due revision endpoint  
- Optimized review cycle logic  

---

### 6. Secure Authentication

- Google Login using Firebase  
- Backend token verification  
- Protected API routes  

---

## Screenshots

Upload screenshots to a `screenshots/` folder inside the repo.

### Home Screen

![Home Screenshot](https://github.com/user-attachments/assets/894ea1c1-5f48-40a3-adfe-611156d85881)

---

### Submission History

![History Screenshot](https://github.com/user-attachments/assets/6297e491-9e95-4b08-a408-57c7639629f7)

---

### Revisions Screen

![Revisions Screenshot](https://github.com/user-attachments/assets/44cd22fd-39da-4b4b-b3d0-f222e64b3b69)

---

## Project Structure

```
dsatracker/
│
├── client/               # React Frontend
│   ├── components/
│   ├── pages/
│   ├── lib/
│   └── config
│
├── server/               # Express Backend
│   ├── routes/
│   ├── middleware/
│   ├── db/
│   └── firebaseAdmin
│
├── dist/                 # Compiled server output
└── package.json
```

---

## Environment Variables

### Frontend (.env)

```
VITE_API_BASE_URL=https://dsatracker-dub8.onrender.com
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

### Backend (.env)

```
PORT=5000
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
```

Never push backend secrets to GitHub.

---

## Local Setup

Clone the repository:

```
git clone https://github.com/Thejaggeddevil/dsatracker
cd dsatracker
```

Install dependencies:

```
pnpm install
```

Run frontend:

```
cd client
pnpm dev
```

Run backend:

```
pnpm run build:server
node dist/server/index.js
```

---

## Production Deployment

Frontend:
- Vercel

Backend:
- Render (Node 22)

CORS configured for:
- Localhost
- Production Vercel domain

---

## Architecture Overview

```
User
  → React Frontend
    → Firebase Authentication
      → Bearer Token
        → Express Backend
          → Firebase Admin Verification
            → Database Operations
```
