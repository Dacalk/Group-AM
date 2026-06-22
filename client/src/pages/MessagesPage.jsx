import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────

// (We now query the database directly instead of localstorage)

// ─── ROLE CONFIG ──────────────────────────────────────────────────────────────

const ROLE_COLORS = {
  Admin: { bg: 'bg-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-50', badge: 'bg-indigo-100 text-indigo-700' },
  Teacher: { bg: 'bg-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
  Parent: { bg: 'bg-violet-600', text: 'text-violet-600', light: 'bg-violet-50', badge: 'bg-violet-100 text-violet-700' },
  Library: { bg: 'bg-amber-600', text: 'text-amber-600', light: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
  Student: { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
};

// Who each role can message
const ALLOWED_RECIPIENTS = {
  Admin: ['Teacher', 'Parent', 'Library', 'Student'],
  Teacher: ['Admin', 'Teacher', 'Parent', 'Student'],
  Parent: ['Admin', 'Teacher'],
  Library: ['Admin'],
  Student: ['Admin', 'Teacher'],
};

function getRoleColor(role) {
  return ROLE_COLORS[role] || ROLE_COLORS['Admin'];
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function formatFullTime(ts) {
  return new Date(ts).toLocaleString([], {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────

function Avatar({ name, role, size = 'md' }) {
  const colors = getRoleColor(role);
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sizeClass} ${colors.bg} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {getInitials(name)}
    </div>
  );
}

// ─── COMPOSE MODAL ────────────────────────────────────────────────────────────

function ComposeModal({ currentUser, recipients, onSend, onClose }) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const allowedRoles = ALLOWED_RECIPIENTS[currentUser?.role] || [];
  const filtered = recipients.filter(r => {
    const rRole = r.ROLE || r.role;
    return allowedRoles.includes(rRole) && (r.NAME || r.name || '').toLowerCase().includes(search.toLowerCase());
  });

  const selectedRecipient = recipients.find(r => String(r.USER_ID) === to);

  const handleSend = () => {
    if (!to) { setError('Please select a recipient.'); return; }
    if (!subject.trim()) { setError('Subject cannot be empty.'); return; }
    if (!body.trim()) { setError('Message body cannot be empty.'); return; }
    onSend({ to, subject: subject.trim(), body: body.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-gray-800">New Message</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer border-0 bg-transparent transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Recipient Search */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">To</label>
            {selectedRecipient ? (
              <div className="flex items-center gap-2 p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                <Avatar name={selectedRecipient.NAME || selectedRecipient.name} role={selectedRecipient.ROLE || selectedRecipient.role} size="sm" />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-800">{selectedRecipient.NAME || selectedRecipient.name}</span>
                  <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getRoleColor(selectedRecipient.ROLE || selectedRecipient.role).badge}`}>
                    {selectedRecipient.ROLE || selectedRecipient.role}
                  </span>
                </div>
                <button onClick={() => setTo('')} className="text-gray-400 hover:text-gray-600 cursor-pointer border-0 bg-transparent text-lg leading-none">×</button>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search recipients..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                {search && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filtered.length === 0 ? (
                      <p className="p-3 text-xs text-gray-400 text-center">No recipients found</p>
                    ) : filtered.map(r => {
                      const rId = String(r.USER_ID);
                      const rName = r.NAME;
                      const rRole = r.ROLE;
                      return (
                        <button
                          key={rId}
                          onClick={() => { setTo(rId); setSearch(''); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 text-left cursor-pointer border-0 bg-transparent transition-all"
                        >
                          <Avatar name={rName} role={rRole} size="sm" />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{rName}</p>
                            <p className={`text-[10px] font-bold ${getRoleColor(rRole).text}`}>{rRole}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Enter subject..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Message</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Type your message here..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none leading-relaxed"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}
        </div>

        <div className="px-6 pb-5 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold cursor-pointer bg-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold cursor-pointer border-0 transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN MESSAGES PAGE ───────────────────────────────────────────────────────

export default function MessagesPage({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [selectedConvKey, setSelectedConvKey] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState('inbox'); // 'inbox' | 'chat'
  const [confirmDelete, setConfirmDelete] = useState(null); // null | 'conv' | msgId
  const chatEndRef = useRef(null);

  const myId = String(currentUser?.id || currentUser?.userId || 'me');
  const myRole = currentUser?.role;
  const myName = currentUser?.name || 'Me';

  const fetchMessages = () => {
    api.getMessages()
      .then(data => setMessages(data || []))
      .catch(err => console.error("Error loading messages:", err));
  };

  // Load messages from Database
  useEffect(() => {
    fetchMessages();
  }, []);

  // Load all users for recipient picker — uses dedicated PL/SQL-backed endpoint
  useEffect(() => {
    api.getRecipients().then(users => {
      // Filter out self; USER_ID is always present from /messages/recipients
      setRecipients(users.filter(u => String(u.USER_ID) !== myId));
    }).catch(() => {
      setRecipients([]);
    });
  }, [myId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConvKey, messages]);

  // ── Derived: conversations grouped by convKey ─────────────────────────────

  // A "convKey" uniquely identifies a thread between two users on a subject.
  const myMessages = messages.filter(m => m.toId === myId || m.toId === 'all' || m.fromId === myId);

  const convMap = {};
  myMessages.forEach(m => {
    if (!convMap[m.convKey]) convMap[m.convKey] = [];
    convMap[m.convKey].push(m);
  });

  // Sort convs by latest message
  const conversations = Object.entries(convMap)
    .map(([key, msgs]) => {
      const latest = msgs[msgs.length - 1];
      const unread = msgs.filter(m => m.toId === myId || m.toId === 'all').filter(m => !m.read).length;
      const other = msgs.find(m => m.fromId !== myId);
      return { key, msgs, latest, unread, other };
    })
    .sort((a, b) => b.latest.timestamp - a.latest.timestamp)
    .filter(conv => {
      if (!search) return true;
      return (
        conv.latest.subject.toLowerCase().includes(search.toLowerCase()) ||
        conv.latest.fromName.toLowerCase().includes(search.toLowerCase())
      );
    });

  const selectedConv = selectedConvKey ? convMap[selectedConvKey] || [] : [];
  const selectedLatest = selectedConv[selectedConv.length - 1];

  // ── Actions ───────────────────────────────────────────────────────────────

  // ── Actions ───────────────────────────────────────────────────────────────

  const markRead = (convKey) => {
    api.markMessagesRead(convKey, myId)
      .then(() => fetchMessages())
      .catch(err => console.error("Error marking read:", err));
  };

  const handleSelectConv = (key) => {
    setSelectedConvKey(key);
    markRead(key);
    setMobileView('chat');
  };

  const handleSend = ({ to, subject, body }) => {
    const recipient = recipients.find(r => String(r.USER_ID) === to);
    if (!recipient) return;
    const convKey = `${myId}__${to}__${subject}`;
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      fromId: myId,
      fromName: myName,
      fromRole: myRole,
      toId: to,
      toName: recipient.NAME,
      toRole: recipient.ROLE,
      subject,
      body,
      timestamp: Date.now(),
      read: false,
      convKey,
    };
    api.sendMessage(msg)
      .then(() => {
        fetchMessages();
        setSelectedConvKey(convKey);
        setMobileView('chat');
      })
      .catch(err => console.error("Error sending message:", err));
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedLatest) return;
    const otherPartyId = selectedLatest.fromId === myId ? selectedLatest.toId : selectedLatest.fromId;
    const otherPartyName = selectedLatest.fromId === myId ? selectedLatest.toName : selectedLatest.fromName;
    const otherPartyRole = selectedLatest.fromId === myId ? selectedLatest.toRole : selectedLatest.fromRole;
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      fromId: myId,
      fromName: myName,
      fromRole: myRole,
      toId: otherPartyId,
      toName: otherPartyName,
      toRole: otherPartyRole,
      subject: selectedLatest.subject,
      body: replyText.trim(),
      timestamp: Date.now(),
      read: false,
      convKey: selectedConvKey,
    };
    api.sendMessage(msg)
      .then(() => {
        fetchMessages();
        setReplyText('');
      })
      .catch(err => console.error("Error sending reply:", err));
  };

  // ── Delete actions ────────────────────────────────────────────────────────

  const handleDeleteConv = () => {
    api.deleteConversation(selectedConvKey)
      .then(() => {
        fetchMessages();
        setSelectedConvKey(null);
        setMobileView('inbox');
        setConfirmDelete(null);
      })
      .catch(err => console.error("Error deleting conversation:", err));
  };

  const handleDeleteMsg = (msgId) => {
    api.deleteMessage(msgId)
      .then(() => {
        fetchMessages();
        setConfirmDelete(null);
        const remaining = messages.filter(m => m.id !== msgId && m.convKey === selectedConvKey);
        if (remaining.length === 0) {
          setSelectedConvKey(null);
          setMobileView('inbox');
        }
      })
      .catch(err => console.error("Error deleting message:", err));
  };

  const totalUnread = myMessages.filter(m => (m.toId === myId || m.toId === 'all') && !m.read).length;

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            Messages
            {totalUnread > 0 && (
              <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">{totalUnread}</span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Communicate with staff across the system</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl cursor-pointer border-0 transition-all shadow-md shadow-indigo-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Compose
        </button>
      </div>

      {/* Main Messaging Area */}
      <div className="flex flex-1 gap-5 min-h-0" style={{ height: 'calc(100vh - 220px)' }}>
        {/* ── Inbox Panel ──────────────────────────────────────────────────── */}
        <div className={`
          flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden
          ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
          w-full md:w-80 lg:w-96 flex-shrink-0
        `}>
          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-gray-50"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-700">No conversations yet</p>
                <p className="text-xs text-gray-400 mt-1">Compose a message to get started</p>
                <button
                  onClick={() => setShowCompose(true)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl cursor-pointer border-0 hover:bg-indigo-700 transition-all"
                >
                  + New Message
                </button>
              </div>
            ) : conversations.map(conv => {
              const isActive = conv.key === selectedConvKey;
              const otherName = conv.latest.fromId === myId ? conv.latest.toName : conv.latest.fromName;
              const otherRole = conv.latest.fromId === myId ? conv.latest.toRole : conv.latest.fromRole;
              return (
                <button
                  key={conv.key}
                  onClick={() => handleSelectConv(conv.key)}
                  className={`w-full flex items-start gap-3 p-4 text-left cursor-pointer border-0 outline-none transition-all ${
                    isActive ? 'bg-indigo-50 border-r-2 border-r-indigo-600' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <Avatar name={otherName} role={otherRole} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={`text-sm font-bold truncate ${isActive ? 'text-indigo-700' : 'text-gray-800'}`}>{otherName}</span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{formatTime(conv.latest.timestamp)}</span>
                    </div>
                    <p className={`text-xs font-semibold truncate ${conv.unread > 0 ? 'text-gray-800' : 'text-gray-500'}`}>
                      {conv.latest.subject}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {conv.latest.fromId === myId ? 'You: ' : ''}{conv.latest.body}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${getRoleColor(otherRole).badge}`}>{otherRole}</span>
                      {conv.unread > 0 && (
                        <span className="text-[10px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">{conv.unread}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Conversation Panel ──────────────────────────────────────────────── */}
        <div className={`
          flex-1 flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden min-w-0
          ${mobileView === 'inbox' ? 'hidden md:flex' : 'flex'}
        `}>
          {selectedConvKey && selectedLatest ? (
            <>
              {/* Thread Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
                <button
                  onClick={() => setMobileView('inbox')}
                  className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-gray-200 cursor-pointer border-0 bg-transparent transition-all"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {(() => {
                  const otherName = selectedLatest.fromId === myId ? selectedLatest.toName : selectedLatest.fromName;
                  const otherRole = selectedLatest.fromId === myId ? selectedLatest.toRole : selectedLatest.fromRole;
                  return (
                    <>
                      <Avatar name={otherName} role={otherRole} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-800 truncate">{otherName}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${getRoleColor(otherRole).badge}`}>{otherRole}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{selectedLatest.subject}</p>
                      </div>
                      {/* Delete Conversation Button */}
                      <button
                        onClick={() => setConfirmDelete('conv')}
                        title="Delete conversation"
                        className="ml-auto p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer border-0 bg-transparent transition-all flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  );
                })()}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {selectedConv.map((msg) => {
                  const isMe = msg.fromId === myId;
                  return (
                    <div key={msg.id} className={`flex items-end gap-2.5 group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isMe && <Avatar name={msg.fromName} role={msg.fromRole} size="sm" />}
                      <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}>
                          {msg.body}
                        </div>
                        <div className={`flex items-center gap-2 mt-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className="text-[10px] text-gray-400">{formatFullTime(msg.timestamp)}</span>
                          {/* Per-message delete — appears on hover */}
                          <button
                            onClick={() => setConfirmDelete(msg.id)}
                            title="Delete this message"
                            className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer border-0 bg-transparent transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-end gap-3">
                  <Avatar name={myName} role={myRole} size="sm" />
                  <div className="flex-1 relative">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleReply();
                        }
                      }}
                      placeholder="Type a reply… (Enter to send, Shift+Enter for new line)"
                      rows={2}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none bg-white"
                    />
                    <button
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                      className="absolute right-3 bottom-3 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center cursor-pointer border-0 transition-all"
                    >
                      <svg className="w-3.5 h-3.5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-5 shadow-sm">
                <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-700">Select a conversation</h3>
              <p className="text-sm text-gray-400 mt-1.5 max-w-xs leading-relaxed">
                Choose a conversation from your inbox, or compose a new message to connect with staff.
              </p>
              <button
                onClick={() => setShowCompose(true)}
                className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl cursor-pointer border-0 transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Compose Message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeModal
          currentUser={currentUser}
          recipients={recipients}
          onSend={handleSend}
          onClose={() => setShowCompose(false)}
        />
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Icon */}
            <div className="flex flex-col items-center pt-8 pb-4 px-6">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-800 text-center">
                {confirmDelete === 'conv' ? 'Delete Conversation?' : 'Delete Message?'}
              </h3>
              <p className="text-sm text-gray-500 mt-2 text-center leading-relaxed">
                {confirmDelete === 'conv'
                  ? 'This will permanently delete the entire conversation and all its messages. This cannot be undone.'
                  : 'This will permanently delete this message. This cannot be undone.'}
              </p>
            </div>
            {/* Actions */}
            <div className="flex gap-3 px-6 pb-6 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold cursor-pointer bg-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  confirmDelete === 'conv'
                    ? handleDeleteConv()
                    : handleDeleteMsg(confirmDelete)
                }
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold cursor-pointer border-0 transition-all shadow-md shadow-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
