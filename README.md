<div align="center">

# 🚀 TaskFlow — Full-Stack Task Management System

**A production-ready, full-stack task management application built with FastAPI & React**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Click_Here-00C853?style=for-the-badge)](https://taskmanagement-frontend-6p1k.onrender.com)
[![API Docs](https://img.shields.io/badge/📄_API_Docs-Swagger_UI-FF6F00?style=for-the-badge)](https://taskmanegmentapp.onrender.com/docs)
[![GitHub](https://img.shields.io/badge/📂_Source_Code-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/SWARAJNB/TaskManegmentApp)

![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?logo=render&logoColor=white)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Links](#-live-links)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Authentication Flow](#-authentication-flow)
- [Getting Started](#-getting-started)
- [Docker Setup](#-docker-setup)
- [Deployment (Render)](#-deployment-render)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [Development Process](#-development-process)
- [License](#-license)

---

## 🌟 Overview

**TaskFlow** is a complete, production-grade task management system designed to help individuals and teams organize, track, and manage their tasks efficiently. It features a modern **3D animated UI**, real-time updates via **WebSocket**, comprehensive **analytics dashboard**, and secure **JWT authentication** — all deployed on the cloud.

This project demonstrates **end-to-end full-stack development**, from database design and RESTful API creation to responsive frontend implementation and cloud deployment.

---

## 🌐 Live Links

| Resource | URL |
|----------|-----|
| 🖥️ **Live App (Frontend)** | [taskmanagement-frontend-6p1k.onrender.com](https://taskmanagement-frontend-6p1k.onrender.com) |
| ⚙️ **Backend API** | [taskmanegmentapp.onrender.com](https://taskmanegmentapp.onrender.com) |
| 📄 **API Documentation (Swagger)** | [taskmanegmentapp.onrender.com/docs](https://taskmanegmentapp.onrender.com/docs) |
| 📦 **GitHub Repository** | [github.com/SWARAJNB/TaskManegmentApp](https://github.com/SWARAJNB/TaskManegmentApp) |

> ⚠️ **Note:** The app runs on Render's free tier, so the first request may take **~50 seconds** while the server wakes up from inactivity.

---

## ✨ Features

### 🔐 Authentication & Security
- **User Registration** with email, full name, mobile number & password
- **JWT Token-based Authentication** (OAuth2 Password Bearer)
- **Password Hashing** using bcrypt
- **Forgot Password** flow with OTP verification (console-based for demo)
- **Protected Routes** — only authenticated users access the dashboard

### 📋 Task Management
- **CRUD Operations** — Create, Read, Update, Delete tasks
- **Task Prioritization** — Low, Medium, High priority levels
- **Task Status Tracking** — Todo, In Progress, Done
- **Due Date Management** — Set and track deadlines
- **Time Tracking** — Log hours spent on each task
- **Search & Filter** — Find tasks by title or filter by status
- **CSV Export** — Download all tasks as a CSV file

### 💬 Collaboration
- **Comments System** — Add, edit, delete comments on tasks
- **File Attachments** — Upload, download, delete files on tasks
- **Real-time Updates** — WebSocket-powered live notifications

### 📊 Analytics Dashboard
- **Task Completion Rate** — Percentage visualization
- **Daily/Weekly/Monthly Activity Charts** — Powered by Recharts
- **Priority & Status Breakdown** — Pie charts
- **Average Completion Time** — Performance tracking
- **Current Streak** — Consecutive active days counter

### 👤 User Profile
- **Profile Image Upload** — Avatar with drag-and-drop
- **Edit Profile** — Update name, email, mobile number
- **Change Password** — In-app password update
- **Performance Stats** — Personal task analytics

### 🎨 UI/UX
- **3D Animated Login/Register Cards** — Mouse-follow tilt effect
- **Modern Landing Page** — Glassmorphism & gradient design
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Slide-up Animations** — Staggered entry animations on all pages
- **Dark Theme** — Premium dark mode UI with cyan accents
- **AI Chatbot Component** — Built-in chat assistance

### 📧 Notifications
- **Email Notifications** (simulated) — Task creation & status changes
- **Background Tasks** — Non-blocking notification processing

---

## 🏗 Architecture

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    React + TypeScript                        │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │ │
│  │  │  Pages   │ │Components│ │ Context  │ │  API Client   │  │ │
│  │  │          │ │          │ │          │ │  (Axios)      │  │ │
│  │  │• Landing │ │• Layout  │ │• Auth    │ │               │  │ │
│  │  │• Login   │ │• TaskForm│ │• WebSocket│ │  baseURL:     │  │ │
│  │  │• Register│ │• ChatBot │ │          │ │  VITE_API_URL │  │ │
│  │  │• Home    │ │• Badge   │ │          │ │               │  │ │
│  │  │• Dashboard│ │• Loading │ │          │ │               │  │ │
│  │  │• Tasks   │ │• Private │ │          │ │               │  │ │
│  │  │• Profile │ │  Route   │ │          │ │               │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────┬───────┘  │ │
│  └─────────────────────────────────────────────────┼───────────┘ │
└────────────────────────────────────────────────────┼─────────────┘
                     HTTPS / WSS                     │
┌────────────────────────────────────────────────────┼─────────────┐
│                 BACKEND (FastAPI)                   │             │
│  ┌─────────────────────────────────────────────────┼───────────┐ │
│  │                   main.py (App)                  │           │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐│           │ │
│  │  │  Routes  │ │Middleware│ │   WebSocket       ││           │ │
│  │  │          │ │          │ │   Manager         ││           │ │
│  │  │ /token   │ │• CORS    │ │                   ││           │ │
│  │  │ /users   │ │          │ │ • Real-time       ││           │ │
│  │  │ /tasks   │ │          │ │   broadcasts      ││           │ │
│  │  │ /comments│ │          │ │ • Connection      ││           │ │
│  │  │ /attach  │ │          │ │   pooling         ││           │ │
│  │  │ /auth    │ │          │ │                   ││           │ │
│  │  └────┬─────┘ └──────────┘ └──────────────────┘│           │ │
│  │       │                                         │           │ │
│  │  ┌────┴─────┐ ┌──────────┐ ┌──────────┐        │           │ │
│  │  │  crud.py │ │  auth.py │ │schemas.py│        │           │ │
│  │  │          │ │          │ │          │        │           │ │
│  │  │ DB CRUD  │ │ JWT Auth │ │ Pydantic │        │           │ │
│  │  │ Queries  │ │ Bcrypt   │ │ Models   │        │           │ │
│  │  └────┬─────┘ └──────────┘ └──────────┘        │           │ │
│  │       │                                         │           │ │
│  │  ┌────┴─────┐ ┌──────────┐                      │           │ │
│  │  │models.py │ │database.py│                     │           │ │
│  │  │          │ │           │                     │           │ │
│  │  │SQLAlchemy│ │Engine +   │                     │           │ │
│  │  │  ORM     │ │Session    │                     │           │ │
│  │  └──────────┘ └─────┬─────┘                     │           │ │
│  └─────────────────────┼───────────────────────────┘           │ │
└────────────────────────┼───────────────────────────────────────┘ │
                         │                                         
┌────────────────────────┼─────────────────────────────────────────┐
│              DATABASE (PostgreSQL 15)                             │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────────┐           │
│  │  users  │ │  tasks  │ │ comments │ │ attachments  │           │
│  └─────────┘ └─────────┘ └──────────┘ └─────────────┘           │
└──────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
User Action → React Component → Axios API Client → FastAPI Router
    → Dependency Injection (Auth + DB Session)
    → CRUD Operation → SQLAlchemy ORM → PostgreSQL
    → Response Schema (Pydantic) → JSON Response → React State Update
```

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Python 3.11** | Core programming language |
| **FastAPI** | High-performance async web framework |
| **SQLAlchemy** | ORM for database operations |
| **Pydantic** | Data validation & serialization |
| **PostgreSQL 15** | Production database |
| **SQLite** | Local development database (auto-fallback) |
| **JWT (python-jose)** | Token-based authentication |
| **Passlib + Bcrypt** | Password hashing |
| **Uvicorn** | ASGI server |
| **WebSockets** | Real-time communication |
| **python-multipart** | File upload handling |
| **python-dotenv** | Environment variable management |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI library |
| **TypeScript** | Type-safe JavaScript |
| **Vite 5** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client |
| **Recharts** | Data visualization / charts |
| **Lucide React** | Modern icon library |
| **React Markdown** | Markdown rendering |
| **CSS3** | Custom styling (no framework) |

### DevOps & Deployment
| Technology | Purpose |
|-----------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Render** | Cloud hosting (Backend + Frontend + Database) |
| **GitHub** | Source code management |
| **GitHub Actions** | CI/CD pipeline |

---

## 📁 Project Structure

```
TaskManegmentApp/
├── 📂 backend/                    # Python FastAPI Backend
│   ├── main.py                    # App entry point, routes, CORS, WebSocket
│   ├── database.py                # DB engine, session, PostgreSQL/SQLite config
│   ├── models.py                  # SQLAlchemy ORM models (User, Task, Comment, Attachment)
│   ├── schemas.py                 # Pydantic validation schemas
│   ├── crud.py                    # Database CRUD operations & analytics
│   ├── auth.py                    # JWT auth, password hashing, token verification
│   ├── requirements.txt           # Python dependencies
│   ├── Dockerfile                 # Backend Docker image
│   ├── migrate_to_postgres.py     # SQLite → PostgreSQL migration script
│   └── uploads/                   # File uploads & avatars storage
│
├── 📂 frontend/                   # React TypeScript Frontend
│   ├── 📂 src/
│   │   ├── App.tsx                # Root component with routing
│   │   ├── main.tsx               # App entry point
│   │   ├── index.css              # Global styles, design tokens, animations
│   │   ├── types.ts               # TypeScript type definitions
│   │   ├── 📂 api/
│   │   │   └── client.ts          # Axios instance with JWT interceptor
│   │   ├── 📂 context/
│   │   │   ├── AuthContext.tsx     # Authentication state management
│   │   │   └── WebSocketContext.tsx # Real-time WebSocket connection
│   │   ├── 📂 components/
│   │   │   ├── Layout.tsx         # App shell (sidebar, navbar, footer)
│   │   │   ├── PrivateRoute.tsx   # Auth-protected route wrapper
│   │   │   ├── TaskForm.tsx       # Create/edit task modal
│   │   │   ├── ChatBot.tsx        # AI chatbot assistant
│   │   │   ├── Badge.tsx          # Status/priority badges
│   │   │   ├── Loading.tsx        # Loading spinner
│   │   │   ├── EmptyState.tsx     # Empty list placeholder
│   │   │   └── ConfirmationModal.tsx # Delete confirmation dialog
│   │   └── 📂 pages/
│   │       ├── Landing.tsx        # Public landing page
│   │       ├── Login.tsx          # 3D animated login form
│   │       ├── Register.tsx       # 3D animated registration form
│   │       ├── ForgotPassword.tsx # OTP-based password reset
│   │       ├── ResetPassword.tsx  # New password entry
│   │       ├── Home.tsx           # Home overview page
│   │       ├── Dashboard.tsx      # Analytics & performance charts
│   │       ├── TaskManagement.tsx # Task list with filters & search
│   │       ├── TaskDetail.tsx     # Single task view (comments, attachments)
│   │       └── Profile.tsx        # User profile & avatar upload
│   ├── .env.production            # Production API URL
│   ├── Dockerfile                 # Production frontend Docker image
│   ├── Dockerfile.dev             # Development frontend Docker image
│   ├── package.json               # NPM dependencies
│   └── tsconfig.json              # TypeScript configuration
│
├── docker-compose.yml             # Multi-service Docker orchestration
├── render.yaml                    # Render deployment configuration
├── run_project.bat                # Windows local development launcher
├── .gitignore                     # Git ignored files
└── README.md                      # This file
```

---

## 🗄 Database Schema

```
┌──────────────────────┐       ┌──────────────────────────┐
│       USERS           │       │          TASKS            │
├──────────────────────┤       ├──────────────────────────┤
│ id (PK)              │──┐    │ id (PK)                  │
│ email (unique)       │  │    │ title                    │
│ hashed_password      │  │    │ description              │
│ full_name            │  │    │ status (enum)            │
│ is_active            │  │    │ priority (enum)          │
│ mobile_number        │  │    │ due_date                 │
│ profile_image        │  │    │ time_spent               │
│ reset_token          │  │    │ created_at               │
└──────────────────────┘  ├───→│ owner_id (FK → users.id) │
                          │    └──────────┬───────────────┘
                          │               │
                          │    ┌──────────┴───────────────┐
                          │    │       COMMENTS            │
                          │    ├──────────────────────────┤
                          │    │ id (PK)                  │
                          │    │ content                  │
                          │    │ created_at               │
                          │    │ task_id (FK → tasks.id)  │
                          └───→│ author_id (FK → users.id)│
                               └──────────────────────────┘

                               ┌──────────────────────────┐
                               │      ATTACHMENTS          │
                               ├──────────────────────────┤
                               │ id (PK)                  │
                               │ filename                 │
                               │ file_path                │
                               │ uploaded_at               │
                               │ task_id (FK → tasks.id)  │
                               └──────────────────────────┘
```

### Enums
- **TaskStatus:** `todo` | `in_progress` | `done`
- **TaskPriority:** `low` | `medium` | `high`

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/token` | Login & get JWT access token |
| `POST` | `/users/` | Register new user |
| `GET` | `/users/me/` | Get current user profile |
| `PUT` | `/users/me/` | Update user profile |
| `POST` | `/users/me/avatar` | Upload profile image |
| `GET` | `/users/performance` | Get user performance stats |

### Password Reset
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/forgot-password` | Send OTP to email |
| `POST` | `/auth/reset-password` | Reset password with OTP |
| `POST` | `/auth/send-otp` | Send mobile OTP |
| `POST` | `/auth/verify-otp` | Verify mobile OTP |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/tasks/` | Create a new task |
| `GET` | `/tasks/` | List tasks (filter by status, search) |
| `GET` | `/tasks/{id}` | Get single task details |
| `PUT` | `/tasks/{id}` | Update a task |
| `DELETE` | `/tasks/{id}` | Delete a task |
| `GET` | `/tasks/export` | Export tasks as CSV |
| `GET` | `/tasks/analytics/` | Get analytics (day/week/month) |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/tasks/{id}/comments/` | Add comment to task |
| `PUT` | `/comments/{id}` | Edit a comment |
| `DELETE` | `/comments/{id}` | Delete a comment |

### Attachments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/tasks/{id}/attachments/` | Upload file to task |
| `GET` | `/attachments/{id}` | Download attachment |
| `DELETE` | `/attachments/{id}` | Delete attachment |

### WebSocket
| Protocol | Endpoint | Description |
|----------|----------|-------------|
| `WSS` | `/ws/{client_id}` | Real-time task updates |

> 📄 **Full interactive API documentation:** [Swagger UI](https://taskmanegmentapp.onrender.com/docs)

---

## 🔐 Authentication Flow

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User   │     │ Frontend │     │ Backend  │     │ Database │
└────┬────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │               │               │               │
     │ Enter creds   │               │               │
     ├──────────────→│               │               │
     │               │ POST /token   │               │
     │               ├──────────────→│               │
     │               │               │ Verify hash   │
     │               │               ├──────────────→│
     │               │               │←──────────────┤
     │               │               │               │
     │               │  JWT Token    │ Generate JWT  │
     │               │←──────────────┤               │
     │               │               │               │
     │               │ Store in      │               │
     │               │ localStorage  │               │
     │               │               │               │
     │ Redirect to   │               │               │
     │ /home         │               │               │
     │←──────────────┤               │               │
     │               │               │               │
     │ Access /tasks │               │               │
     ├──────────────→│               │               │
     │               │ GET /tasks    │               │
     │               │ Header:       │               │
     │               │ Bearer <JWT>  │               │
     │               ├──────────────→│               │
     │               │               │ Decode JWT    │
     │               │               │ Get user      │
     │               │               ├──────────────→│
     │               │               │←──────────────┤
     │               │  Task data    │               │
     │               │←──────────────┤               │
     │  Render tasks │               │               │
     │←──────────────┤               │               │
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.9+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/SWARAJNB/TaskManegmentApp.git
cd TaskManegmentApp
```

### 2️⃣ Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

Backend will be available at: `http://127.0.0.1:8000`
API Docs at: `http://127.0.0.1:8000/docs`

### 3️⃣ Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### 4️⃣ Quick Start (Windows)
```bash
# From project root — launches both servers automatically
run_project.bat
```

---

## 🐳 Docker Setup

Run the entire stack with Docker Compose:

```bash
# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down
```

### Services Started:
| Service | URL | Description |
|---------|-----|-------------|
| **Backend** | `http://localhost:8000` | FastAPI + Uvicorn |
| **Frontend** | `http://localhost:5173` | React + Vite |
| **PostgreSQL** | `localhost:5432` | Database |

### Docker Compose Architecture:
```yaml
services:
  db:        PostgreSQL 15 Alpine    → Port 5432
  backend:   Python FastAPI          → Port 8000 (depends on db)
  frontend:  React Vite              → Port 5173 (depends on backend)
```

---

## ☁️ Deployment (Render)

The app is deployed on **Render** using 3 services:

| Service | Type | Plan |
|---------|------|------|
| **TaskManegmentApp** | Web Service (Python) | Free |
| **taskmanagement-frontend** | Static Site | Free |
| **taskflow-db** | PostgreSQL 15 | Free |

### Deployment Configuration (`render.yaml`)
```yaml
databases:
  - name: taskflow-db
    plan: free

services:
  - type: web
    name: taskflow-backend
    runtime: python
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT

  - type: web
    name: taskflow-frontend
    runtime: static
    rootDir: frontend
    buildCommand: npm install && npm run build
    staticPublishPath: dist
```

### Deploy Your Own:
1. Fork this repository
2. Create a **Render** account ([render.com](https://render.com))
3. Create a **New PostgreSQL** database
4. Create a **Web Service** → connect to your GitHub repo, set root to `backend`
5. Create a **Static Site** → connect to your GitHub repo, set root to `frontend`
6. Set environment variables (see below)

---

## ⚙️ Environment Variables

### Backend (on Render or `.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/dbname` |
| `SECRET_KEY` | JWT signing secret | Auto-generated on Render |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `https://your-frontend.onrender.com` |
| `PYTHON_VERSION` | Python version for Render | `3.11` |

### Frontend (`.env.production`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://your-backend.onrender.com` |

---

## 📸 Screenshots

### Landing Page
> Modern landing page with glassmorphism design and gradient backgrounds

### Login Page
> 3D animated card with mouse-follow tilt effect, eye/lock icons

### Dashboard
> Analytics charts (Recharts), task stats, completion rate, streak counter

### Task Management
> Filterable task list with priority badges, status indicators, search

### Task Detail
> Full task view with comments thread and file attachments

### Profile
> Avatar upload, profile editing, performance statistics

---

## 📝 Development Process

### Phase 1 — Foundation
1. **Project Setup** — Initialized FastAPI backend with SQLAlchemy ORM and SQLite
2. **Database Schema** — Designed User, Task, Comment, Attachment models
3. **Authentication** — Implemented JWT-based auth with OAuth2 password flow
4. **Core CRUD** — Built task create, read, update, delete operations

### Phase 2 — Frontend
5. **React Setup** — Initialized Vite + React + TypeScript project
6. **Auth UI** — Built 3D animated Login/Register pages with tilt effects
7. **Dashboard** — Created analytics dashboard with Recharts visualizations
8. **Task UI** — Built task list, task detail, task form components

### Phase 3 — Advanced Features
9. **Comments & Attachments** — Added collaboration features
10. **File Upload** — Implemented drag-and-drop file and avatar uploads
11. **WebSocket** — Added real-time task update broadcasting
12. **Password Reset** — OTP-based forgot password flow
13. **CSV Export** — Task data export functionality
14. **Chatbot** — Built-in AI chat assistant component

### Phase 4 — Deployment & DevOps
15. **Docker** — Containerized with Dockerfile + Docker Compose
16. **PostgreSQL Migration** — Migrated from SQLite to PostgreSQL
17. **Render Deployment** — Deployed backend, frontend, and database
18. **CORS Configuration** — Configured cross-origin access for production
19. **CI/CD** — GitHub Actions workflow for automated deployment

---

## 🧪 Test Credentials

For quick demo access:

| Field | Value |
|-------|-------|
| Email | Register a new account on the [live app](https://taskmanagement-frontend-6p1k.onrender.com/register) |
| Password | Choose any password (min 3 characters) |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [SWARAJNB](https://github.com/SWARAJNB)**

⭐ **Star this repo if you found it helpful!** ⭐

</div>
