import { useState, useEffect } from "react";
import { api } from "../../services/api";
import SharedSidebar from "../../components/Sidebar";
import ProfilePage from "../ProfilePage";
import MessagesPage from "../MessagesPage";
import Header from "../../components/Header";
import { PageHeader, Badge, useDialog } from "../../components/UI";
import { PageLoader } from "../../components/NotificationSystem";


// ─── HELPERS ──────────────────────────────────────────────────────────────────

function cn(...classes) { return classes.filter(Boolean).join(" "); }

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
function getDaysInMonth(month, year = new Date().getFullYear()) {
  const m = months.indexOf(month);
  return new Date(year, m + 1, 0).getDate();
}
function getFirstDayOfMonth(month, year = new Date().getFullYear()) {
  const m = months.indexOf(month);
  return new Date(year, m, 1).getDay();
}

const gradeColor = (g) => {
  if (!g) return "bg-gray-100 text-gray-500";
  if (g.startsWith("A")) return "bg-emerald-50 text-emerald-700";
  if (g === "F") return "bg-rose-50 text-rose-700";
  if (g.startsWith("B")) return "bg-blue-50 text-blue-700";
  return "bg-indigo-50 text-indigo-700";
};

const EVENT_COLORS = {
  activity: "#5b5fc7", meeting: "#f97316", holiday: "#3b82f6", exam: "#ef4444"
};

// ─── SHARED STAT CARD ─────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, iconBg = "bg-indigo-50", color = "text-[#1e1b4b]" }) {
  return (
    <div className="flex flex-1 min-w-[160px] items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
      <div>
        <div className="text-xs text-gray-400 font-medium mb-0.5">{label}</div>
        <div className={`text-[22px] font-bold ${color}`}>{value}</div>
        {sub && <div className="mt-0.5 text-[11px] text-emerald-600">{sub}</div>}
      </div>
      <div className={cn("ml-auto flex h-[42px] w-[42px] items-center justify-center rounded-[10px]", iconBg)}>
        {icon}
      </div>
    </div>
  );
}

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="text-lg font-semibold text-gray-400 animate-pulse">Loading your dashboard...</div>
    </div>
  );
}

// ─── ERROR STATE ──────────────────────────────────────────────────────────────

function ErrorState({ message }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <p className="text-base font-semibold text-gray-600">Could not load data</p>
      <p className="text-sm text-gray-400 mt-1">{message}</p>
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState({ emoji = "📋", title = "No data yet", sub }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/40 p-6">
      <span className="text-2xl mb-2">{emoji}</span>
      <p className="text-sm font-semibold text-gray-500">{title}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── DASHBOARD HOME ───────────────────────────────────────────────────────────

function DashboardHome({ student, grades, events }) {
  const recentGrades = grades.slice(0, 6);
  const attendancePct = student?.attendanceRate || 0;

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .slice(0, 4);

  return (
    <div>
      <PageHeader
        title={`Welcome, ${student?.name?.split(' ')[0] || 'Student'}! 👋`}
        subtitle={`Class: ${student?.className || '—'} · Roll No: ${student?.rollNo || '—'}`}
      />

      {/* Stat Cards */}
      <div className="mb-6 flex flex-wrap gap-4">
        <StatCard
          label="Attendance Rate"
          value={`${attendancePct}%`}
          sub={attendancePct >= 90 ? "Excellent!" : attendancePct >= 75 ? "Keep it up" : "Needs improvement"}
          color={attendancePct >= 90 ? "text-emerald-600" : attendancePct >= 75 ? "text-amber-600" : "text-rose-600"}
          iconBg="bg-emerald-50"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          label="Exams Taken"
          value={grades.length}
          iconBg="bg-indigo-50"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatCard
          label="Upcoming Events"
          value={upcomingEvents.length}
          iconBg="bg-amber-50"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Grades */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-base font-bold text-[#1e1b4b] mb-4">Recent Exam Results</h2>
          {recentGrades.length === 0 ? (
            <EmptyState emoji="📋" title="No exam results yet" sub="Your grades will appear here once recorded." />
          ) : (
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase">
                  <th className="py-2 text-left">Subject</th>
                  <th className="py-2 text-left">Exam</th>
                  <th className="py-2 text-left">Term</th>
                  <th className="py-2 text-center">Score</th>
                  <th className="py-2 text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {recentGrades.map((g, i) => (
                  <tr key={g.id || i} className="border-b border-gray-50 hover:bg-slate-50/40">
                    <td className="py-3 font-semibold text-[#1e1b4b]">{g.subject}</td>
                    <td className="py-3 text-gray-500 text-xs">{g.examName}</td>
                    <td className="py-3 text-gray-400 text-xs">{g.term || '—'}</td>
                    <td className="py-3 text-center font-bold text-[#1e1b4b]">
                      {g.marks} <span className="text-xs text-gray-400 font-normal">/ {g.totalMarks}</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={cn("inline-block px-2.5 py-0.5 rounded text-[11px] font-bold", gradeColor(g.grade))}>
                        {g.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-base font-bold text-[#1e1b4b] mb-4">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <EmptyState emoji="🗓️" title="No upcoming events" />
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map(e => (
                <div key={e.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-50 bg-slate-50/50">
                  <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: e.color || EVENT_COLORS[e.type] || '#5b5fc7' }} />
                  <div>
                    <div className="text-[13px] font-semibold text-[#1e1b4b]">{e.title}</div>
                    <div className="text-[11px] text-gray-400">{e.date} {e.time ? `· ${e.time}` : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── GRADES PAGE ──────────────────────────────────────────────────────────────

function GradesPage({ grades }) {
  const [selectedTerm, setSelectedTerm] = useState("All");
  const allTerms = ["All", ...new Set(grades.map(g => g.term).filter(Boolean))];
  const filtered = selectedTerm === "All" ? grades : grades.filter(g => g.term === selectedTerm);

  return (
    <div>
      <PageHeader title="My Exam Grades" subtitle="Your official term exam results and report cards." />
      <div className="mb-5 flex flex-wrap gap-2">
        {allTerms.map(t => (
          <button key={t} type="button" onClick={() => setSelectedTerm(t)}
            className={cn("px-4 py-2 rounded-lg text-[13px] font-semibold border cursor-pointer transition-all",
              selectedTerm === t ? "bg-[#6C63FF] text-white border-[#6C63FF]" : "bg-white text-gray-600 border-gray-200 hover:border-[#6C63FF]/40"
            )}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        {filtered.length === 0 ? (
          <EmptyState emoji="📋" title={`No grade records${selectedTerm !== 'All' ? ` for ${selectedTerm}` : ''}`} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold text-gray-400 uppercase">
                  <th className="py-3 text-left">Subject</th>
                  <th className="py-3 text-left">Exam Name</th>
                  <th className="py-3 text-left">Term</th>
                  <th className="py-3 text-left">Date</th>
                  <th className="py-3 text-center w-28">Score</th>
                  <th className="py-3 text-center w-24">Grade</th>
                  <th className="py-3 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((g, i) => (
                  <tr key={g.id || i} className="hover:bg-slate-50/40">
                    <td className="py-3.5 font-bold text-[#1e1b4b]">{g.subject}</td>
                    <td className="py-3.5 text-gray-600 font-semibold">{g.examName}</td>
                    <td className="py-3.5 text-gray-400 text-xs">{g.term || '—'}</td>
                    <td className="py-3.5 text-gray-400 font-mono text-xs">{g.examDate || '—'}</td>
                    <td className="py-3.5 text-center font-bold text-[#1e1b4b]">
                      {g.marks} <span className="text-xs text-gray-400 font-normal">/ {g.totalMarks}</span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={cn("inline-block px-2.5 py-0.5 rounded text-[11px] font-bold", gradeColor(g.grade))}>
                        {g.grade}
                      </span>
                    </td>
                    <td className="py-3.5 text-gray-500 italic text-xs">{g.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ATTENDANCE PAGE ──────────────────────────────────────────────────────────

function AttendancePage({ student, attendanceMap }) {
  const availableMonths = Object.keys(attendanceMap);
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[availableMonths.length - 1] || months[new Date().getMonth()]);
  const [monthOpen, setMonthOpen] = useState(false);

  const data = attendanceMap[selectedMonth] || {};
  const daysCount = getDaysInMonth(selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedMonth);
  const presentCount = Object.values(data).filter(v => v === "present").length;
  const absentCount = Object.values(data).filter(v => v === "absent").length;
  const leaveCount = Object.values(data).filter(v => v === "leave").length;
  const lateCount = Object.values(data).filter(v => v === "late").length;

  const cellClass = {
    present: "bg-[#D1FAE5] text-[#065F46]",
    absent: "bg-[#FEE2E2] text-[#991B1B]",
    leave: "bg-[#FEF3C7] text-[#92400E]",
    late: "bg-purple-100 text-purple-800",
  };
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const displayMonths = availableMonths.length > 0 ? availableMonths : months.slice(0, 6);

  return (
    <div>
      <PageHeader title="My Attendance" subtitle={`Class: ${student?.className || '—'} · Overall: ${student?.attendanceRate || 0}%`} />

      <div className="mb-5 flex gap-3">
        <div className="relative">
          <button type="button" onClick={() => setMonthOpen(!monthOpen)}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-[13px] text-[#1e1b4b] font-medium shadow-sm">
            {selectedMonth} <span className="text-gray-400">▾</span>
          </button>
          {monthOpen && (
            <div className="absolute left-0 top-full z-10 min-w-[140px] rounded-lg border border-gray-200 bg-white shadow-lg">
              {displayMonths.map(m => (
                <button key={m} type="button" onClick={() => { setSelectedMonth(m); setMonthOpen(false); }}
                  className={cn("block w-full cursor-pointer px-3.5 py-2.5 text-left text-[13px] border-0",
                    selectedMonth === m ? "bg-[#6C63FF] text-white" : "bg-white text-[#1e1b4b] hover:bg-gray-100")}>
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-5 flex gap-4">
        {[
          ["Present", presentCount, "text-[#22A06B]"],
          ["Absent", absentCount, "text-[#EF4444]"],
          ["Leave", leaveCount, "text-[#F59E0B]"],
          ["Late", lateCount, "text-purple-600"]
        ].map(([label, value, color]) => (
          <section key={label} className="flex-1 rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm">
            <div className={cn("text-[32px] font-extrabold", color)}>{value}</div>
            <div className="text-[13px] text-gray-400 mt-1">{label}</div>
          </section>
        ))}
      </div>

      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 mt-0 text-[15px] font-bold text-[#1e1b4b]">{selectedMonth} Attendance</h3>
        {Object.keys(data).length === 0 ? (
          <EmptyState emoji="📅" title="No attendance records for this month" sub="Records will appear here once attendance is taken." />
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1.5">
              {dayLabels.map(d => <div key={d} className="pb-1.5 text-center text-xs font-semibold text-gray-400">{d}</div>)}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysCount }).map((_, i) => {
                const day = i + 1;
                const status = data[day];
                return (
                  <div key={day} className={cn("flex aspect-square items-center justify-center rounded-lg text-[13px]",
                    status ? `${cellClass[status]} font-bold` : "bg-[#f9fafb] font-normal text-[#bbb]")}>
                    {day}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex gap-5">
              {[
                ["Present", "bg-[#D1FAE5]", "border-[#065F46]/20"],
                ["Absent", "bg-[#FEE2E2]", "border-[#991B1B]/20"],
                ["Leave", "bg-[#FEF3C7]", "border-[#92400E]/20"],
                ["Late", "bg-purple-100", "border-purple-600/20"]
              ].map(([label, bg, border]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={cn("h-3.5 w-3.5 rounded-[3px] border", bg, border)} />
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

// ─── LIBRARY PAGE ─────────────────────────────────────────────────────────────

function LibraryPage({ books, myTransactions, studentId, onBorrowSuccess }) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("browse"); // "browse" | "myborrowed"
  const [borrowingId, setBorrowingId] = useState(null);

  const handleBorrow = async (bookTitle) => {
    if (!studentId) return;
    setBorrowingId(bookTitle);
    try {
      await api.borrowBook(bookTitle, studentId);
      if (onBorrowSuccess) {
        await onBorrowSuccess();
      }
    } catch (err) {
      alert("Failed to borrow book: " + err.message);
    } finally {
      setBorrowingId(null);
    }
  };

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="School Library" subtitle="Browse the book collection and view your borrowed books." />

      <div className="mb-5 flex gap-2">
        {[["browse", "Browse Books"], ["myborrowed", "My Borrowed Books"]].map(([key, label]) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={cn("px-4 py-2 rounded-lg text-[13px] font-semibold border cursor-pointer transition-all",
              tab === key ? "bg-[#6C63FF] text-white border-[#6C63FF]" : "bg-white text-gray-600 border-gray-200 hover:border-[#6C63FF]/40")}>
            {label}
          </button>
        ))}
      </div>

      {tab === "browse" && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="mb-4 relative max-w-xs">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or author..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-[13px] text-[#1e1b4b] outline-none focus:border-[#6C63FF]/50 transition-all bg-white" />
          </div>
          {filtered.length === 0 ? (
            <EmptyState emoji="📚" title="No books found" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(b => {
                const activeTx = myTransactions.find(t => t.bookTitle === b.title && (t.status === 'Requested' || t.status === 'Issued'));
                return (
                  <div key={b.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-12 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-md flex items-center justify-center shrink-0 shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-[#1e1b4b] leading-tight line-clamp-2">{b.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{b.author}</p>
                        {b.category && <p className="text-[11px] text-gray-400 mt-0.5">{b.category}</p>}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full w-max",
                          b.available > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600")}>
                          {b.available > 0 ? `Available (${b.available}/${b.totalCopies})` : 'All Copies Issued'}
                        </span>
                      </div>
                      {activeTx ? (
                        <button
                          type="button"
                          disabled
                          className="text-[11px] font-semibold bg-gray-100 text-gray-400 px-3 py-1.5 rounded-lg border-0 cursor-not-allowed shadow-none"
                        >
                          {activeTx.status === 'Requested' ? "Pending Approval" : "Borrowed"}
                        </button>
                      ) : b.available > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleBorrow(b.title)}
                          disabled={borrowingId === b.title}
                          className="text-[11px] font-semibold bg-[#6C63FF] hover:bg-[#5a52e0] disabled:bg-gray-300 text-white px-3 py-1.5 rounded-lg transition-colors border-0 cursor-pointer shadow-sm"
                        >
                          {borrowingId === b.title ? "Borrowing..." : "Borrow"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "myborrowed" && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          {myTransactions.length === 0 ? (
            <EmptyState emoji="📖" title="No borrowed books" sub="Books you borrow will appear here." />
          ) : (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold text-gray-400 uppercase">
                  <th className="py-3 text-left">Book</th>
                  <th className="py-3 text-left">Author</th>
                  <th className="py-3 text-left">Issue Date</th>
                  <th className="py-3 text-left">Due Date</th>
                  <th className="py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {myTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/40">
                    <td className="py-3.5 font-semibold text-[#1e1b4b]">{t.bookTitle}</td>
                    <td className="py-3.5 text-gray-500">{t.author}</td>
                    <td className="py-3.5 text-gray-400 font-mono text-xs">{t.issueDate || '—'}</td>
                    <td className="py-3.5 text-gray-400 font-mono text-xs">{t.dueDate || '—'}</td>
                    <td className="py-3.5 text-center">
                      <span className={cn("inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                        t.status === "Returned" ? "bg-emerald-50 text-emerald-700" :
                        t.status === "Issued" ? "bg-amber-50 text-amber-700" :
                        t.status === "Requested" ? "bg-blue-50 text-blue-700" :
                        t.status === "Rejected" ? "bg-rose-50 text-rose-700" : "bg-gray-50 text-gray-700"
                      )}>
                        {t.status === "Requested" ? "Pending Approval" : t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ─── QUIZ PAGE ────────────────────────────────────────────────────────────────

function QuizPage({ quizzes }) {
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  const submitQuiz = () => {
    let correct = 0;
    activeQuiz.mcqs.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    setScore({ correct, total: activeQuiz.mcqs.length });
    setSubmitted(true);
  };

  if (activeQuiz) {
    return (
      <div>
        <div className="mb-6 flex items-center gap-3">
          <button type="button" onClick={() => setActiveQuiz(null)}
            className="text-[13px] text-[#6C63FF] hover:underline cursor-pointer border-0 bg-transparent font-semibold">
            ← Back to Quizzes
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#1e1b4b] mb-1">{activeQuiz.title}</h2>
          <p className="text-sm text-gray-500 mb-6">{activeQuiz.subject} · {activeQuiz.mcqs.length} questions · {activeQuiz.timeLimit} min</p>

          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">{score.correct === score.total ? '🎉' : score.correct >= score.total / 2 ? '👍' : '📚'}</div>
              <p className="text-2xl font-bold text-[#1e1b4b]">Score: {score.correct} / {score.total}</p>
              <p className="text-sm text-gray-500 mt-2">
                {score.correct === score.total ? 'Perfect score!' : score.correct >= score.total / 2 ? 'Good job!' : 'Keep practising!'}
              </p>
              <div className="mt-6 space-y-3 text-left max-w-xl mx-auto">
                {activeQuiz.mcqs.map((q, i) => {
                  const chosen = answers[q.id];
                  const isCorrect = chosen === q.correctAnswer;
                  return (
                    <div key={q.id} className={cn("p-4 rounded-xl border", isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200")}>
                      <p className="text-[13px] font-semibold text-[#1e1b4b] mb-2">{i + 1}. {q.question}</p>
                      <p className="text-xs text-gray-600">Your answer: <span className="font-bold">{chosen || "Not answered"}</span></p>
                      {!isCorrect && <p className="text-xs text-emerald-700">Correct answer: <span className="font-bold">{q.correctAnswer}</span></p>}
                    </div>
                  );
                })}
              </div>
              <button type="button" onClick={() => setActiveQuiz(null)}
                className="mt-6 px-6 py-2.5 bg-[#6C63FF] text-white rounded-xl text-sm font-semibold cursor-pointer border-0">
                Back to Quizzes
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {activeQuiz.mcqs.map((q, i) => (
                  <div key={q.id} className="border border-gray-100 rounded-xl p-4">
                    <p className="text-[14px] font-semibold text-[#1e1b4b] mb-3">{i + 1}. {q.question}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {['A','B','C','D'].map((letter, idx) => {
                        const opt = q.options[idx];
                        if (!opt) return null;
                        const selected = answers[q.id] === letter;
                        return (
                          <button key={letter} type="button"
                            onClick={() => setAnswers(prev => ({ ...prev, [q.id]: letter }))}
                            className={cn("flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-[13px] cursor-pointer text-left transition-all",
                              selected ? "bg-[#6C63FF] text-white border-[#6C63FF]" : "bg-white text-gray-700 border-gray-200 hover:border-[#6C63FF]/40")}>
                            <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                              selected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500")}>
                              {letter}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button type="button" onClick={submitQuiz}
                  className="px-6 py-2.5 bg-[#6C63FF] text-white rounded-xl text-sm font-semibold cursor-pointer border-0 hover:bg-[#5a52e0] transition-colors">
                  Submit Quiz
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My Quizzes" subtitle="Take interactive quizzes assigned to your class." />
      {quizzes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
          <EmptyState emoji="🧪" title="No quizzes available" sub="Quizzes assigned to your class will appear here." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{quiz.subject}</span>
              </div>
              <h3 className="text-[14px] font-bold text-[#1e1b4b] mb-1">{quiz.title}</h3>
              <p className="text-xs text-gray-400 mb-4">{quiz.mcqs.length} questions · {quiz.timeLimit} min · {quiz.className}</p>
              <button type="button" onClick={() => startQuiz(quiz)}
                className="w-full py-2 bg-[#6C63FF] hover:bg-[#5a52e0] text-white rounded-xl text-[13px] font-semibold cursor-pointer border-0 transition-colors">
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── EVENT CALENDAR PAGE ──────────────────────────────────────────────────────

function EventCalendarPage({ events }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = months[month];
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const formatDateStr = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const eventsByDate = {};
  events.forEach(e => {
    const dateStr = typeof e.date === 'string' ? e.date.slice(0, 10) : '';
    if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
    eventsByDate[dateStr].push(e);
  });

  const selectedDateStr = selectedDate ? formatDateStr(selectedDate.y, selectedDate.m, selectedDate.d) : null;
  const selectedEvents = selectedDateStr ? (eventsByDate[selectedDateStr] || []) : [];

  const typeColors = { activity: "bg-indigo-50 text-indigo-700", meeting: "bg-orange-50 text-orange-700", holiday: "bg-blue-50 text-blue-700", exam: "bg-rose-50 text-rose-700" };

  return (
    <div>
      <PageHeader title="School Calendar" subtitle="Stay updated with upcoming events, exams, and holidays." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar Grid */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#1e1b4b]">{monthName} {year}</h3>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer border-0 bg-transparent text-gray-500 font-bold outline-none">←</button>
              <button type="button" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer border-0 bg-transparent text-gray-500 font-bold outline-none">→</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-400 mb-1">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: totalDays }).map((_, i) => {
              const d = i + 1;
              const dateStr = formatDateStr(year, month, d);
              const hasEvents = !!eventsByDate[dateStr];
              const isSelected = selectedDate?.d === d && selectedDate?.m === month && selectedDate?.y === year;
              const isToday = dateStr === formatDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
              return (
                <button key={d} type="button"
                  onClick={() => setSelectedDate({ y: year, m: month, d })}
                  className={cn("py-2 text-xs font-bold rounded-lg relative cursor-pointer border outline-none flex flex-col items-center justify-center transition-all",
                    isSelected 
                      ? "bg-[#6C63FF] text-white border-[#6C63FF]" 
                      : isToday 
                        ? "bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-100/50 hover:bg-indigo-100/40" 
                        : "bg-transparent text-gray-700 border-transparent hover:bg-gray-100")}
                >
                  <span className="flex items-center gap-1">
                    {d}
                    {isToday && (
                      <span className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-white" : "bg-indigo-600")} />
                    )}
                  </span>
                  {hasEvents && <span className={cn("w-1.5 h-1.5 rounded-full mt-0.5", isSelected ? "bg-white" : "bg-[#6C63FF]")} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events Sidebar */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-base font-bold text-[#1e1b4b] mb-4">
            {selectedDateStr ? `Events on ${selectedDateStr}` : "All Upcoming Events"}
          </h3>
          {selectedDateStr && selectedEvents.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-8">No events on this day.</p>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {(selectedDateStr ? selectedEvents : events.filter(e => new Date(e.date.slice(0,10)) >= new Date())).slice(0, 12).map(e => (
                <div key={e.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-50 bg-slate-50/50 hover:bg-slate-50 transition-all">
                  <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: e.color || EVENT_COLORS[e.type] || '#5b5fc7' }} />
                  <div>
                    <p className="text-[13px] font-semibold text-[#1e1b4b]">{e.title}</p>
                    <p className="text-[11px] text-gray-400">{e.date?.slice(0,10)} {e.time ? `· ${e.time}` : ''}</p>
                    {e.type && (
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block", typeColors[e.type] || "bg-gray-100 text-gray-500")}>
                        {e.type}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {!selectedDateStr && events.filter(e => new Date(e.date?.slice(0,10)) >= new Date()).length === 0 && (
                <EmptyState emoji="🗓️" title="No upcoming events" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TIMETABLE PAGE ───────────────────────────────────────────────────────────

function TimetablePage({ timetable, student }) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayColors = {
    Monday: "bg-indigo-50 text-indigo-700 border-indigo-100",
    Tuesday: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Wednesday: "bg-amber-50 text-amber-700 border-amber-100",
    Thursday: "bg-rose-50 text-rose-700 border-rose-100",
    Friday: "bg-purple-50 text-purple-700 border-purple-100",
  };

  const byDay = {};
  days.forEach(d => { byDay[d] = []; });
  timetable.forEach(t => {
    if (byDay[t.day]) byDay[t.day].push(t);
  });

  return (
    <div>
      <PageHeader title="My Timetable" subtitle={`Class: ${student?.className || '—'}`} />
      {timetable.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
          <EmptyState emoji="📅" title="No timetable data" sub="Your class timetable will appear here once added." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.filter(d => byDay[d].length > 0).map(day => (
            <div key={day} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <h3 className={cn("text-[13px] font-bold px-3 py-1.5 rounded-lg border inline-block mb-3", dayColors[day] || "bg-gray-50 text-gray-600 border-gray-100")}>
                {day}
              </h3>
              <div className="space-y-2">
                {byDay[day].map((slot, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50/50 border border-gray-50">
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5 shrink-0 w-24">{slot.timeSlot}</div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1e1b4b] leading-tight">{slot.subject}</p>
                      <p className="text-[11px] text-gray-400">{slot.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export default function StudentDashboard({ onRoleChange, currentUser }) {
  const [page, setPage] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { DialogHost } = useDialog();

  const fetchAll = async () => {
    try {
      const result = await api.getStudentData(currentUser?.id);
      if (result.success) {
        setData(result);
      } else {
        setError(result.error || 'Failed to load student data.');
      }
    } catch (err) {
      console.error('StudentDashboard fetch error:', err);
      setError(err.message || 'Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) fetchAll();
    else setLoading(false);
  }, [currentUser?.id]);

  const renderPage = () => {
    if (loading) return <PageLoader message="Fetching student records from Oracle database..." />;
    if (error) return <ErrorState message={error} />;


    const student = data?.student;
    const grades = data?.grades || [];
    const attendanceMap = data?.attendanceMap || {};
    const events = data?.events || [];
    const books = data?.books || [];
    const myTransactions = data?.myTransactions || [];
    const quizzes = data?.quizzes || [];
    const timetable = data?.timetable || [];

    switch (page) {
      case "dashboard":    return <DashboardHome student={student} grades={grades} events={events} />;
      case "grades":       return <GradesPage grades={grades} />;
      case "attendance":   return <AttendancePage student={student} attendanceMap={attendanceMap} />;
      case "timetable":    return <TimetablePage timetable={timetable} student={student} />;
      case "library":      return <LibraryPage books={books} myTransactions={myTransactions} studentId={student?.id} onBorrowSuccess={fetchAll} />;
      case "quizzes":      return <QuizPage quizzes={quizzes} />;
      case "calendar":     return <EventCalendarPage events={events} />;
      case "messages":     return <MessagesPage currentUser={currentUser} />;
      case "profile":      return <ProfilePage currentUser={currentUser} />;
      default:             return <DashboardHome student={student} grades={grades} events={events} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f5fb] font-sans text-[#1e1b4b] w-full relative">
      <DialogHost />
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)} />
      )}
      <SharedSidebar
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
          portalTitle="Student Portal"
          currentUser={currentUser}
          onNavigateMessages={() => setPage("messages")}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

