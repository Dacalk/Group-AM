# EduManage Admin Panel

A school management admin panel built with **React + Vite + Tailwind CSS**.

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for production
```bash
npm run build
```

---

## 📁 Project Structure

```
edumanage-admin/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx           # App entry point
    ├── App.jsx            # Root component + router
    ├── index.css          # Tailwind + global styles
    ├── components/
    │   ├── Icons.jsx      # SVG icon system
    │   ├── Sidebar.jsx    # Navigation sidebar
    │   └── UI.jsx         # Shared components (Badge, Btn, Input…)
    └── pages/
        ├── Dashboard.jsx
        ├── UserPages.jsx
        ├── SubjectPages.jsx
        ├── TimetablePages.jsx
        ├── ClassPages.jsx
        └── QuizPages.jsx
```

## 🛠 Tech Stack
- **React 18** – UI library
- **Vite 5** – Build tool & dev server
- **Tailwind CSS 3** – Utility-first styling

## 📄 Pages Included
- Dashboard
- User Management (Credentials, Add User)
- Subjects (Management, Add Subject)
- Timetable (Management, Add, Bulk Add, Weekly View)
- Class Management (List, Add Class)
- Quiz & MCQ (Preview, Take Quiz, Create MCQ)
