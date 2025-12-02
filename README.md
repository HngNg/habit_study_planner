# Student Habit Builder PWA

A local-first Progressive Web App (PWA) designed to help university students build and maintain consistent study habits using the principles of *Atomic Habits*.

## 🎯 Vision

The goal is to move beyond simple to-do lists and focus on **Identity-Based Habits**. By applying the Four Laws of Behavior Change, this app helps students become "consistent learners" through small, sustainable actions.

## ✨ Key Features

*   **Identity Onboarding:** Define who you want to become (e.g., "I am a disciplined scholar").
*   **Habit Stacking:** Link new habits to existing cues (e.g., "After I brush my teeth, I will...").
*   **Tiny Versions:** Every habit has a "2-minute version" to lower the barrier on difficult days.
*   **Focus Timer:** Built-in Pomodoro timer that automatically logs progress.
*   **Local-First & Offline:** All data is stored locally (IndexedDB). No internet required.
*   **Analytics:** GitHub-style consistency heatmap and streak tracking.
*   **Data Export:** Full CSV export for backup and analysis.

## 🛠 Tech Stack

*   **Frontend:** React, TypeScript, Vite, TanStack Query, Dexie.js (IndexedDB).
*   **Backend:** Python, FastAPI (Support service).
*   **Infrastructure:** Docker, Docker Compose.

## 🚀 Getting Started

### Prerequisites
*   Docker & Docker Compose

### Quick Start (Recommended)
Run the entire stack with a single command:

```bash
docker-compose up --build
```

Access the application:
*   **App:** [http://localhost:5173](http://localhost:5173)
*   **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Manual Setup

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Running Tests

### Backend Tests
The backend uses `pytest` for testing.

```bash
cd backend
pytest
```

### Frontend Tests
The frontend uses `vitest` for testing.

```bash
cd frontend
npm test
```

## 📂 Project Structure

```text
habit_study_planner/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HabitCard.tsx
│   │   │   ├── HabitForm.tsx
│   │   │   ├── StreakBadge.tsx
│   │   │   ├── Heatmap.tsx
│   │   │   └── Modal.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   └── Onboarding.tsx
│   │   ├── hooks/
│   │   │   ├── useHabitLog.ts
│   │   │   └── useStreaks.ts
│   │   ├── db/
│   │   │   └── db.ts
│   │   ├── utils/
│   │   │   └── export.ts
│   │   └── App.tsx
│   ├── public/
│   │   ├── manifest.json
│   │   └── sw.js
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
└── README.md
```

## 📄 License
This project is created for the ITPM course.
