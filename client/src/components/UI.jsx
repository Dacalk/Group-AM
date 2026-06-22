import { useState, useRef, useEffect, useCallback } from 'react'
import { Icon, icons } from './Icons'

// ─── DIALOG SYSTEM ────────────────────────────────────────────────────────────
// Provides styled alert() and confirm() modals to replace native browser dialogs.
// Usage:
//   const { alert, confirm, DialogHost } = useDialog()
//   await alert('Saved!', 'success')
//   const ok = await confirm('Delete this item?', 'Are you sure?')

const DIALOG_ICONS = {
  success: (
    <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  delete: (
    <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
}

const ICON_BG = {
  success: 'bg-emerald-50',
  error: 'bg-red-50',
  warning: 'bg-amber-50',
  info: 'bg-indigo-50',
  delete: 'bg-red-50',
}

const CONFIRM_BTN = {
  success: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100',
  error: 'bg-red-500 hover:bg-red-600 shadow-red-100',
  warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-100',
  info: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100',
  delete: 'bg-red-500 hover:bg-red-600 shadow-red-100',
}

function DialogModal({ dialog, onClose }) {
  if (!dialog) return null
  const { type = 'info', title, message, isConfirm, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm } = dialog

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex flex-col items-center pt-8 pb-4 px-6">
          <div className={`w-14 h-14 ${ICON_BG[type]} rounded-2xl flex items-center justify-center mb-4`}>
            {DIALOG_ICONS[type]}
          </div>
          {title && (
            <h3 className="text-base font-bold text-gray-800 text-center">{title}</h3>
          )}
          {message && (
            <p className="text-sm text-gray-500 mt-2 text-center leading-relaxed whitespace-pre-line">{message}</p>
          )}
        </div>
        <div className={`flex gap-3 px-6 pb-6 pt-2 ${isConfirm ? '' : 'justify-center'}`}>
          {isConfirm && (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold cursor-pointer bg-white transition-all"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={() => { onConfirm?.(); onClose(); }}
            className={`${isConfirm ? 'flex-1' : 'px-8'} py-2.5 text-white rounded-xl text-sm font-semibold cursor-pointer border-0 transition-all shadow-md ${CONFIRM_BTN[type]}`}
          >
            {isConfirm ? confirmLabel : 'OK'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function useDialog() {
  const [dialog, setDialog] = useState(null)
  const resolverRef = useRef(null)

  const showAlert = useCallback((message, type = 'info', title = '') => {
    return new Promise((resolve) => {
      resolverRef.current = resolve
      // Auto-detect type from message content if not set
      const autoType = type === 'info' && (
        message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')
          ? 'error'
          : message.toLowerCase().includes('success') || message.toLowerCase().includes('saved') || message.toLowerCase().includes('created') || message.toLowerCase().includes('updated') || message.toLowerCase().includes('deleted') || message.toLowerCase().includes('copied')
            ? 'success'
            : message.toLowerCase().includes('required') || message.toLowerCase().includes('fill') || message.toLowerCase().includes('match') || message.toLowerCase().includes('add at least')
              ? 'warning'
              : 'info'
      ) || type
      setDialog({ type: autoType, title, message, isConfirm: false, onConfirm: resolve })
    })
  }, [])

  const showConfirm = useCallback((message, title = '', type = 'warning', confirmLabel = 'Confirm') => {
    return new Promise((resolve) => {
      setDialog({
        type,
        title: title || 'Are you sure?',
        message,
        isConfirm: true,
        confirmLabel,
        cancelLabel: 'Cancel',
        onConfirm: () => resolve(true),
      })
      resolverRef.current = () => resolve(false)
    })
  }, [])

  const handleClose = useCallback(() => {
    resolverRef.current?.(false)
    resolverRef.current = null
    setDialog(null)
  }, [])

  const handleConfirm = useCallback(() => {
    setDialog(null)
  }, [])

  const DialogHost = useCallback(() => (
    <DialogModal
      dialog={dialog}
      onClose={() => {
        resolverRef.current?.(dialog?.isConfirm ? false : true)
        resolverRef.current = null
        setDialog(null)
      }}
    />
  ), [dialog])

  return { alert: showAlert, confirm: showConfirm, DialogHost }
}


export function Badge({ children, color = 'green' }) {
  const colors = {
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-gray-100 text-gray-600',
    orange: 'bg-orange-100 text-orange-700',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  )
}

export function StatCard({ title, value, sub, subColor = 'text-gray-500', icon, iconBg }) {
  return (
    <div className="bg-white rounded-2xl p-5 flex-1 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {sub && <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [list, setList] = useState([
    { id: 1, title: "New MCQ Quiz Live", text: "Mathematics Mid-Term Quiz has been scheduled.", time: "10m ago", read: false },
    { id: 2, title: "Class Assigned", text: "You have been assigned to Grade 7-A Algebra.", time: "2h ago", read: false },
    { id: 3, title: "LMS System Update", text: "Database maintenance is successfully completed.", time: "1d ago", read: true },
    { id: 4, title: "Attendance Notice", text: "Please compile attendance for Grade 8-B classes.", time: "3d ago", read: true },
  ])
  
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const unreadCount = list.filter(n => !n.read).length

  const markAllRead = () => {
    setList(prev => prev.map(n => ({ ...n, read: true })))
  }

  const clearAll = () => {
    setList([])
  }

  const toggleRead = (id) => {
    setList(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-55 cursor-pointer bg-white transition-all outline-none"
      >
        <Icon path={icons.bell} size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-[999] py-3 text-left">
          <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-50">
            <span className="text-xs font-bold text-gray-800">Notifications ({unreadCount})</span>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead} 
                className="text-[10px] text-indigo-600 hover:underline cursor-pointer border-0 bg-transparent font-semibold outline-none"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-60 overflow-y-auto mt-1 divide-y divide-gray-50">
            {list.map((n) => (
              <div 
                key={n.id} 
                onClick={() => toggleRead(n.id)}
                className={`p-3 hover:bg-gray-50/50 cursor-pointer transition-all flex items-start gap-2.5 ${!n.read ? 'bg-indigo-50/30' : ''}`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-indigo-600' : 'bg-transparent'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-1">
                    <p className={`text-xs font-bold truncate ${!n.read ? 'text-gray-800' : 'text-gray-500'}`}>{n.title}</p>
                    <span className="text-[10px] text-gray-400 shrink-0">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-normal">{n.text}</p>
                </div>
              </div>
            ))}
            {list.length === 0 && (
              <div className="py-8 text-center text-xs text-gray-400">
                No notifications
              </div>
            )}
          </div>

          {list.length > 0 && (
            <div className="px-4 pt-2 border-t border-gray-50 text-center">
              <button 
                onClick={clearAll} 
                className="text-[10px] text-red-500 hover:underline cursor-pointer border-0 bg-transparent font-semibold outline-none"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        {action}
      </div>
    </div>
  )
}

export function Input({ label, placeholder, type = 'text', value, onChange }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
    </div>
  )
}

export function Select({ label, placeholder, options = [], value, onChange }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      )}
      <select
        value={value}
        onChange={onChange}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 focus:outline-none bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

export function Btn({ children, onClick, variant = 'primary', icon }) {
  const styles = {
    primary: 'text-white hover:opacity-90 bg-primary',
    outline: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',
  }
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${styles[variant]}`}
    >
      {icon && <Icon path={icons[icon]} size={14} />}
      {children}
    </button>
  )
}
