# EduManage — School Learning Management System

A full-stack **Learning Management System (LMS)** built for schools, powering five distinct role-based portals — Admin, Teacher, Parent, Student, and Librarian — backed by an **Oracle Database** and served through a **Node.js / Express** REST API.

---

## 📋 Table of Contents

- [Features by Role](#-features-by-role)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Fresh Setup Guide](#-fresh-setup-guide)
- [Demo Credentials](#-demo-credentials)
- [API Reference](#-api-reference)
- [Frontend Details](#-frontend-details)
- [Database Overview](#-database-overview)
- [Useful Scripts](#-useful-scripts)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features by Role

### 🔑 Admin Portal
- Full **user management** — add, edit, delete users across all roles (Admin, Teacher, Parent, Student, Library)
- **Subject management** — create and assign subjects to teachers
- **Timetable management** — add, edit, delete weekly schedule slots
- **Class management** — create/manage school classes (classrooms)
- **Quiz management** — create quizzes with MCQ questions and assign to classes
- **School calendar** — create and manage school events (activities, meetings, holidays)
- **Audit logs** — complete activity trail of all admin actions
- **Messaging** — in-app messaging system with all users

### 👨‍🏫 Teacher Portal
- **Dashboard** — student roster with live attendance rates + weekly timetable (via Oracle stored procedure)
- **Attendance tracking** — mark and view daily attendance per student (`Present`, `Absent`, `Late`, `Leave`)
- **Exam & grade management** — create exams, enter marks, assign grades with remarks
- **Messaging** — in-app chat with other staff and admin

### 👪 Parent Portal
- **Student overview** — view child's profile, class, attendance summary
- **Fee management** — view outstanding invoices and mark fees as paid
- **Grade reports** — view child's exam scores and grades by subject/term
- **School calendar** — view upcoming school events
- **Messaging** — communicate with teachers and admin

### 🎓 Student Portal
- **Dashboard** — personal overview with attendance %, upcoming exams, recent grades
- **Quiz system** — take assigned quizzes with a countdown timer; submit and see results
- **Library** — search available books and borrow them
- **Timetable** — view weekly schedule
- **Messaging** — communicate with teachers and admin

### 📚 Library Portal
- **Book management** — add new books, view book catalogue
- **Issue & return** — issue books to students/teachers, record returns with due-date tracking
- **Transaction history** — full library transaction log

---

## 🛠 Tech Stack

| Layer | Package | Version |
|-------|---------|--------|
| **Frontend** | `react` + `react-dom` | ^18.3.1 |
| **Build Tool** | `vite` + `@vitejs/plugin-react` | ^8.0.16 |
| **Styling** | `tailwindcss` | ^3.4.14 |
| **Icons** | `lucide-react`, `react-icons` | ^1.17.0, ^5.6.0 |
| **Backend** | `express` | ^4.19.2 |
| **DB Driver** | `oracledb` (thin mode) | ^6.5.0 |
| **Database** | Oracle 21c XE / Free / Autonomous | — |
| **Dev Tools** | `nodemon`, `dotenv` | ^3.1.0, ^16.4.5 |

---

## 📁 Project Structure

```
adbms_t/                          ← monorepo root
├── package.json                  ← root scripts (install-all, dev-server, dev-client)
│
├── client/                       ← React frontend (Vite + Tailwind)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx              ← App entry point
│       ├── App.jsx               ← Login page + role-based dashboard router
│       ├── index.css             ← Tailwind directives + global styles
│       ├── services/
│       │   └── api.js            ← Centralized fetch wrapper for all API calls
│       ├── components/
│       │   ├── Icons.jsx         ← SVG icon system
│       │   ├── Sidebar.jsx       ← Role-aware navigation sidebar
│       │   ├── Header.jsx        ← Top bar with user info
│       │   ├── UI.jsx            ← Shared UI primitives (Badge, Btn, Input, Modal…)
│       │   ├── NotificationSystem.jsx  ← Toast alerts + login splash screen
│       │   ├── Library/          ← Library-specific sub-components
│       │   └── Teacher/          ← Teacher-specific sub-components
│       └── pages/
│           ├── Dashboard.jsx         ← Legacy admin dashboard (shared utilities)
│           ├── UserPages.jsx         ← User management (credentials + add user)
│           ├── SubjectPages.jsx      ← Subject management
│           ├── TimetablePages.jsx    ← Timetable management
│           ├── ClassPages.jsx        ← Class management
│           ├── QuizPages.jsx         ← Quiz management + take-quiz UI
│           ├── CalendarPage.jsx      ← School events calendar
│           ├── MessagesPage.jsx      ← In-app messaging system
│           ├── ProfilePage.jsx       ← User profile + password change
│           ├── Admin/
│           │   ├── AdminDashboard.jsx    ← Admin portal root
│           │   └── AuditLogsPage.jsx     ← Activity audit log viewer
│           ├── Teacher/
│           │   ├── TeacherDashboard.jsx  ← Teacher portal root
│           │   └── TeacherExamGrades.jsx ← Exam creation + grade entry
│           ├── Student/
│           │   └── StudentDashboard.jsx  ← Student portal (quiz, grades, library)
│           ├── Parent/
│           │   ├── ParentDashboard.jsx   ← Parent portal root
│           │   └── ParentExamGrades.jsx  ← Child's grade report viewer
│           └── Library/
│               └── LibraryDashboard.jsx  ← Librarian portal (books, issue, return)
│
└── server/                       ← Express backend
    ├── server.js                 ← Entry point (Express + DB pool init)
    ├── .env                      ← Environment variables (DB creds, port)
    ├── package.json
    ├── config/
    │   └── db.js                 ← Oracle connection pool (initializeDatabase, executeQuery, closeDatabase)
    ├── routes/
    │   └── api.js                ← All REST routes (auth, admin, teacher, parent, student, library)
    ├── controllers/
    │   ├── authController.js     ← Login, user list, password update
    │   ├── adminController.js    ← User/subject/timetable/class/quiz CRUD + audit logs
    │   ├── teacherController.js  ← Teacher dashboard (stored proc), attendance, exams, grades
    │   ├── parentController.js   ← Parent data, child management, fees, grades
    │   ├── studentController.js  ← Student data, quiz submission, book borrowing
    │   ├── libraryController.js  ← Book catalogue, issue, return
    │   ├── eventController.js    ← School event CRUD
    │   └── messageController.js  ← Messaging system CRUD
    └── sql/
        ├── database.sql          ← ⭐ All SQL — cleanup, DDL patches, PL/SQL package, stored procedure
        ├── seed.js               ← Full DB reset + seed data runner
        ├── apply_admin_pkg.js    ← Applies only PL/SQL (Sections 3 & 4 of database.sql)
        ├── alter_attendance_constraint.js  ← Standalone attendance constraint fixer
        ├── create_audit_log.js   ← Standalone AUDIT_LOG table creator
        ├── migrate_library.js    ← Standalone library TEACHERID migration
        └── DATABASE_SQL_GUIDE.md ← Full SQL documentation
```

---

## 📦 Prerequisites

Make sure these are installed before setting up:

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | ≥ 18.x | [nodejs.org](https://nodejs.org) |
| **npm** | ≥ 9.x | Bundled with Node.js |
| **Oracle Database** | 21c XE / Free / Autonomous | Local or cloud (ATP) |
| **Oracle Wallet** | _(for cloud/TLS connections)_ | Required for Oracle Autonomous DB |

> **Local Oracle XE:** No wallet needed. Use `connectString: 'localhost:1521/XEPDB1'` (or `FREE` for Oracle Free).  
> **Oracle Cloud ATP:** Download the wallet zip from the OCI Console, extract it, and point `DB_WALLET_LOCATION` to the folder.

---

## 🚀 Fresh Setup Guide

Follow these steps in order to get the project running from scratch.

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Dacalk/adbms_t.git
cd adbms_t
```

### Step 2 — Install All Dependencies

From the **monorepo root**, install both client and server dependencies in one command:

```bash
npm run install-all
```

Or install separately:

```bash
npm install --prefix client
npm install --prefix server
```

### Step 3 — Configure Environment Variables

Create the file `server/.env` (copy the template below):

```env
PORT=5000

# Oracle DB credentials
DB_USER=your_oracle_username
DB_PASSWORD=your_oracle_password

# Connection string — examples:
# Local Oracle XE:          localhost:1521/XEPDB1
# Local Oracle Free:        localhost:1521/FREE
# Oracle Autonomous (cloud): your_atp_alias_medium  (from tnsnames.ora in wallet)
DB_CONNECT_STRING=localhost:1521/FREE

# Only required for Oracle Cloud / wallet-based connections:
# DB_WALLET_LOCATION=C:/oracle/wallet
# DB_CONFIG_DIR=C:/oracle/wallet
# DB_WALLET_PASSWORD=your_wallet_password
```

> ⚠️ **Never commit `.env` to version control.** It is already in `.gitignore`.

### Step 4 — Set Up the Oracle Database Schema

Your Oracle database must already have the base tables created (e.g., `USERS`, `STUDENT`, `TEACHER`, etc.) from your Oracle APEX / SQL Developer setup. Then run the seed script to apply DDL patches, create PL/SQL objects, and insert demo data:

```bash
cd server
npm run seed
```

This runs `sql/seed.js` which:
1. **Cleans up** stale/duplicate tables (Section 1 of `database.sql`)
2. **Applies DDL patches** — adds missing columns and constraints (Section 2)
3. **Seeds demo data** — users, students, teachers, subjects, timetable, quizzes, etc.
4. **Creates PL/SQL** — `admin_user_pkg` package + `GET_TEACHER_DASHBOARD_DATA` stored procedure (Sections 3 & 4)


#### (Optional) Apply only the PL/SQL objects without re-seeding data:

```bash
node server/sql/apply_admin_pkg.js
```

### Step 5 — Start the Backend Server

```bash
cd server
npm run dev
```

The API server starts at **http://localhost:5000**  
Health check: **http://localhost:5000/health**

### Step 6 — Start the Frontend Dev Server

In a new terminal:

```bash
cd client
npm run dev
```

The app opens at **http://localhost:5173**

---

## 🔑 Demo Credentials

After seeding, these accounts are ready to use:

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123` |
| **Teacher** | `teacher1` | `password` |
| **Parent** | `parent1` | `password` |
| **Student** | `student1` | `password` |
| **Librarian** | `librarian` | `password` |

---

## 🌐 API Reference

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Login with username + password |
| `GET` | `/auth/users` | Get all user accounts |
| `POST` | `/auth/update-password` | Change user password |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/data` | All admin dashboard data |
| `POST/PUT/DELETE` | `/admin/users/:id` | User CRUD |
| `POST/PUT/DELETE` | `/admin/subjects/:id` | Subject CRUD |
| `POST/PUT/DELETE` | `/admin/timetable/:id` | Timetable CRUD |
| `POST/PUT/DELETE` | `/admin/classes/:id` | Class CRUD |
| `POST/DELETE` | `/admin/quizzes/:id` | Quiz CRUD |
| `GET` | `/admin/audit-logs` | Activity audit trail |
| `GET/POST/DELETE` | `/admin/events/:id` | School events |

### Teacher
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/teacher/data` | Dashboard data via stored procedure |
| `GET/POST` | `/teacher/attendance` | Attendance by date / save attendance |
| `GET/POST` | `/teacher/exams` | Exams list / create exam |
| `POST` | `/teacher/grades` | Save student grades |

### Parent
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/parent/data` | Parent + child + fees data |
| `GET` | `/parent/grades` | Child's grade report |
| `POST` | `/parent/children` | Register a child |
| `POST` | `/parent/pay-invoice` | Mark a fee invoice as paid |

### Student
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/student/data` | Student dashboard data |
| `POST` | `/student/borrow` | Borrow a book |

### Library
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/library/data` | Books + transaction history |
| `POST` | `/library/books` | Add a new book |
| `POST` | `/library/issue` | Issue a book to a user |
| `POST` | `/library/return` | Return a book |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/messages` | All messages for current user |
| `GET` | `/messages/recipients` | List of all users to message |
| `POST` | `/messages` | Send a message |
| `POST` | `/messages/read` | Mark conversation as read |
| `DELETE` | `/messages/:id` | Delete a message |
| `POST` | `/messages/delete-conv` | Delete entire conversation |

---

## 🗄 Database Overview

The project uses **Oracle Database** with the following key objects:

**Core Tables:** `USERS`, `DEPARTMENT`, `TEACHER`, `STUDENT`, `PARENT`, `LIBRARIAN`  
**Academic:** `SUBJECT`, `CLASSROOM`, `TIMETABLE`, `EXAM`, `GRADE`, `QUIZ`, `QUIZ_QUESTION`, `QUIZ_RESPONSE`  
**Operational:** `ATTENDANCE`, `FEES`, `BOOK`, `LIBRARY_TRANSACTION`  
**App-level:** `SCHOOL_EVENT`, `MESSAGES`, `AUDIT_LOG`

**PL/SQL Objects:**
- `admin_user_pkg` — Package for user CRUD with `add_user`, `update_user`, `delete_user`, `get_all_users`
- `GET_TEACHER_DASHBOARD_DATA` — Stored procedure returning student roster + timetable as REFCURSORs

> See [`server/sql/DATABASE_SQL_GUIDE.md`](server/sql/DATABASE_SQL_GUIDE.md) for full SQL documentation.

---

## 🧰 Useful Scripts

| Location | Command | Description |
|----------|---------|-------------|
| Root | `npm run install-all` | Install all client + server deps |
| Root | `npm run dev-server` | Start backend with nodemon |
| Root | `npm run dev-client` | Start frontend Vite dev server |
| `server/` | `npm run dev` | Start backend with nodemon |
| `server/` | `npm run seed` | Full DB reset + seed |
| `server/` | `npm start` | Start backend (production mode) |
| `client/` | `npm run dev` | Start Vite dev server |
| `client/` | `npm run build` | Build production bundle |
| `client/` | `npm run preview` | Preview production build |

---

## 🖥 Frontend Details

### Role-Based Routing

After a successful login, `App.jsx` reads `currentUser.role` and renders the matching dashboard. Session is persisted in `localStorage`.

| Role | Root Component | Key Pages / Tabs |
|------|---------------|------------------|
| `Admin` | `AdminDashboard` | Users, Subjects, Timetable, Classes, Quizzes, Events, Audit Logs |
| `Teacher` | `TeacherDashboard` | Student Roster, Attendance, Exam & Grades |
| `Parent` | `ParentDashboard` | Child Overview, Fees, Grade Report, Calendar |
| `Student` | `StudentDashboard` | Quizzes, Grades, Library, Timetable |
| `Library` | `LibraryDashboard` | Book Catalogue, Issue / Return |

### Available Pages

| Page | Visible To | Description |
|------|-----------|-------------|
| Login | Everyone | Credential-based login with role detection |
| Admin Dashboard | Admin | Tabbed interface for all admin operations |
| Audit Logs | Admin | Full admin action history |
| Teacher Dashboard | Teacher | Student roster + attendance + timetable |
| Exam & Grades | Teacher | Create exams, enter marks / grades |
| Parent Dashboard | Parent | Child info, fees, school events |
| Grade Report | Parent | Child's exam scores by subject & term |
| Student Dashboard | Student | Quizzes, grades overview, library, calendar |
| Library Dashboard | Library | Books, issue / return transactions |
| Messages | All roles | In-app threaded messaging |
| Calendar | All roles | School events calendar view |
| Profile | All roles | View profile, change password |

### API Client (`src/services/api.js`)

All backend calls are centralised in a single `api` object that wraps the native `fetch` API:

- **Base URL:** `http://localhost:5000/api`
- Automatically attaches `Content-Type: application/json`
- Throws a descriptive error on any non-2xx response

```js
import { api } from './services/api';

// GET example
const data = await api.getAdminData();

// POST example
const result = await api.addUser({ name, username, password, role, email });

// PUT example
await api.updateUser(userId, { name, role });

// DELETE example
await api.deleteUser(userId);
```

---

## ⚠️ Troubleshooting

**`ORA-01017: invalid username/password`**  
→ Double-check `DB_USER` and `DB_PASSWORD` in `server/.env`.

**`Cannot connect to Oracle DB`**  
→ Verify the Oracle service is running. For local XE: check `lsnrctl status` in a terminal.

**`Wallet not found` / `NJS-067`**  
→ Ensure `DB_WALLET_LOCATION` and `DB_CONFIG_DIR` both point to the extracted wallet directory (not the zip file).

**`ORA-00955: name is already used` during seed**  
→ This is safe — the seed script handles it with idempotent guards (`EXCEPTION WHEN e_table_exists THEN NULL`).

**Frontend shows blank or "Server error"**  
→ Make sure the backend is running on port 5000 before opening the frontend. Check the browser console for CORS errors.

---

*© 2026 EduManage LMS. Powered by React, Node.js, Express, and Oracle Database.*
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
