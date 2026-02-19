# TaskFlow - Premium Task Management System

TaskFlow is a modern, full-stack task management application designed to help users organize their work efficiently. Built with a robust FastAPI backend and a dynamic React frontend, it features a premium "glassmorphism" UI, secure authentication, and comprehensive task tracking capabilities.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure Login and Registration with JWT tokens.
- **Dashboard**: Real-time overview of task statistics (Total, Completed, Pending, High Priority) with visual charts.
- **Task Management**: Create, Read, Update, and Delete (CRUD) tasks.
- **Filtering & Search**: Easily find tasks by status (Todo, In Progress, Done) or search by title/description.
- **Profile Management**: Update user details and change passwords.

### Advanced Features
- **Attachments**: Upload and download files (images, PDFs) for each task.
- **Comments**: Collaborate by adding comments to tasks.
- **Premium UI**: distinct glassmorphism design, smooth animations, and responsive layout.
- **Dark/Light Mode**: Toggle between themes (persisted in local storage).

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (with SQLAlchemy ORM)
- **Authentication**: OAuth2 with Password Flow (JWT)
- **Validation**: Pydantic models

### Frontend
- **Framework**: React (Vite + TypeScript)
- **Styling**: Plain CSS with CSS Variables (Glassmorphism design system)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router DOM

---

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+

### Option 1: Quick Start (Windows)
Simply double-click the `run_project.bat` file in the root directory. This script effectively:
1.  Starts the Backend server.
2.  Starts the Frontend development server.

### Option 2: Manual Setup

#### 1. Backend Setup
Open a terminal in the `backend` directory:

```bash
cd backend
# Create virtual environment (optional but recommended)
python -m venv venv
# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
# OR
uvicorn main:app --reload --port 8000
```
The API will be available at `http://localhost:8000`. API Docs (Swagger UI) at `http://localhost:8000/docs`.

#### 2. Frontend Setup
Open a new terminal in the `frontend` directory:

```bash
cd frontend
# Install dependencies
npm install

# Start development server
npm run dev
```
The application will be running at `http://localhost:5173`.

---

### Option 3: Docker (Bonus)
If you have Docker installed, you can run the entire stack with a single command:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

---

## 📖 Usage Guide

1.  **Registration**: Create a new account on the `/register` page.
2.  **Login**: Access your dashboard using your credentials.
3.  **Dashboard**: View your weekly productivity trend and quick stats.
4.  **Create Task**: Click "+ New Task" to open the creation modal.
5.  **My Tasks**: Navigate to `/tasks` to see a list of all items. Use the dropdown to filter by status.
6.  **Task Details**: Click on any task to view full details, upload attachments, or add comments.
7.  **Profile**: Update your personal information in the Profile section.

---

## 🔧 Troubleshooting

### Database Issues (`no such column: users.reset_token`)
If you encounter an "Internal Server Error" or database schema errors, it likely means the local SQLite database is outdated.

**Fix:**
Run the provided fix script in the `backend` directory:
```bash
cd backend
python force_fix_db.py
```
Then restart the backend server.

### Password Reset
Since there is no live email server configured, the "Forgot Password" link generates a **Debug Link** printed to the **Backend Terminal** console. capable of clicking it directly in the development output to reset your password.

---

## 🤝 Contributing
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.
