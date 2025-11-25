# Student Habit Builder PWA - Project Context

## 1. Vision & Philosophy
**Goal:** Create a simple, installable Progressive Web App (PWA) that helps university students build and maintain study habits using the principles of *Atomic Habits*.
**Core Philosophy:** "Identity-based habits." Focus on *who* the student wants to become (e.g., "I am a consistent learner").

**The Four Laws of Behavior Change:**
1.  **Make it Obvious:** Clear cues, habit stacking.
2.  **Make it Attractive:** Temptation bundling.
3.  **Make it Easy:** "Tiny Versions" (2-minute rule).
4.  **Make it Satisfying:** Streaks, heatmaps, immediate feedback.

## 2. Technical Architecture
**Architecture:** Hybrid (Local-First PWA + Support Backend)
*   **Frontend (PWA):** Handles all UI, logic, and *primary data storage* (IndexedDB). Works offline.
*   **Backend (API):** Support service for future sync/email features.

### Tech Stack
*   **Frontend:**
    *   **Framework:** React (Vite) + TypeScript
    *   **State/Storage:** TanStack Query + Dexie.js (IndexedDB)
    *   **Styling:** Vanilla CSS (Variables + Modules)
    *   **PWA:** `vite-plugin-pwa`
*   **Backend:**
    *   **Framework:** FastAPI (Python)
    *   **Server:** Uvicorn
*   **Infrastructure:** Docker & Docker Compose

### Project Structure
```text
/habit_study
├── /backend          # FastAPI Application
│   ├── main.py       # Entry point
│   └── requirements.txt
├── /frontend         # React Application
│   ├── /src
│   │   ├── /components  # UI Components (HabitCard, Timer, Heatmap)
│   │   ├── /db          # Dexie Database Schema
│   │   ├── /hooks       # Custom Hooks (useHabitLog, useStreaks)
│   │   ├── /pages       # Route Pages (Dashboard, Onboarding)
│   │   ├── /stores      # Zustand Stores (User Identity)
│   │   └── /utils       # Helpers (CSV Export)
│   └── vite.config.ts
└── docker-compose.yml
```

## 3. Current Implementation State (MVP)

### Completed Features
*   **Identity Onboarding:** User sets "I am..." statement on first launch.
*   **Habit Management:**
    *   Create habits with "Tiny Versions" and "Habit Stacking" cues.
    *   Local storage via IndexedDB (Dexie).
*   **Dashboard:**
    *   "Today" view showing active habits.
    *   **"Do Tiny":** Quick action to log partial progress.
    *   **Focus Timer:** Pomodoro timer that auto-logs sessions.
*   **Analytics:**
    *   **Streaks:** Current streak calculation.
    *   **Heatmap:** GitHub-style consistency visualization (last 90 days).
*   **Data Export:** CSV export of Habits and Logs.

### Pending / Stretch Goals
*   Weekly Recap Email (Backend endpoint).
*   Cloud Sync (Optional).

## 4. How to Run
**Recommended:** Use Docker Compose.
```bash
docker-compose up --build
```
*   **Frontend:** http://localhost:5173
*   **Backend:** http://localhost:8000/docs

**Manual:**
*   **Backend:** `cd backend && pip install -r requirements.txt && uvicorn main:app --reload`
*   **Frontend:** `cd frontend && npm install && npm run dev`
