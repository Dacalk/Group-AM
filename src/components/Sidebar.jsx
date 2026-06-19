import { useState } from 'react'
import { Icon, icons } from './Icons'

const navItems = [
  {
    id: 'userManagement', label: 'User Management', icon: 'users',
    children: [
      { id: 'userCredentials', label: 'User Credentials', icon: 'key' },
      { id: 'addUser', label: 'Add New User', icon: 'plus' },
    ]
  },
  {
    id: 'subjects', label: 'Subjects', icon: 'book',
    children: [
      { id: 'subjectManagement', label: 'Subject Management', icon: 'list' },
      { id: 'addSubject', label: 'Add New Subject', icon: 'plus' },
    ]
  },
  {
    id: 'timetable', label: 'Timetable', icon: 'calendar',
    children: [
      { id: 'timetableManagement', label: 'Timetable Management', icon: 'calendar' },
      { id: 'addTimetable', label: 'Add Timetable', icon: 'plus' },
      { id: 'bulkTimetable', label: 'Bulk Add Timetable', icon: 'grid' },
      { id: 'weeklyTimetable', label: 'Weekly Timetable', icon: 'clock' },
    ]
  },
  {
    id: 'classManagement', label: 'Class Management', icon: 'building',
    children: [
      { id: 'classMgmt', label: 'Class Management', icon: 'building' },
      { id: 'addClass', label: 'Add New Class', icon: 'plus' },
    ]
  },
  {
    id: 'quizMcq', label: 'Quiz & MCQ', icon: 'helpCircle',
    children: [
      { id: 'quizPreview', label: 'Quiz Preview', icon: 'helpCircle' },
      { id: 'mcqQuiz', label: 'MCQ Quiz', icon: 'list' },
      { id: 'createMcq', label: 'Create MCQ', icon: 'pencil' },
    ]
  },
]

export default function Sidebar({ currentPage, setCurrentPage }) {
  const [expanded, setExpanded] = useState({
    userManagement: false,
    subjects: false,
    timetable: true,
    classManagement: true,
    quizMcq: true,
  })

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }))
  const isActive = (id) => currentPage === id

  return (
    <div className="w-64 min-h-screen flex flex-col flex-shrink-0" style={{ background: '#1a1d3a' }}>

      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#5b5fc7' }}>
            <Icon path={icons.graduation} size={20} color="white" />
          </div>
          <div>
            <div className="text-white font-bold text-base leading-tight">EduManage</div>
            <div className="text-xs text-blue-300/70">School System</div>
          </div>
        </div>
      </div>

      {/* Role Tabs — 2 rows: [Parent, Teacher] / [Library, Admin] */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="grid grid-cols-2 gap-1">
          {['Parent', 'Teacher', 'Library', 'Admin'].map((role) => (
            <button
              key={role}
              className={`text-xs py-1.5 rounded-md font-medium transition-all ${
                role === 'Admin'
                  ? 'text-white'
                  : 'text-blue-300/60 hover:text-blue-200'
              }`}
              style={role === 'Admin' ? { background: '#5b5fc7' } : {}}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-scroll flex-1 px-3 py-3">
        <p className="text-[10px] font-semibold text-blue-400/50 px-2 pb-2 pt-1 uppercase tracking-widest">
          Admin Panel
        </p>

        {navItems.map((item) => (
          <div key={item.id} className="mb-0.5">
            {/* Parent row */}
            <button
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-blue-200 hover:bg-white/8 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Icon path={icons[item.icon]} size={16} color="#93a8d4" />
                <span className="text-sm font-semibold text-white/90">{item.label}</span>
              </div>
              <div className={`transition-transform duration-200 ${expanded[item.id] ? 'rotate-180' : ''}`}>
                <Icon path={icons.chevronDown} size={14} color="#5b6fa8" />
              </div>
            </button>

            {/* Children */}
            {expanded[item.id] && (
              <div className="mt-0.5 mb-1">
                {item.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setCurrentPage(child.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all mb-0.5 ${
                      isActive(child.id)
                        ? 'text-white font-semibold'
                        : 'text-blue-300/70 hover:text-blue-100 hover:bg-white/5'
                    }`}
                    style={isActive(child.id) ? { background: '#5b5fc7' } : {}}
                  >
                    <Icon
                      path={icons[child.icon]}
                      size={15}
                      color={isActive(child.id) ? 'white' : '#7b93c8'}
                    />
                    {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: '#5b5fc7' }}
          >
            JD
          </div>
          <div>
            <div className="text-white text-sm font-semibold">John Doe</div>
            <div className="text-blue-400/70 text-xs">Admin</div>
          </div>
        </div>
      </div>
    </div>
  )
}
