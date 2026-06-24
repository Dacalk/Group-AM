import { useState } from 'react'
import { Icon, icons } from './Icons'

// ─── NAV CONFIG PER ROLE ──────────────────────────────────────────────────────

const NAV_BY_ROLE = {
  Admin: [
    { id: 'dashboard',       label: 'Dashboard',          icon: 'grid' },
    { id: 'calendar',        label: 'School Calendar',    icon: 'calendar' },
    {
      id: 'userManagement',  label: 'User Management',   icon: 'users',
      children: [
        { id: 'userCredentials', label: 'User Credentials', icon: 'key' },
        { id: 'auditLogs',       label: 'System Audit Logs', icon: 'list' },
      ]
    },
    {
      id: 'subjects',        label: 'Subjects',           icon: 'book',
      children: [
        { id: 'subjectManagement', label: 'Subject Management', icon: 'list' },
      ]
    },
    {
      id: 'timetable',       label: 'Timetable',          icon: 'clock',
      children: [
        { id: 'timetableManagement', label: 'Timetable Management', icon: 'calendar' },
        { id: 'weeklyTimetable',     label: 'Weekly Timetable',     icon: 'clock' },
      ]
    },
    {
      id: 'classManagement', label: 'Class Management',   icon: 'building',
      children: [
        { id: 'classMgmt', label: 'Class Management', icon: 'building' },
      ]
    },
    {
      id: 'quizMcq',         label: 'Quiz & MCQ',         icon: 'helpCircle',
      children: [
        { id: 'quizPreview', label: 'Quiz Preview', icon: 'helpCircle' },
      ]
    },
    { id: 'messages', label: 'Messages',   icon: 'messageSquare' },
    { id: 'profile',  label: 'My Profile', icon: 'users' },
  ],

  Teacher: [
    { id: 'dashboard',   label: 'Dashboard',    icon: 'grid' },
    { id: 'attendance',  label: 'Attendance',   icon: 'list' },
    { id: 'classes',     label: 'My Classes',   icon: 'building' },
    { id: 'timetable',   label: 'My Timetable', icon: 'clock' },
    { id: 'quizPreview', label: 'Quizzes',      icon: 'helpCircle' },
    { id: 'examGrades',  label: 'Exam Grades',  icon: 'book' },
    { id: 'messages',    label: 'Messages',     icon: 'messageSquare' },
    { id: 'profile',     label: 'My Profile',   icon: 'users' },
  ],

  Parent: [
    { id: 'dashboard',  label: 'Dashboard',          icon: 'grid' },
    { id: 'children',   label: 'My Children',        icon: 'users' },
    { id: 'accounts',   label: 'Children Accounts',  icon: 'key' },
    { id: 'attendance', label: 'Children Attendance',icon: 'calendar' },
    { id: 'examGrades', label: 'Exam Grades',        icon: 'book' },
    { id: 'messages',   label: 'Messages',           icon: 'messageSquare' },
    { id: 'profile',    label: 'My Profile',         icon: 'users' },
  ],

  Library: [
    { id: 'dashboard',    label: 'Dashboard',    icon: 'grid' },
    { id: 'requests',     label: 'Borrow Requests', icon: 'clock' },
    { id: 'books',        label: 'Books',        icon: 'book' },
    { id: 'transactions', label: 'Transactions', icon: 'list' },
    { id: 'messages',     label: 'Messages',     icon: 'messageSquare' },
    { id: 'profile',      label: 'My Profile',   icon: 'users' },
  ],

  Student: [
    { id: 'dashboard',  label: 'Dashboard',       icon: 'grid' },
    { id: 'grades',     label: 'My Grades',        icon: 'book' },
    { id: 'attendance', label: 'Attendance',        icon: 'calendar' },
    { id: 'timetable',  label: 'Timetable',         icon: 'list' },
    { id: 'library',    label: 'Library',           icon: 'book' },
    { id: 'quizzes',    label: 'Quizzes',           icon: 'grid' },
    { id: 'calendar',   label: 'Event Calendar',    icon: 'calendar' },
    { id: 'messages',   label: 'Messages',          icon: 'messageSquare' },
    { id: 'profile',    label: 'My Profile',        icon: 'users' },
  ],
}

const ROLE_LABEL = {
  Admin:   'Admin Panel',
  Teacher: 'Teacher Portal',
  Parent:  'Parent Portal',
  Library: 'Librarian Portal',
  Student: 'Student Portal',
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

export default function Sidebar({ currentPage, setCurrentPage, onRoleChange, currentUser, isOpen, onClose }) {
  const role = currentUser?.role || 'Admin'
  const navItems = NAV_BY_ROLE[role] || NAV_BY_ROLE.Admin
  const panelLabel = ROLE_LABEL[role] || 'Navigation'

  // Build initial expanded state from all group ids
  const initialExpanded = Object.fromEntries(
    navItems.filter(i => i.children).map(i => [i.id, false])
  )
  const [expanded, setExpanded] = useState(initialExpanded)

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }))
  const isActive = (id) => currentPage === id

  return (
    <div
      className={`h-full flex flex-col flex-shrink-0 fixed md:static inset-y-0 left-0 z-50 transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 w-64`}
      style={{ background: '#1a1d3a' }}
    >
      {/* Navigation */}
      <div className="sidebar-scroll flex-1 px-3 py-3 overflow-y-auto">
        <p className="text-[10px] font-semibold text-blue-400/50 px-2 pb-2 pt-1 uppercase tracking-widest block">
          {panelLabel}
        </p>

        {navItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0
          const isItemActive = isActive(item.id)
          // A parent group is highlighted if any child is active
          const isGroupActive = hasChildren && item.children.some(c => isActive(c.id))

          if (!hasChildren) {
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id)
                  if (onClose) onClose()
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all mb-1 cursor-pointer border-0 text-left bg-transparent ${
                  isItemActive
                    ? 'text-white font-semibold bg-[#5b5fc7]'
                    : 'text-blue-300/70 hover:text-blue-100 hover:bg-white/5'
                }`}
              >
                <Icon
                  path={icons[item.icon]}
                  size={15}
                  color={isItemActive ? 'white' : '#7b93c8'}
                />
                <span className="font-semibold block">{item.label}</span>
              </button>
            )
          }

          return (
            <div key={item.id} className="mb-0.5">
              {/* Parent row */}
              <button
                onClick={() => {
                  toggle(item.id)
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all cursor-pointer border-0 text-left bg-transparent ${
                  isGroupActive
                    ? 'text-blue-100 bg-white/5'
                    : 'text-blue-200 hover:bg-white/8'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon path={icons[item.icon]} size={16} color={isGroupActive ? '#a5b4fc' : '#93a8d4'} />
                  <span className="text-sm font-semibold text-white/90 block">{item.label}</span>
                </div>
                <div className={`transition-transform duration-200 ${expanded[item.id] ? 'rotate-180' : ''} block`}>
                  <Icon path={icons.chevronDown} size={14} color="#5b6fa8" />
                </div>
              </button>

              {/* Children */}
              {expanded[item.id] && (
                <div className="mt-0.5 mb-1">
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => {
                        setCurrentPage(child.id)
                        if (onClose) onClose()
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all mb-0.5 cursor-pointer border-0 text-left bg-transparent ${
                        isActive(child.id)
                          ? 'text-white font-semibold bg-[#5b5fc7]'
                          : 'text-blue-300/70 hover:text-blue-100 hover:bg-white/5'
                      }`}
                    >
                      <Icon
                        path={icons[child.icon]}
                        size={15}
                        color={isActive(child.id) ? 'white' : '#7b93c8'}
                      />
                      <span className="font-medium">{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/10 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${currentUser?.avatarClass || 'bg-[#5b5fc7]'}`}
          >
            {currentUser?.initials || role.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 block">
            <div className="text-white text-sm font-semibold truncate">{currentUser?.name || 'User'}</div>
            <div className="text-blue-400/70 text-xs">{role}</div>
          </div>
        </div>
        <button
          onClick={() => onRoleChange(null)}
          className="w-full mt-2 text-center text-xs py-1.5 rounded-md text-red-300 hover:text-white bg-red-900/30 hover:bg-red-800/50 transition border-0 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Icon path={icons.logOut} size={14} color="#fca5a5" />
          <span className="inline">Logout</span>
        </button>
      </div>
    </div>
  )
}
