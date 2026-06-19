import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import { UserCredentials, AddUser } from './pages/UserPages'
import { SubjectManagement, AddSubject } from './pages/SubjectPages'
import { TimetableManagement, AddTimetable, BulkTimetable, WeeklyTimetable } from './pages/TimetablePages'
import { ClassManagementPage, AddClass } from './pages/ClassPages'
import { QuizPreview, MCQQuiz, CreateMCQ } from './pages/QuizPages'

function PageRouter({ page, setPage }) {
  const props = { setPage }
  switch (page) {
    case 'dashboard':          return <Dashboard />
    case 'userCredentials':    return <UserCredentials {...props} />
    case 'addUser':            return <AddUser {...props} />
    case 'subjectManagement':  return <SubjectManagement {...props} />
    case 'addSubject':         return <AddSubject {...props} />
    case 'timetableManagement':return <TimetableManagement {...props} />
    case 'addTimetable':       return <AddTimetable {...props} />
    case 'bulkTimetable':      return <BulkTimetable {...props} />
    case 'weeklyTimetable':    return <WeeklyTimetable />
    case 'classMgmt':          return <ClassManagementPage {...props} />
    case 'addClass':           return <AddClass {...props} />
    case 'quizPreview':        return <QuizPreview {...props} />
    case 'mcqQuiz':            return <MCQQuiz />
    case 'createMcq':          return <CreateMCQ />
    default:                   return <Dashboard />
  }
}

export default function App() {
  const [page, setPage] = useState('dashboard')

  return (
    <div className="flex min-h-screen bg-[#f4f5fb]">
      <Sidebar currentPage={page} setCurrentPage={setPage} />
      <main className="flex-1 p-8 overflow-auto">
        <PageRouter page={page} setPage={setPage} />
      </main>
    </div>
  )
}
