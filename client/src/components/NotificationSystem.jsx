/**
 * NotificationSystem.jsx
 * 
 * Provides:
 *  1. <NotificationBell> — header icon with unread count badge + dropdown list
 *  2. <ToastContainer>  — bottom-left toast pop-ups for unread messages on login
 *  3. <LoginSplash>     — full-screen animated loading screen while logging in
 *  4. <PageLoader>      — spinner/skeleton shown while a page fetches data
 *  5. useNotifications  — hook that polls for unread messages
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatTime(ts) {
  const d = new Date(ts);
  const diffMs = Date.now() - d;
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(diffMs / 3600000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return d.toLocaleDateString();
}

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

const ROLE_BG = {
  Admin: 'bg-indigo-500', Teacher: 'bg-emerald-500',
  Parent: 'bg-violet-500', Library: 'bg-amber-500', Student: 'bg-blue-500',
};

// ─── HOOK: useNotifications ───────────────────────────────────────────────────

export function useNotifications(currentUser) {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const myId = String(currentUser?.id || '');

  const fetchMessages = useCallback(async () => {
    if (!myId) return;
    try {
      const data = await api.getMessages();
      const mine = (data || []).filter(m =>
        m.toId === myId || m.toId === 'all' || m.fromId === myId
      );
      setMessages(mine);
      const unread = mine.filter(m => (m.toId === myId || m.toId === 'all') && !m.read);
      setUnreadCount(unread.length);
    } catch (err) {
      console.warn('Notification poll failed:', err.message);
    }
  }, [myId]);

  // Fetch on mount + poll every 60 seconds
  useEffect(() => {
    fetchMessages();
    const id = setInterval(fetchMessages, 60000);
    return () => clearInterval(id);
  }, [fetchMessages]);

  return { messages, unreadCount, refresh: fetchMessages };
}

// ─── NOTIFICATION BELL ────────────────────────────────────────────────────────

export function NotificationBell({ currentUser, onNavigateMessages }) {
  const { messages, unreadCount, refresh } = useNotifications(currentUser);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const myId = String(currentUser?.id || '');

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Only show received messages in dropdown
  const received = messages
    .filter(m => m.toId === myId || m.toId === 'all')
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 8);

  const unreadItems = received.filter(m => !m.read);

  const markAllRead = async () => {
    if (unreadItems.length === 0) return;
    const convKeys = [...new Set(unreadItems.map(m => m.convKey))];
    await Promise.all(convKeys.map(k => api.markMessagesRead(k, myId).catch(() => {})));
    refresh();
  };

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open) markAllRead();
  };

  const handleGoToMessages = () => {
    setOpen(false);
    if (onNavigateMessages) onNavigateMessages();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 cursor-pointer transition-all outline-none"
        title="Messages"
      >
        {/* Bell icon */}
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-gray-200 shadow-xl z-[200] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">Messages</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadCount} new</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleGoToMessages}
              className="text-[11px] text-indigo-600 font-semibold hover:underline cursor-pointer border-0 bg-transparent"
            >
              View All →
            </button>
          </div>

          {/* Message list */}
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {received.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-400">No messages yet</p>
              </div>
            ) : (
              received.map(msg => {
                const isUnread = !msg.read;
                return (
                  <button
                    key={msg.id}
                    type="button"
                    onClick={handleGoToMessages}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left cursor-pointer border-0 outline-none transition-all ${isUnread ? 'bg-indigo-50/60 hover:bg-indigo-50' : 'bg-white hover:bg-gray-50'}`}
                  >
                    {/* Sender avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${ROLE_BG[msg.fromRole] || 'bg-gray-400'}`}>
                      {getInitials(msg.fromName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[12px] font-bold text-gray-800 truncate">{msg.fromName}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">{formatTime(msg.timestamp)}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-600 truncate">{msg.subject}</p>
                      <p className="text-[11px] text-gray-400 truncate">{msg.body}</p>
                    </div>
                    {isUnread && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {received.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={handleGoToMessages}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer border-0 transition-colors"
              >
                Open Messages
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TOAST CONTAINER ──────────────────────────────────────────────────────────

export function ToastContainer({ currentUser }) {
  const [toasts, setToasts] = useState([]);
  const shownIds = useRef(new Set());
  const myId = String(currentUser?.id || '');

  useEffect(() => {
    if (!myId) return;

    const showNewMessages = async () => {
      try {
        const data = await api.getMessages();
        const unread = (data || []).filter(m =>
          (m.toId === myId || m.toId === 'all') && !m.read && !shownIds.current.has(m.id)
        ).sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);

        unread.forEach(msg => {
          shownIds.current.add(msg.id);
          const toastId = `${msg.id}-${Date.now()}`;
          setToasts(prev => [...prev, { ...msg, toastId }]);
          // Auto dismiss after 6 seconds
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.toastId !== toastId));
          }, 6000);
        });
      } catch { /* silent */ }
    };

    // Show on mount (login event)
    const timer = setTimeout(showNewMessages, 1200);
    return () => clearTimeout(timer);
  }, [myId]);

  const dismiss = (toastId) => setToasts(prev => prev.filter(t => t.toastId !== toastId));

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9000] flex flex-col-reverse gap-2 max-w-xs">
      {toasts.map(toast => (
        <div
          key={toast.toastId}
          className="flex items-start gap-3 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 animate-slide-up"
          style={{ animation: 'slideUp 0.35s cubic-bezier(.175,.885,.32,1.275) both' }}
        >
          {/* Sender avatar */}
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm ${ROLE_BG[toast.fromRole] || 'bg-gray-400'}`}>
            {getInitials(toast.fromName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide">New Message</span>
            </div>
            <p className="text-[13px] font-bold text-gray-800 leading-tight truncate">{toast.fromName}</p>
            <p className="text-[11px] font-semibold text-gray-500 truncate">{toast.subject}</p>
            <p className="text-[11px] text-gray-400 truncate mt-0.5">{toast.body}</p>
          </div>
          <button
            type="button"
            onClick={() => dismiss(toast.toastId)}
            className="shrink-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 cursor-pointer border-0 text-sm leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── LOGIN SPLASH SCREEN ──────────────────────────────────────────────────────

export function LoginSplash({ userName, role }) {
  const roleColors = {
    Admin: '#6366f1', Teacher: '#10b981', Parent: '#8b5cf6',
    Library: '#f59e0b', Student: '#3b82f6',
  };
  const color = roleColors[role] || '#6366f1';

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}
    >
      {/* Animated rings */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute w-24 h-24 rounded-full border-2 border-white/10 animate-ping" style={{ animationDuration: '1.5s' }} />
        <div className="absolute w-16 h-16 rounded-full border-2 border-white/20 animate-ping" style={{ animationDuration: '1s', animationDelay: '0.3s' }} />
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl" style={{ background: color }}>
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">EduManage</h1>
      <p className="text-white/60 text-sm mb-8">
        Welcome back, <span className="text-white font-semibold">{userName}</span>
      </p>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            background: color,
            animation: 'loadBar 1.4s ease-in-out forwards',
          }}
        />
      </div>
      <p className="text-white/40 text-xs mt-4 animate-pulse">Loading your {role} portal…</p>

      <style>{`
        @keyframes loadBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

// ─── PAGE LOADER ──────────────────────────────────────────────────────────────

export function PageLoader({ message = 'Loading data…' }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] select-none">
      {/* Spinner */}
      <div className="relative w-14 h-14 mb-5">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500"
          style={{ animation: 'spin 0.85s linear infinite' }}
        />
        <div className="absolute inset-2 rounded-full bg-indigo-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>

      {/* Skeleton cards */}
      <div className="w-full max-w-2xl px-6 space-y-3">
        {[100, 75, 90, 60].map((w, i) => (
          <div
            key={i}
            className="h-3 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
            style={{
              width: `${w}%`,
              animation: 'shimmer 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`,
              backgroundSize: '200% 100%',
            }}
          />
        ))}
      </div>

      <p className="text-sm text-gray-400 font-medium mt-6 animate-pulse">{message}</p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </div>
  );
}

// ─── SKELETON CARD ────────────────────────────────────────────────────────────

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-100 rounded mb-2" style={{ width: `${[100, 80, 60][i % 3]}%` }} />
      ))}
    </div>
  );
}
