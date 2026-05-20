# Hinge Question Generator — Skill Guide

## Project Overview

A web application for teachers to generate diagnostic "Hinge Questions" using AI, collect student responses, and analyze understanding through diagnostic reports with misconception mapping.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Backend | Node.js + Express 5 |
| Database | SQLite via Prisma ORM |
| Auth | JWT (bcrypt + jsonwebtoken) |
| AI | Opencode Zen API (OpenAI-compatible) |
| Model | deepseek-v4-flash-free |

---

## Architecture

```
playground/
├── client/                  # React frontend (Vite, port 5173+)
│   └── src/
│       ├── pages/           # Page components
│       ├── components/      # Shared components
│       ├── hooks/           # Custom React hooks
│       └── lib/             # API client
├── server/                  # Express backend (port 3001)
│   ├── prisma/              # Database schema + migrations
│   └── src/
│       ├── routes/          # API route handlers
│       ├── services/        # AI + analysis logic
│       ├── middleware/       # JWT auth
│       └── db/              # Prisma client
└── package.json             # Root workspace (concurrently)
```

---

## Database Schema

### Users
- `id` (UUID), `email` (unique), `password` (hashed), `name`, `role` (teacher/student)

### Questions
- `id` (UUID), `teacherId`, `topic`, `subtopic`, `stem`
- Has many `Options`

### Options
- `id` (UUID), `questionId`, `text`, `isCorrect` (boolean), `misconception` (string, null for correct answer)

### QuizSessions
- `id` (UUID), `teacherId`, `title`, `topic`, `code` (unique, 6-char), `status` (active/closed)

### Responses
- `id` (UUID), `sessionId`, `questionId`, `studentId` (optional), `studentName`, `selectedOptionId`, `entryMode` (in-app/manual)

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Create teacher account |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/me | Yes | Get current user |

### Questions
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/questions/generate | Yes | AI-generate questions |
| POST | /api/questions | Yes | Save questions to DB |
| GET | /api/questions | Yes | List teacher's questions |
| PUT | /api/questions/:id | Yes | Update a question |
| DELETE | /api/questions/:id | Yes | Delete a question |

### Sessions
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/sessions | Yes | Create quiz session |
| GET | /api/sessions | Yes | List teacher's sessions |
| GET | /api/sessions/code/:code | No | Get session by code (student) |
| GET | /api/sessions/:id | Yes | Get session by ID (teacher) |
| PATCH | /api/sessions/:id/close | Yes | Close a session |

### Responses
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/responses | No | Submit student response |
| POST | /api/responses/manual | Yes | Bulk manual entry |
| GET | /api/responses/session/:id | Yes | Get session responses |

### Reports
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/reports/:sessionId | Yes | Get diagnostic report |
| GET | /api/reports/:sessionId/export | Yes | Export CSV |

---

## Key Features

### 1. AI Question Generation
- Teacher enters topic, subtopic, grade level, count
- AI generates questions with 4 options each
- Each distractor has a labeled misconception
- Teacher can edit question stem, option text, and misconception labels
- Questions saved to teacher's question bank

### 1b. Manual Question Creation
- Rich text editor with formatting toolbar (bold, italic, underline, lists)
- **Equation support**: Insert LaTeX equations (inline or block) with live preview
- **Image support**: Upload images or paste from clipboard (max 2MB, stored as base64)
- Mark any option as correct by clicking its letter
- Add misconception labels for each distractor
- Preview mode to see final question appearance
- Batch creation: add multiple questions, then save all at once
- Questions stored as HTML (rendered everywhere with equations and images)

### 2. Quiz Sessions
- Teacher selects questions and creates a session
- System generates a 6-character join code
- Students join via `/join/:code` (no login required)
- Students enter name, answer questions one by one
- Progress bar tracks completion

### 3. Manual Response Entry
- Teacher enters student names and selected answers
- Useful for paper-based assessments
- Bulk submission (one student at a time)

### 4. Diagnostic Reports
- **Overall score**: % correct across all questions
- **Question performance**: Bar chart per question
- **Misconception map**: Ranked list of misconceptions with frequency
- **Detailed breakdown**: Per-question option distribution with misconception labels
- **AI recommendations**: Reteaching strategies based on findings
- **CSV export**: Downloadable spreadsheet

### 5. Session Management
- Close sessions to stop accepting responses
- Students see "Session Closed" message
- Closed sessions show "closed" status on dashboard

---

## User Roles

### Teacher
- Register/login with email/password
- Generate questions with AI
- Manage question bank
- Create and manage quiz sessions
- View diagnostic reports
- Enter responses manually
- Export data

### Student
- No account needed
- Join via 6-character code
- Enter name to start
- Answer questions sequentially
- See completion confirmation

---

## Environment Variables

Set in `server/.env`:

```env
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://opencode.ai/zen/v1
OPENAI_MODEL=deepseek-v4-flash-free
```

---

## Running the App

```bash
# Install dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Set up database
cd server && npx prisma migrate dev --name init && cd ..

# Run both servers
npm run dev
```

- Client: http://localhost:5173 (or next available port)
- Server: http://localhost:3001

---

## File Reference

### Frontend Pages
| File | Route | Purpose |
|------|-------|---------|
| Login.tsx | /login | Teacher login |
| Register.tsx | /register | Teacher registration |
| Dashboard.tsx | / | Overview + session list + close button |
| GenerateQuestions.tsx | /generate | AI generation + full editor |
| CreateQuestionManual.tsx | /create-question | Manual creation with rich text, equations, images |
| ManageQuestions.tsx | /questions | Question bank (filter, edit, delete) |
| CreateSession.tsx | /session/new | Select questions, get join code |
| StudentView.tsx | /join/:code | Student quiz experience |
| ManualEntry.tsx | /session/:id/manual | Teacher manual entry |
| DiagnosticReport.tsx | /report/:sessionId | Charts + analysis + recommendations |

### Backend Services
| File | Purpose |
|------|---------|
| services/ai.ts | OpenAI-compatible API calls, question generation, recommendations |
| services/analysis.ts | Response aggregation, misconception mapping, report generation |
| middleware/auth.ts | JWT generation and verification |

---

## Common Tasks

### Add a new question type
1. Update the AI prompt in `server/src/services/ai.ts`
2. Update the Prisma schema if new fields needed
3. Run `npx prisma migrate dev`
4. Update the display in `GenerateQuestions.tsx`

### Change the AI model
1. Edit `server/.env` — change `OPENAI_MODEL`
2. Restart the server

### Change the API provider
1. Edit `server/.env` — change `OPENAI_BASE_URL` and `OPENAI_API_KEY`
2. Restart the server

### Add a new report metric
1. Update `server/src/services/analysis.ts` — add computation
2. Update `client/src/pages/DiagnosticReport.tsx` — add visualization
