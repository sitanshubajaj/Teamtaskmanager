# Team Task Manager - Enterprise Grade Application

![Project Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/Frontend-React.js%20%2B%20Vite-blue)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![DB](https://img.shields.io/badge/Database-MongoDB%20Atlas-brightgreen)

## 📖 Project Overview
Team Task Manager is an enterprise-grade, highly scalable full-stack web application designed for engineering teams to manage projects and track tasks efficiently. Built with modern web development practices, it features robust role-based access control, real-time updates, advanced security measures, and a premium UI experience.

---

## 🚀 Live Demo & Credentials

**Live Demo URL:**[Click Here](https://team-task-manager-6200.up.railway.app)

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@teamtask.com | Password123! |
| Member| member@teamtask.com| Password123! |

---

## ✨ Enterprise Features

### 🔐 Advanced Security & Auth
- **JWT Refresh Token Rotation:** Prevents token theft using secure, HTTP-only cookie-based refresh tokens with reuse detection.
- **Role-Based Access Control (RBAC):** Strict permissions dividing Admins (global mutate access) and Members (resource-based access).
- **Protection Middlewares:** `Helmet`, `CORS`, `express-rate-limit`, `express-mongo-sanitize`, and `xss-clean` to mitigate common OWASP vulnerabilities.
- **Input Validation:** Strict payload validation using **Zod**.

### ⚡ Backend Architecture (Clean & Modular)
- **Service Layer Pattern:** Clean separation of business logic from HTTP request handling.
- **Centralized Error Handling:** Custom `AppError` class and global error interceptor for consistent `{ success, error, message }` JSON responses.
- **Activity Logging (Audit Trail):** Every critical action is recorded in an `ActivityLog` collection.
- **Database Optimization:** Strategic use of MongoDB **Compound Indexes** and native **Aggregation Pipelines** for lightning-fast dashboard analytics. Uses `.lean()` for high-volume read queries.

### 🎨 Premium Frontend UX
- **State Management:** **Redux Toolkit** and **RTK Query** for efficient API caching, optimistic updates, and global state.
- **Drag-and-Drop Kanban Board:** Powered by `@hello-pangea/dnd` for smooth, interactive task management.
- **Resilience:** React **Error Boundaries** to prevent full-app crashes.
- **Dynamic UI:** Loading skeletons, React Hot Toasts, and pure Vanilla CSS (with CSS tokens) for a highly customized, premium look.

### 🔄 Real-Time System
- **Socket.io** integration for instant, real-time broadcasts of task status changes to active team members.

---

## 🏗️ Folder Structure

```text
/
├── backend/
│   ├── config/          # Environment, Logger, Database configs
│   ├── controllers/     # Request handlers (Express layer)
│   ├── middleware/      # Auth guards, Zod validators, Error interceptors
│   ├── models/          # Mongoose Schemas (User, Project, Task, ActivityLog)
│   ├── routes/          # Express API Routers
│   ├── services/        # Core business logic
│   ├── utils/           # Custom AppError, token generators
│   └── tests/           # Jest integration tests
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI (Skeletons, ErrorBoundaries)
    │   ├── features/    # Redux slices & RTK Query APIs
    │   ├── layouts/     # Dashboard and Auth wrappers
    │   ├── pages/       # Route components
    │   └── store.js     # Redux store configuration
```

---

## 📚 API Documentation

Base URL: `/api/v1`

### Authentication (`/auth`)
- `POST /register` - Register a new user
- `POST /login` - Authenticate and receive tokens
- `POST /refresh` - Rotate refresh token (Requires HTTP-Only Cookie)
- `POST /logout` - Revoke current session
- `POST /logoutAll` - Revoke all sessions across devices (Security feature)

### Projects (`/projects`)
- `GET /` - List projects (Admin sees all; Member sees assigned)
- `POST /` - Create project (Admin only)
- `PATCH /:id` - Update project details (Admin only)
- `POST /:id/members` - Assign user to project (Admin only)

### Tasks (`/tasks`)
- `GET /` - List tasks with pagination & filtering (`?status=Pending&sort=-deadline`)
- `POST /` - Create task
- `PATCH /:id` - Update task (Members can only update status)
- `DELETE /:id` - Delete task (Admin only)

### Analytics (`/dashboard`)
- `GET /stats` - Aggregated metrics (Total counts, 7-day trends, priority distribution)

---

## 🚀 Setup & Installation (Local Development)

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (or local MongoDB instance)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup
```bash
cd backend
npm install
```
- Copy `.env.example` to `.env` and configure your `MONGO_URI` and `JWT` secrets.
- Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal tab:
```bash
cd frontend
npm install
npm run dev
```
The application will be running at `http://localhost:5173`.

---

