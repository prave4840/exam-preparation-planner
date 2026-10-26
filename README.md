# ExamReady — Smart Exam Preparation Planner

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?logo=github&logoColor=white)](https://github.com/prave4840/exam-preparation-planner)
[![Node.js Version](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v18-blue.svg)](https://react.dev/)
[![Prisma Version](https://img.shields.io/badge/Prisma-v6-indigo.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14%2B-blue.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **GitHub Repository:** [https://github.com/prave4840/exam-preparation-planner](https://github.com/prave4840/exam-preparation-planner)


A college micro-project demonstrating Full Stack Web Development, Git and GitHub, advanced React concepts, layered backend architecture, CRUD APIs with validation, centralized error handling, and advanced relational database concepts with PostgreSQL and Prisma ORM.

---

## 📖 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Key Features](#3-key-features)
4. [Database Design & Constraints](#4-database-design--constraints)
5. [REST API Documentation](#5-rest-api-documentation)
6. [Advanced React Concepts & Optimistic Updates](#6-advanced-react-concepts--optimistic-updates)
7. [Project Structure](#7-project-structure)
8. [Installation & Setup Guide](#8-installation--setup-guide)
9. [Automated Testing & Verification](#9-automated-testing--verification)
10. [Git Workflow & GitHub Instructions](#10-git-workflow--github-instructions)
11. [Deployment Guide (Render, Neon & Vercel)](#11-deployment-guide-render-neon--vercel)

---

## 1. Project Overview

**ExamReady** helps college students organize their upcoming semester exams, break down expansive syllabi into bite-sized daily study tasks, track completion percentages, monitor countdowns, and stay focused through a responsive dashboard.

All statistics—including subject progress percentages, countdown days, and task completion counts—are dynamically computed from actual database records in PostgreSQL via Prisma ORM.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Language**: JavaScript (ES Modules, JSX)
- **Routing**: React Router DOM v7
- **Server State & Cache**: TanStack React Query v5 (Optimistic mutations, rollback, cache invalidation)
- **HTTP Client**: Axios with centralized error interceptors
- **Icons**: Lucide React
- **Styling**: Custom modern CSS (soft lavender, indigo, and slate palette with responsive layout)

### Backend
- **Runtime**: Node.js (ES Modules)
- **Web Framework**: Express.js
- **Architecture**: Layered architecture (Routes, Controllers, Services, Validators, Middleware)
- **Validation**: `express-validator` with structured field-level error responses
- **Error Handling**: Centralized error middleware with safe Prisma error mapping

### Database
- **Engine**: PostgreSQL
- **ORM**: Prisma ORM
- **Integrity**: Primary keys, Foreign keys with cascading deletes (`onDelete: Cascade`), Composite `UNIQUE` constraints, and PostgreSQL `CHECK` constraint (`15 <= minutes <= 480`) created via SQL migration

---

## 3. Key Features

### A. Dashboard
- **Aggregate Metrics**: Total upcoming exams, total tasks, completed tasks, pending tasks, and overall preparation percentage (`(completed / total) * 100`).
- **Target Exam Spotlight**: Dynamic countdown banner identifying the nearest upcoming exam.
- **Subject-Wise Progress**: Visual progress bars and completion statistics for every course.
- **Today's Tasks**: Quick checklist of tasks scheduled for today with optimistic toggles.
- **Quick-Add Buttons**: Add exams or tasks directly from the dashboard header.

### B. Exam Management (CRUD)
- Create exams with subject name and exam date.
- Validate that exam date is not in the past and subject name is not blank.
- Reject duplicate exams for the same subject and exam date (`409 Conflict`).
- Edit exam details (subject and exam date).
- Delete exams with confirmation dialog (automatically cascades to delete all associated tasks).
- Real-time countdown badge ("X days left", "Today!", "Tomorrow", "Exam completed").

### C. Study Task Management (CRUD)
- Associate tasks with specific exams.
- Fields: Task title/topic, planned date, duration in minutes (15–480), completion status (`done`).
- Validate that planned task date cannot be scheduled after the exam date.
- Reject duplicate task titles within the same exam (`409 Conflict`).
- Filter tasks by: **All**, **Pending**, **Completed**, **Today's Tasks**, and **Upcoming**.
- Search tasks by topic title.

### D. Progress Tracking
- Formula: `Preparation Percentage = (Completed Tasks / Total Tasks) × 100`.
- Safe zero handling: When an exam has 0 tasks, displays `0%` rather than dividing by zero.
- Dynamic color styling based on progress milestone (0-25% violet, 25-75% indigo, 100% emerald).

### E. Optimistic Updates
- When a student checks off a task, the checkbox and progress bar update **instantaneously** without waiting for network latency.
- If the network fails, React Query restores the previous cached state (**rollback**).
- Success and failure notifications are displayed through non-intrusive floating toasts.

---

## 4. Database Design & Constraints

The database schema is defined in [schema.prisma](file:///server/prisma/schema.prisma) and enforced directly in PostgreSQL.

### Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    Exam ||--o{ StudyTask : "has many (onDelete: Cascade)"
    Exam {
        int id PK "autoincrement"
        string subject "course title"
        datetime examDate "scheduled date"
        datetime createdAt "default now"
        datetime updatedAt "auto-update"
    }
    StudyTask {
        int id PK "autoincrement"
        int examId FK "references Exam(id)"
        string title "syllabus topic"
        datetime plannedDate "study date"
        int minutes "15 to 480 mins"
        boolean done "default false"
        datetime createdAt "default now"
        datetime updatedAt "auto-update"
    }
```

### PostgreSQL Constraints Applied

1. **Primary Keys**: Auto-incrementing integer IDs (`exams_pkey`, `study_tasks_pkey`).
2. **Foreign Key with Cascading Delete**:
   ```sql
   ALTER TABLE "study_tasks" 
   ADD CONSTRAINT "study_tasks_examId_fkey" 
   FOREIGN KEY ("examId") REFERENCES "exams"("id") 
   ON DELETE CASCADE ON UPDATE CASCADE;
   ```
3. **Composite Unique Constraints**:
   - `Exam`: Unique on `(subject, examDate)`. Prevents duplicate exam entries.
   - `StudyTask`: Unique on `(examId, title)`. Prevents duplicate task titles under the same exam.
4. **PostgreSQL CHECK Constraint**:
   ```sql
   ALTER TABLE "study_tasks" 
   ADD CONSTRAINT "check_study_duration" 
   CHECK ("minutes" >= 15 AND "minutes" <= 480);
   ```
   *Enforced at the native database engine level, rejecting invalid durations even if requests bypass the API validation layer.*

---

## 5. REST API Documentation

Base URL: `http://localhost:5000/api`

### Summary Table

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/health` | Server uptime & status check | `200` |
| `GET` | `/api/dashboard` | Aggregated dashboard analytics & today's tasks | `200` |
| `GET` | `/api/exams` | List all exams with task counts & progress | `200` |
| `GET` | `/api/exams/:id` | Single exam details with associated tasks | `200`, `404` |
| `POST` | `/api/exams` | Create a new exam | `201`, `400`, `409` |
| `PUT` | `/api/exams/:id` | Update an existing exam | `200`, `400`, `404`, `409` |
| `DELETE`| `/api/exams/:id` | Delete exam & cascade delete its tasks | `204`, `404` |
| `GET` | `/api/exams/:id/tasks`| Get tasks for an exam (`?done=true/false&filter=...`) | `200`, `404` |
| `POST` | `/api/exams/:id/tasks`| Add a study task to an exam | `201`, `400`, `404`, `409` |
| `GET` | `/api/tasks` | Global tasks list across all exams (`?examId=&filter=`) | `200` |
| `GET` | `/api/tasks/:id` | Retrieve an individual task | `200`, `404` |
| `PATCH` | `/api/tasks/:id` | Update task fields (e.g. `done`, `title`, `minutes`)| `200`, `400`, `404` |
| `DELETE`| `/api/tasks/:id` | Delete an individual task | `204`, `404` |

### Sample Structured Responses

#### Success Response (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 16,
    "examId": 1,
    "title": "B+ Trees & Query Optimization",
    "plannedDate": "2026-11-01T10:00:00.000Z",
    "minutes": 90,
    "done": false,
    "createdAt": "2026-10-26T04:45:00.000Z"
  }
}
```

#### Validation Error (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "minutes",
      "message": "Study duration must be between 15 and 480 minutes"
    }
  ]
}
```

#### Duplicate Conflict (`409 Conflict`)
```json
{
  "success": false,
  "message": "A study task with this title already exists for this exam",
  "errors": [
    {
      "field": "title",
      "message": "A study task with this title already exists for this exam"
    }
  ]
}
```

---

## 6. Advanced React Concepts & Optimistic Updates

The application implements a 6-step optimistic update lifecycle in [`client/src/hooks/useToggleTask.js`](file:///client/src/hooks/useToggleTask.js):

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant UI as React Component
    participant Cache as TanStack Query Cache
    participant Server as Express & PostgreSQL

    Student->>UI: Clicks checkbox on Study Task
    UI->>Cache: 1. Cancel ongoing refetches
    UI->>Cache: 2. Snapshot previous cache (tasks, exams, dashboard)
    UI->>Cache: 3. Optimistically flip task.done (true <-> false)
    UI->>UI: 4. Instantly recalculate progress bar & statistics
    UI->>Server: 5. Send PATCH /api/tasks/:id { done: nextDone }
    alt Network / Server Success
        Server-->>UI: 200 OK
        UI->>UI: 6a. Show success toast ("Task completed! 🎉")
        UI->>Cache: 6b. Invalidate & refetch fresh DB state
    else Network / Constraint Failure
        Server-->>UI: 400/500 Error
        UI->>Cache: Rollback to snapshot (restore previous state)
        UI->>UI: Show error toast notification
    end
```

---

## 7. Project Structure

```
exam perparation planner/
├── package.json               # Root convenience runner scripts
├── .gitignore                 # Ignores node_modules, .env, build output
├── README.md                  # Comprehensive project documentation
├── client/                    # React + Vite Frontend
│   ├── index.html             # Single-page HTML container with Plus Jakarta Sans font
│   ├── vite.config.js         # Vite configuration with /api backend proxy
│   ├── package.json           # Frontend dependencies & scripts
│   ├── .env.example           # Client environment template
│   ├── .env                   # Client local environment configuration
│   └── src/
│       ├── api/               # Axios instance and API call services
│       │   ├── axiosClient.js
│       │   ├── examsApi.js
│       │   ├── tasksApi.js
│       │   └── dashboardApi.js
│       ├── context/           # Toast notification context
│       │   └── ToastContext.jsx
│       ├── hooks/             # Custom React & React Query hooks
│       │   ├── useToast.js
│       │   ├── useExams.js
│       │   ├── useTasks.js
│       │   ├── useDashboard.js
│       │   └── useToggleTask.js  # Optimistic update hook with rollback
│       ├── components/
│       │   ├── common/        # Reusable UI widgets
│       │   │   ├── Navbar.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── ConfirmDialog.jsx
│       │   │   ├── ProgressBar.jsx
│       │   │   ├── CountdownBadge.jsx
│       │   │   ├── EmptyState.jsx
│       │   │   ├── SkeletonCard.jsx
│       │   │   └── ToastContainer.jsx
│       │   ├── exams/         # Exam cards and form dialogs
│       │   │   ├── ExamCard.jsx
│       │   │   └── ExamFormModal.jsx
│       │   └── tasks/         # Task items, filters, and form dialogs
│       │       ├── TaskItem.jsx
│       │       ├── TaskFormModal.jsx
│       │       └── TaskFilters.jsx
│       ├── pages/             # Route views
│       │   ├── DashboardPage.jsx
│       │   ├── ExamsPage.jsx
│       │   ├── ExamDetailPage.jsx
│       │   ├── PlannerPage.jsx
│       │   ├── TasksPage.jsx
│       │   └── NotFoundPage.jsx
│       ├── utils/             # Date formatting & days countdown helpers
│       │   └── dateUtils.js
│       ├── index.css          # Design system & responsive styles
│       ├── App.jsx            # Layout shell & routing tree
│       └── main.jsx           # React DOM root & QueryClient provider
│
└── server/                    # Node.js + Express Backend
    ├── package.json           # Backend dependencies, Jest, Nodemon
    ├── jest.config.js         # ES Modules Jest test configuration
    ├── .env.example           # Server environment template
    ├── .env                   # Server local environment configuration
    ├── prisma/
    │   ├── schema.prisma      # Prisma schema (Exam, StudyTask models)
    │   ├── migrations/        # SQL migrations including CHECK constraint
    │   │   └── 20261026043245_init/
    │   │       └── migration.sql
    │   └── seed.js            # Realistic college sample seed data
    ├── scripts/
    │   └── verify-db.js       # Database connection & constraint checker
    ├── tests/
    │   └── api.test.js        # 20 automated tests covering APIs & DB constraints
    └── src/
        ├── controllers/       # HTTP request handlers
        │   ├── examController.js
        │   ├── taskController.js
        │   └── dashboardController.js
        ├── services/          # Business logic & progress calculations
        │   ├── examService.js
        │   ├── taskService.js
        │   └── dashboardService.js
        ├── validators/        # express-validator schemas
        │   ├── examValidator.js
        │   └── taskValidator.js
        ├── middleware/        # Error & validation middleware
        │   ├── validate.js
        │   ├── errorHandler.js
        │   └── notFoundHandler.js
        ├── utils/             # Helpers for dates and API responses
        │   ├── dateUtils.js
        │   └── response.js
        ├── prisma.js          # Prisma Client singleton
        ├── app.js             # Express app setup & route mounting
        └── server.js          # Server entry point & graceful shutdown
```

---

## 8. Installation & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20+)
- [npm](https://www.npmjs.com/) (v9+)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)

### Step 1: Clone the Repository
```bash
git clone https://github.com/prave4840/exam-preparation-planner.git
cd exam-preparation-planner
```

### Step 2: Configure Environment Variables

1. **Backend Environment** (`server/.env`):
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/examready?schema=public"
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```
   *(Replace `your_password` with your local PostgreSQL password. Note: special characters like `@` must be URL-encoded as `%40`).*

2. **Frontend Environment** (`client/.env`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Step 3: Install Dependencies
From the project root:
```bash
npm run install:all
```
*Or install individually:*
```bash
cd server && npm install
cd ../client && npm install
```

### Step 4: Run Migrations and Seed Database
In the `server` directory:
```bash
cd server

# Apply database migration (creates tables, indexes, and CHECK constraint)
npx prisma migrate deploy

# Seed realistic sample exams and tasks
node prisma/seed.js
```

Verify database health:
```bash
node scripts/verify-db.js
```

### Step 5: Start the Development Servers

In terminal 1 (Backend API on `http://localhost:5000`):
```bash
cd server
npm run dev
```

In terminal 2 (Frontend Client on `http://localhost:5173`):
```bash
cd client
npm run dev
```

Open your browser and navigate to: **`http://localhost:5173`**

---

## 9. Automated Testing & Verification

The project includes an automated test suite verifying CRUD operations, business logic, constraints, and error scenarios.

### Running the Automated Tests
From the `server` directory:
```bash
cd server
npm test
```

### Test Coverage Summary (20 Automated Tests)
- `Health Check API`: `GET /api/health` returns status healthy.
- `Exam Validation`: Rejects empty subject names; rejects past exam dates.
- `Exam Creation`: Creates exam with initial 0% progress.
- `Unique Constraints`: Rejects duplicate exams (`subject + examDate`) with `409 Conflict`.
- `Exam Retrieval`: Returns calculated `daysRemaining`, `totalTasks`, `completedTasks`, and `progress`.
- `404 Handling`: Returns `404 Not Found` for nonexistent exams and tasks.
- `Task Duration Validation`: Rejects study durations under 15 minutes and over 480 minutes.
- `Task Date Validation`: Rejects planned task dates that fall after the associated exam date.
- `Task Unique Constraint`: Rejects duplicate task titles within the same exam (`409 Conflict`).
- `Task Completion & Progress`: Updating `done: true` updates preparation percentage (1/1 completed = 100%).
- `Cascading Deletion`: Deleting an exam automatically deletes all associated study tasks from PostgreSQL.
- `Native PostgreSQL CHECK Constraint`: Direct database bypass query violating `minutes >= 15 AND minutes <= 480` is rejected with SQL error `23514`.
- `Dashboard Analytics`: Verifies aggregated statistics, nearest target exam, and today's tasks.

---

## 10. Git Workflow & GitHub Instructions

To commit and push this project to GitHub:

### 1. Initialize Git Repository
```bash
git init
```

### 2. Verify `.gitignore`
Make sure `.env` files and `node_modules` are excluded:
```bash
git status
```

### 3. Stage and Commit
```bash
git add .
git commit -m "feat: complete full-stack ExamReady preparation planner with PostgreSQL, Prisma, Express, and React"
```

### 4. Create Repository on GitHub & Push
```bash
git branch -M main
git remote add origin https://github.com/prave4840/exam-preparation-planner.git
git push -u origin main
```

---

## 11. Deployment Guide (Render, Neon & Vercel)

### Deploying the Frontend on Vercel
Deploy the React + Vite frontend client separately on Vercel while connecting to your Render backend:

1. **Sign in to Vercel**: Go to [vercel.com](https://vercel.com/) and sign in with GitHub.
2. **Import Project**: Click **Add New...** > **Project** and select `prave4840/exam-preparation-planner`.
3. **Configure Project Settings**:
   - **Framework Preset**: `Vite` *(auto-detected)*
   - **Root Directory**: Click **Edit** and choose `client` *(very important)*
   - **Build Command**: `npm run build` *(default)*
   - **Output Directory**: `dist` *(default)*
4. **Environment Variables**:
   Add the following environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://<your-render-service-name>.onrender.com/api` *(replace with your actual Render service URL, ensure `/api` is at the end)*
5. **Deploy**: Click **Deploy**. Vercel will build the frontend and provide your live production URL (e.g., `https://exam-preparation-planner.vercel.app`).
6. **Update Render CORS (Optional & Recommended)**:
   In your Render dashboard for the server web service, add or update the `CLIENT_URL` environment variable with your new Vercel domain:
   - `CLIENT_URL`: `https://exam-preparation-planner.vercel.app`

---

### Deploying Backend on Render & Neon DB (Reference)
Deploy both the React frontend and Express backend from the same repository root as a single Web Service on Render.

1. **Connect Repository**: In [Render Dashboard](https://dashboard.render.com/), click **New +** > **Web Service** and choose `prave4840/exam-preparation-planner`.
2. **Configure Settings**:
   - **Name**: `exam-preparation-planner`
   - **Environment**: `Node`
   - **Root Directory**: *(leave blank)*
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. **Environment Variables**:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string (e.g. `postgresql://user:pass@ep-xyz.neon.tech/examready?sslmode=require`)
   - `NODE_ENV`: `production`
4. **Deploy**: Click **Create Web Service**. Both the client and server build automatically, and Express serves the React UI at the root domain while routing `/api/*` to the REST endpoints.

---

### Option B: Backend-Only Service (API on Render)
If deploying the backend with **Root Directory** set to `server`:

1. **Configure Settings**:
   - **Root Directory**: `server`
   - **Build Command**: `npm run build` *(runs `prisma generate`)*
   - **Start Command**: `npm start` *(runs `node src/server.js`)*
2. **Environment Variables**:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: Your frontend URL (e.g. `https://examready.vercel.app`)

---

## 🎓 Academic Micro-Project Notes
This application satisfies the academic criteria for full-stack web development:
- **Client-Side Architecture**: Reusable functional components, custom hooks, React Router navigation, TanStack Query caching, and optimistic UI rollback.
- **Server-Side Architecture**: Layered structure with routes, controllers, services, input validation, and centralized error handling.
- **Relational Database Concepts**: Primary/Foreign key relationships, cascading deletes, composite unique indexes, native CHECK constraints, and automated migrations via Prisma ORM.
