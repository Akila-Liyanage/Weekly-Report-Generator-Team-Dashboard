# WeeklyHub — Weekly Reports, Team Dashboard, and Simple Task Assignments

WeeklyHub is a clean MERN stack application built for a Software Engineering Internship technical assignment. Team members submit fixed-format weekly reports. Managers review team progress, read full report details, search reports, view each member individually, and assign small tasks to specific members.

The AI assistant is intentionally not included because it is an optional bonus feature. The project focuses on complete, explainable core functionality and clean code structure.

## Main Features

### Team Member
- Register, login, and logout
- Create one weekly report per week
- Save a report as a draft
- Edit and submit reports
- View full report details
- View personal report history
- View tasks assigned by the manager
- Update assigned task status: To do, In progress, Done

### Manager
- View weekly summary metrics and charts
- See submitted, pending, and late member statuses
- Search report content by member, project, completed work, blocker text, or notes
- Filter reports by week, member, project, and status
- Click any report to view full completed work, next plans, blockers, hours, and notes
- View team members individually with report history and assigned tasks
- Assign, edit, delete, and track simple tasks for specific team members
- Add, edit, archive, and delete projects/categories

## What “Blockers” Means

A blocker is a problem, dependency, missing access, unresolved error, or delay that stopped or slowed a team member's work. The report details modal displays the actual blocker text, not only a blocker count.

## Technology Stack

- Frontend: React, Vite, React Router, Axios, Recharts, Lucide Icons, plain CSS
- Backend: Node.js, Express.js, Mongoose, JWT, bcrypt
- Database: MongoDB or MongoDB Atlas

## Clean Folder Structure

```text
WeeklyHub-MERN/
├── backend/
│   ├── src/
│   │   ├── config/        # Database connection
│   │   ├── controllers/   # Request/response handling
│   │   ├── middleware/    # Auth, roles, validation, errors
│   │   ├── models/        # User, Project, Report, Task
│   │   ├── routes/        # REST API routes   
│   │   ├── services/      # Dashboard, team, report business logic
│   │   └── utils/         # Shared helpers
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios client
│   │   ├── components/    # Reusable modal, cards, badges, layout
│   │   ├── context/       # Authentication state
│   │   ├── pages/         # Dashboard, reports, tasks, team, projects
│   │   ├── styles/        # Plain CSS design system
│   │   └── utils/         # Shared date/text formatting
│   └── .env
└── docs/
    ├── ER_DIAGRAM.png
    ├── ER_DIAGRAM.md
    └── CODE_EXPLANATION_SINHALA.md
```

## Setup Instructions

### Requirements
- Node.js 18 or newer
- npm
- MongoDB Community Server or MongoDB Atlas

### 1. Backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and update the values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/weeklyhub
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
```

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

## Demo Accounts

### Manager
- Email: `manager@weeklyhub.dev`
- Password: `Manager123!`

### Team Member
- Email: `akila@weeklyhub.dev`
- Password: `Member123!`

Other seeded team members also use `Member123!`.

## Main API Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/reports/my` | Team Member | Own report history |
| POST | `/api/reports` | Team Member | Create report |
| PUT | `/api/reports/:id` | Team Member | Edit own report |
| PATCH | `/api/reports/:id/submit` | Team Member | Submit report |
| GET | `/api/reports/team` | Manager | Search/filter team reports |
| GET | `/api/dashboard` | Manager | Metrics and chart data |
| GET | `/api/users/team/overview` | Manager | Individual member summaries |
| GET | `/api/users/team/:id` | Manager | Member reports and tasks |
| GET | `/api/tasks` | Both roles | Manager: all tasks; member: own tasks |
| POST | `/api/tasks` | Manager | Assign task |
| PUT | `/api/tasks/:id` | Manager | Edit task |
| PATCH | `/api/tasks/:id/status` | Both roles | Update task status |
| DELETE | `/api/tasks/:id` | Manager | Delete task |
| GET/POST/PUT/DELETE | `/api/projects` | Role based | Manage projects |

## Simple System Flow

### Weekly report flow
1. A team member fills the fixed report form.
2. The backend validates the dates, project, completed work, and next plans.
3. The report is stored as Draft or Submitted.
4. The manager searches or filters reports.
5. Clicking View report opens all report details, including the actual blocker text.

### Task assignment flow
1. The manager opens Tasks and clicks Assign task.
2. The manager selects one member, one project, a due date, and priority.
3. The assigned member sees the task under My Tasks.
4. The member changes the status to To do, In progress, or Done.
5. The manager sees the updated status.

### Individual team member flow
1. The manager opens Team.
2. Each member appears as a separate card.
3. The manager clicks View individual activity.
4. The system displays that member's reports, blocker count, and assigned tasks.

## Important Design Decisions

- WeeklyHub remains mainly a weekly reporting system, not a large Jira-style task manager.
- Task assignment is deliberately lightweight and easy to explain.
- One report per user per week is enforced using a MongoDB unique index.
- Report fields remain fixed and consistent across the team.
- Projects used by reports are archived instead of permanently removed.
- Shared UI components are used for modals, report details, task cards, status badges, headers, loading, and empty states.
- Shared date and text helper functions reduce duplicate code.

## Validation Performed

- Frontend production build passes with `npm run build`.
- All backend JavaScript files pass `node --check`.
- Dependencies install with zero reported vulnerabilities at the time of validation.
- Seed data includes users, projects, current/historical reports, and assigned tasks.
#

