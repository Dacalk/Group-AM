import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import Sidebar from '../../components/Sidebar'
import Dashboard from '../Dashboard'
import CalendarPage from '../CalendarPage'
import { UserCredentials, AddUser } from '../UserPages'
import { SubjectManagement, AddSubject } from '../SubjectPages'
import { TimetableManagement, AddTimetable, BulkTimetable, WeeklyTimetable } from '../TimetablePages'
import { ClassManagementPage, AddClass } from '../ClassPages'
import { QuizPreview, MCQQuiz, CreateMCQ } from '../QuizPages'
import AuditLogsPage from './AuditLogsPage'
import ProfilePage from '../ProfilePage'
import MessagesPage from '../MessagesPage'
import Header from '../../components/Header'

import { PageLoader } from '../../components/NotificationSystem'


function PageRouter({ page, setPage, data, refreshData, editingUser, setEditingUser, editingSubject, setEditingSubject, editingTimetable, setEditingTimetable, editingClass, setEditingClass, currentUser }) {
  const props = { 
    setPage, 
    data, 
    refreshData, 
    editingUser, 
    setEditingUser, 
    editingSubject, 
    setEditingSubject, 
    editingTimetable, 
    setEditingTimetable,
    editingClass,
    setEditingClass,
    currentUser
  }
  switch (page) {
    case 'dashboard':          return <Dashboard data={data} refreshData={refreshData} setPage={setPage} />
    case 'calendar':           return <CalendarPage />
    case 'userCredentials':    return <UserCredentials {...props} />
    case 'auditLogs':          return <AuditLogsPage />
    case 'addUser':            return <AddUser {...props} />
    case 'subjectManagement':  return <SubjectManagement {...props} />
    case 'addSubject':         return <AddSubject {...props} />
    case 'timetableManagement':return <TimetableManagement {...props} />
    case 'addTimetable':       return <AddTimetable {...props} />
    case 'bulkTimetable':      return <BulkTimetable {...props} />
    case 'weeklyTimetable':    return <WeeklyTimetable {...props} />
    case 'classMgmt':          return <ClassManagementPage {...props} />
    case 'addClass':           return <AddClass {...props} />
    case 'quizPreview':        return <QuizPreview {...props} />
    case 'mcqQuiz':            return <MCQQuiz {...props} />
    case 'createMcq':          return <CreateMCQ {...props} />
    case 'messages':           return <MessagesPage currentUser={currentUser} />
    case 'profile':            return <ProfilePage currentUser={currentUser} />
    default:                   return <Dashboard data={data} refreshData={refreshData} />
  }
}

export default function AdminDashboard({ onRoleChange, currentUser }) {
  const [page, setPage] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [data, setData] = useState({ users: [], subjects: [], timetable: [], quizzes: [] })
  const [loading, setLoading] = useState(true)
  
  // States for editing entries
  const [editingUser, setEditingUser] = useState(null)
  const [editingSubject, setEditingSubject] = useState(null)
  const [editingTimetable, setEditingTimetable] = useState(null)
  const [editingClass, setEditingClass] = useState(null)

  const refreshData = async () => {
    try {
      const res = await api.getAdminData()
      setData(res)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching admin data:", err)
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f5fb] w-full">
        <PageLoader message="Fetching system tables, schedules, and credentials from Oracle database..." />
      </div>
    )
  }


  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f5fb] w-full relative">
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        currentPage={page} 
        setCurrentPage={setPage} 
        onRoleChange={onRoleChange} 
        currentUser={currentUser} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          portalTitle="Admin Control Panel"
          currentUser={currentUser}
          onNavigateMessages={() => setPage("messages")}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <PageRouter 
            page={page} 
            setPage={setPage} 
            data={data} 
            refreshData={refreshData}
            editingUser={editingUser}
            setEditingUser={setEditingUser}
            editingSubject={editingSubject}
            setEditingSubject={setEditingSubject}
            editingTimetable={editingTimetable}
            setEditingTimetable={setEditingTimetable}
            editingClass={editingClass}
            setEditingClass={setEditingClass}
            currentUser={currentUser}
          />
        </main>
      </div>
    </div>
  )
}

