import { useState, useEffect } from "react";
import { api } from "../../services/api";
import SharedSidebar from "../../components/Sidebar";
import ProfilePage from "../ProfilePage";
import { useDialog } from "../../components/UI";
import ParentExamGrades from "./ParentExamGrades";
import MessagesPage from "../MessagesPage";
import Header from "../../components/Header";
import { PageLoader } from "../../components/NotificationSystem";


// ─── DATA & PALETTES ─────────────────────────────────────────────────────────

const avatarPalettes = [
  "bg-[#6C63FF]",
  "bg-[#FF6584]",
  "bg-[#43B89C]",
  "bg-[#F59E0B]",
  "bg-[#3B82F6]",
];

const notices = [
  { id: 1, title: "Annual Sports Day", date: "June 20" },
  { id: 2, title: "Parent-Teacher Meeting", date: "June 15" },
  { id: 3, title: "Term 1 Exam Schedule", date: "June 10" },
  { id: 4, title: "Science Exhibition", date: "June 25" },
];

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getDaysInMonth(month, year = 2026) {
  const m = months.indexOf(month);
  return new Date(year, m + 1, 0).getDate();
}

function getFirstDayOfMonth(month, year = 2026) {
  const m = months.indexOf(month);
  return new Date(year, m, 1).getDay();
}

const statusClasses = {
  Active: "bg-[#E6F9F1] text-[#22A06B]",
  Paid: "bg-[#E6F9F1] text-[#22A06B]",
  Pending: "bg-[#FFF4E5] text-[#E5890A]",
  Overdue: "bg-[#FDECEA] text-[#D93025]",
};

function StatusBadge({ status }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", statusClasses[status] || "bg-neutral-100 text-neutral-600")}>
      {status}
    </span>
  );
}

const fieldBaseClass = "w-full rounded-lg border px-3 py-2.5 text-[13px] text-[#1e1b4b] outline-none";
const fieldClass = (hasError) => cn(fieldBaseClass, hasError ? "border-[#D93025]" : "border-gray-200");

function SidebarIcon({ name }) {
  const base = "w-4 h-4";
  switch (name) {
    case "dashboard":
      return <svg className={base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
    case "children":
      return <svg className={base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
    case "accounts":
      return <svg className={base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    case "attendance":
      return <svg className={base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    case "examGrades":
      return <svg className={base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    case "messages":
      return (
        <svg className={base} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      );
    default:
      return null;
  }
}


// ─── TOP BAR ─────────────────────────────────────────────────────────────────

function TopBar({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-[#1e1b4b]">{title}</h1>
        {subtitle && <p className="text-sm text-[#888] mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, iconBg = "bg-[#EEF2FF]" }) {
  return (
    <section className="flex min-w-[180px] flex-1 items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4">
      <div>
        <div className="mb-0.5 text-xs text-[#888]">{label}</div>
        <div className="text-[22px] font-bold text-[#1e1b4b]">{value}</div>
        {sub && <div className="mt-0.5 text-[11px] text-[#22A06B]">{sub}</div>}
      </div>
      <div className={cn("ml-auto flex h-[38px] w-[38px] items-center justify-center rounded-[10px] text-lg", iconBg)}>{icon}</div>
    </section>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-[460px] max-w-full overflow-y-auto rounded-[14px] bg-white p-7 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="m-0 text-lg font-bold text-[#1e1b4b]">{title}</h2>
          <button type="button" onClick={onClose} className="cursor-pointer border-0 bg-transparent text-xl text-[#888]">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── PAGE: DASHBOARD ─────────────────────────────────────────────────────────

function DashboardPage({ onMenuClick, children, parentName }) {
  const avgAttendance = children.length ? Math.round(children.reduce((s, c) => s + c.attendance, 0) / children.length) : 0;

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} title="Parent Dashboard" subtitle={`Welcome back, ${parentName || 'Parent'}! Here's an overview of your children.`} />

      <div className="mb-6 flex flex-wrap gap-4">
        <StatCard label="Total Children" value={children.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
        <StatCard label="Avg Attendance" value={`${avgAttendance}%`} sub="+2% this month" icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} iconBg="bg-[#D1FAE5]" />
        <StatCard label="Total Subjects" value="12" icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} iconBg="bg-[#FCE7F3]" />
      </div>

      <div className="flex gap-5">
        <section className="flex-[2] rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 mt-0 text-[15px] font-bold text-[#1e1b4b]">Children Overview</h3>
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                {["NAME", "CLASS", "SECTION", "ROLL NO", "ATTENDANCE", "STATUS"].map((h) => (
                  <th key={h} className="px-2.5 py-2 text-left text-[11px] font-semibold text-[#888]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {children.map((child) => (
                <tr key={child.id} className="border-b border-[#f9f9f9]">
                  <td className="px-2.5 py-2.5 font-semibold text-[#1e1b4b]">{child.name}</td>
                  <td className="px-2.5 py-2.5 text-[#555]">{child.grade}</td>
                  <td className="px-2.5 py-2.5 text-[#555]">{child.section}</td>
                  <td className="px-2.5 py-2.5 text-[#555]">{child.rollNo}</td>
                  <td className="px-2.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <progress
                        value={child.attendance}
                        max="100"
                        className={cn(
                          "attendance-progress h-1.5 w-[60px] overflow-hidden rounded-full",
                          child.attendance >= 90 ? "attendance-progress-good" : "attendance-progress-warn"
                        )}
                      />
                      <span className="text-xs text-[#555]">{child.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-2.5 py-2.5">
                    <StatusBadge status={child.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="flex-1 rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 mt-0 text-[15px] font-bold text-[#1e1b4b]">Recent Notices</h3>
          {notices.map((notice) => (
            <div key={notice.id} className="mb-4 flex items-start gap-2.5">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#6C63FF]" />
              <div>
                <div className="text-[13px] font-semibold text-[#1e1b4b]">{notice.title}</div>
                <div className="text-[11px] text-[#888]">{notice.date}</div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

// ─── PAGE: MY CHILDREN ───────────────────────────────────────────────────────

function MyChildrenPage({ onMenuClick, children, onAddChild }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", grade: "", section: "", dob: "", gender: "Male", rollNo: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.grade.trim()) e.grade = "Grade is required";
    if (!form.section.trim()) e.section = "Section is required";
    if (!form.dob) e.dob = "Date of birth is required";
    if (!form.rollNo.trim()) e.rollNo = "Roll number is required";
    return e;
  };

  const handleAdd = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    onAddChild({
      name: form.name,
      grade: form.grade,
      section: form.section,
      rollNo: form.rollNo,
      dob: form.dob,
      gender: form.gender
    });

    setShowModal(false);
    setForm({ name: "", grade: "", section: "", dob: "", gender: "Male", rollNo: "" });
    setErrors({});
  };

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} title="My Children" subtitle="View and manage your children's profiles.">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-[#6C63FF] px-4 py-2 text-[13px] font-semibold text-white"
        >
          + Add Child
        </button>
      </TopBar>

      <div className="flex flex-wrap gap-5">
        {children.map((child) => (
          <section key={child.id} className="w-[260px] shrink-0 rounded-[14px] border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-full text-base font-bold text-white", child.avatarClass || avatarPalettes[child.id % avatarPalettes.length] || avatarPalettes[0])}>
                {child.initials}
              </div>
              <div>
                <div className="text-[15px] font-bold text-[#1e1b4b]">{child.name}</div>
                <div className="text-xs text-[#888]">
                  {child.grade}-{child.section}
                </div>
              </div>
            </div>

            {[["Roll No", child.rollNo], ["Date of Birth", child.dob], ["Gender", child.gender], ["GPA", child.gpa], ["Attendance", `${child.attendance}%`]].map(([key, value]) => (
              <div key={key} className="mb-2 flex justify-between text-[13px]">
                <span className="text-[#888]">{key}</span>
                <span className={cn(key === "Attendance" && "font-semibold", key === "Attendance" && child.attendance >= 90 ? "text-[#22A06B]" : "text-[#1e1b4b]")}>
                  {value}
                </span>
              </div>
            ))}

            <div className="mb-3 flex justify-between text-[13px]">
              <span className="text-[#888]">Status</span>
              <StatusBadge status={child.status} />
            </div>

            <div className="flex gap-2 border-t border-[#f0f0f0] pt-3">
              <button type="button" className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-white p-2 text-xs text-[#555] flex items-center justify-center gap-1.5 hover:bg-slate-50 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Email
              </button>
              <button type="button" className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-white p-2 text-xs text-[#555] flex items-center justify-center gap-1.5 hover:bg-slate-50 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Call
              </button>
            </div>
          </section>
        ))}
      </div>

      {showModal && (
        <Modal title="Add New Child" onClose={() => { setShowModal(false); setErrors({}); }}>
          {[
            { label: "Full Name", key: "name", type: "text", placeholder: "e.g. John Doe" },
            { label: "Grade", key: "grade", type: "text", placeholder: "e.g. Grade 7" },
            { label: "Section", key: "section", type: "text", placeholder: "e.g. A" },
            { label: "Roll Number", key: "rollNo", type: "text", placeholder: "e.g. 07-A-15" },
            { label: "Date of Birth", key: "dob", type: "date", placeholder: "" },
          ].map((field) => (
            <div key={field.key} className="mb-3.5">
              <label className="mb-1 block text-xs font-semibold text-[#555]">{field.label}</label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                className={fieldClass(errors[field.key])}
              />
              {errors[field.key] && <div className="mt-1 text-[11px] text-[#D93025]">{errors[field.key]}</div>}
            </div>
          ))}

          <div className="mb-5">
            <label className="mb-1 block text-xs font-semibold text-[#555]">Gender</label>
            <select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} className={fieldClass(false)}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => { setShowModal(false); setErrors({}); }}
              className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-white p-2.5 font-semibold text-[#555]"
            >
              Cancel
            </button>
            <button type="button" onClick={handleAdd} className="flex-1 cursor-pointer rounded-lg border-0 bg-[#6C63FF] p-2.5 font-semibold text-white">
              Add Child
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── PAGE: CHILDREN ACCOUNTS ─────────────────────────────────────────────────

function ChildrenAccountsPage({ onMenuClick, children }) {
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editEmail, setEditEmail] = useState("");

  const filtered = children.filter((child) => child.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} title="Children Accounts" subtitle="Manage account credentials for your children." />

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 relative max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-450 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search children..."
            className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-[13px] text-[#1e1b4b] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
          />
        </div>

        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-gray-200 bg-[#f9fafb]">
              {["#", "CHILD NAME", "USERNAME", "CLASS", "EMAIL", "LAST LOGIN", "STATUS", "ACTIONS"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-[#888]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((child, index) => (
              <tr key={child.id} className="border-b border-[#f0f0f0]">
                <td className="px-3 py-3 text-[#888]">{index + 1}</td>
                <td className="px-3 py-3 font-semibold text-[#1e1b4b]">{child.name}</td>
                <td className="px-3 py-3 text-[#555]">{child.username}</td>
                <td className="px-3 py-3 text-[#555]">
                  {child.grade}-{child.section}
                </td>
                <td className="px-3 py-3 text-[#555]">
                  {editId === child.id ? (
                    <input
                      value={editEmail}
                      onChange={(event) => setEditEmail(event.target.value)}
                      className="rounded-md border border-[#6C63FF] px-2 py-1 text-[13px] outline-none"
                    />
                  ) : (
                    child.email
                  )}
                </td>
                <td className="px-3 py-3 text-[#555]">{child.lastLogin}</td>
                <td className="px-3 py-3">
                  <StatusBadge status={child.status} />
                </td>
                <td className="px-3 py-3">
                  {editId === child.id ? (
                    <button type="button" onClick={() => setEditId(null)} className="cursor-pointer border-0 bg-transparent text-[13px] font-semibold text-[#22A06B]">
                      Save
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setEditId(child.id); setEditEmail(child.email); }}
                      className="cursor-pointer border-0 bg-transparent text-[13px] font-semibold text-[#6C63FF]"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-[#888]">
                  No children found for "{search}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}



// ─── PAGE: CHILDREN ATTENDANCE ───────────────────────────────────────────────

function AttendancePage({ onMenuClick, children, attendanceData }) {
  const [selectedChild, setSelectedChild] = useState(children[0]?.name || "");
  const [selectedMonth, setSelectedMonth] = useState("June");
  const [childOpen, setChildOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);

  const data = attendanceData[selectedChild]?.[selectedMonth] || {};
  const daysCount = getDaysInMonth(selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedMonth);
  const presentCount = Object.values(data).filter((v) => v === "present" || v === "present").length;
  const absentCount = Object.values(data).filter((v) => v === "absent").length;
  const leaveCount = Object.values(data).filter((v) => v === "leave").length;
  const lateCount = Object.values(data).filter((v) => v === "late").length;

  const cellClass = {
    present: "bg-[#D1FAE5] text-[#065F46]",
    absent: "bg-[#FEE2E2] text-[#991B1B]",
    leave: "bg-[#FEF3C7] text-[#92400E]",
    late: "bg-purple-100 text-purple-800",
  };
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} title="Children Attendance" subtitle="Track attendance records for your children." />

      <div className="mb-5 flex gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => { setChildOpen(!childOpen); setMonthOpen(false); }}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-[13px] text-[#1e1b4b]"
          >
            {selectedChild} <span>▾</span>
          </button>
          {childOpen && (
            <div className="absolute left-0 top-full z-10 min-w-40 rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
              {children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => { setSelectedChild(child.name); setChildOpen(false); }}
                  className={cn(
                    "block w-full cursor-pointer px-3.5 py-2.5 text-left text-[13px] border-0",
                    selectedChild === child.name ? "bg-[#6C63FF] text-white" : "bg-white text-[#1e1b4b] hover:bg-gray-100"
                  )}
                >
                  {child.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => { setMonthOpen(!monthOpen); setChildOpen(false); }}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-[13px] text-[#1e1b4b]"
          >
            {selectedMonth} <span>▾</span>
          </button>
          {monthOpen && (
            <div className="absolute left-0 top-full z-10 min-w-[130px] rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
              {["January", "February", "March", "April", "May", "June"].map((month) => (
                <button
                  key={month}
                  type="button"
                  onClick={() => { setSelectedMonth(month); setMonthOpen(false); }}
                  className={cn(
                    "block w-full cursor-pointer px-3.5 py-2.5 text-left text-[13px] border-0",
                    selectedMonth === month ? "bg-[#6C63FF] text-white" : "bg-white text-[#1e1b4b] hover:bg-gray-100"
                  )}
                >
                  {month}
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
          <section key={label} className="flex-1 rounded-xl border border-gray-200 bg-white p-5 text-center">
            <div className={cn("text-[32px] font-extrabold", color)}>{value}</div>
            <div className="text-[13px] text-[#888]">{label}</div>
          </section>
        ))}
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 mt-0 text-[15px] font-bold text-[#1e1b4b]">
          {selectedMonth} Attendance — {selectedChild}
        </h3>

        <div className="grid grid-cols-7 gap-1.5">
          {dayLabels.map((day) => (
            <div key={day} className="pb-1.5 text-center text-xs font-semibold text-[#888]">
              {day}
            </div>
          ))}

          {Array.from({ length: firstDay }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {Array.from({ length: daysCount }).map((_, index) => {
            const day = index + 1;
            const status = data[day];
            return (
              <div
                key={day}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg text-[13px]",
                  status ? `${cellClass[status]} font-bold` : "bg-[#f9fafb] font-normal text-[#bbb]"
                )}
              >
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
            ["Late", "bg-purple-100", "border-purple-600/20"],
          ].map(([label, bg, border]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={cn("h-3.5 w-3.5 rounded-[3px] border", bg, border)} />
              <span className="text-xs text-[#888]">{label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── PAGE: EXAM GRADES ────────────────────────────────────────────────────────

function ExamGradesPage({ onMenuClick, children }) {
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id || "");
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [childOpen, setChildOpen] = useState(false);
  const [termOpen, setTermOpen] = useState(false);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedChild = children.find(c => c.id === selectedChildId);

  useEffect(() => {
    if (selectedChildId) {
      const fetchGrades = async () => {
        setLoading(true);
        try {
          const res = await api.getStudentGrades(selectedChildId);
          if (res.success) {
            setGrades(res.grades || []);
          }
        } catch (err) {
          console.error("Error loading grades:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchGrades();
    }
  }, [selectedChildId]);

  const filteredGrades = grades.filter(g => g.term === selectedTerm);

  const termsList = ["Term 1", "Term 2", "Term 3"];

  return (
    <div>
      <TopBar onMenuClick={onMenuClick} title="Exam Grades" subtitle="View your children's term exam results and report cards." />

      <div className="mb-5 flex gap-3">
        {/* Child Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setChildOpen(!childOpen); setTermOpen(false); }}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-[13px] text-[#1e1b4b] font-medium"
          >
            {selectedChild?.name || "Select Child"} <span className="text-gray-400">▾</span>
          </button>
          {childOpen && (
            <div className="absolute left-0 top-full z-10 min-w-[200px] rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
              {children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => { setSelectedChildId(child.id); setChildOpen(false); }}
                  className={cn(
                    "block w-full cursor-pointer px-3.5 py-2.5 text-left text-[13px] border-0 outline-none",
                    selectedChildId === child.id ? "bg-[#6C63FF] text-white font-semibold" : "bg-white text-[#1e1b4b] hover:bg-gray-150"
                  )}
                >
                  {child.name} ({child.grade}-{child.section})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Term Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setTermOpen(!termOpen); setChildOpen(false); }}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-[13px] text-[#1e1b4b] font-medium"
          >
            {selectedTerm} <span className="text-gray-400">▾</span>
          </button>
          {termOpen && (
            <div className="absolute left-0 top-full z-10 min-w-[130px] rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
              {termsList.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setSelectedTerm(t); setTermOpen(false); }}
                  className={cn(
                    "block w-full cursor-pointer px-3.5 py-2.5 text-left text-[13px] border-0 outline-none",
                    selectedTerm === t ? "bg-[#6C63FF] text-white font-semibold" : "bg-white text-[#1e1b4b] hover:bg-gray-150"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5">
          <div>
            <h3 className="m-0 text-base font-extrabold text-[#1e1b4b]">
              Written Exam Report Card — {selectedTerm}
            </h3>
            <p className="m-0 mt-1 text-xs text-gray-500">
              Official term grading report for {selectedChild?.name || 'student'}.
            </p>
          </div>
          {selectedChild && (
            <div className="flex gap-4 text-xs font-semibold bg-gray-50/80 px-4 py-2.5 rounded-xl border border-gray-150">
              <div>
                <span className="text-gray-450 mr-1.5">Class:</span>
                <span className="text-[#1e1b4b]">{selectedChild.grade}-{selectedChild.section}</span>
              </div>
              <div className="w-px bg-gray-200" />
              <div>
                <span className="text-gray-450 mr-1.5">Roll No:</span>
                <span className="text-[#1e1b4b]">{selectedChild.rollNo}</span>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <span className="text-xs text-gray-400 italic animate-pulse">Loading grades data...</span>
          </div>
        ) : filteredGrades.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/40 p-6">
            <span className="text-lg mb-2">📋</span>
            <p className="text-xs text-gray-400 italic text-center m-0">No exam grade records found for {selectedTerm}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold text-gray-400 uppercase">
                  <th className="py-3 text-left">Subject</th>
                  <th className="py-3 text-left">Exam Name</th>
                  <th className="py-3 text-left">Exam Date</th>
                  <th className="py-3 text-center w-28">Score</th>
                  <th className="py-3 text-center w-24">Letter Grade</th>
                  <th className="py-3 text-left">Teacher's Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[13px]">
                {filteredGrades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-slate-50/40">
                    <td className="py-3.5 font-bold text-[#1e1b4b]">{grade.subject}</td>
                    <td className="py-3.5 text-[#555] font-semibold">{grade.examName}</td>
                    <td className="py-3.5 text-[#888] font-mono">{grade.examDate}</td>
                    <td className="py-3.5 text-center font-bold text-[#1e1b4b]">
                      {grade.marks} <span className="text-xs text-gray-400 font-normal">/ {grade.totalMarks}</span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={cn(
                        "inline-block px-2.5 py-0.5 rounded text-[11px] font-bold",
                        grade.grade.includes('A') 
                          ? "bg-emerald-50 text-emerald-700" 
                          : grade.grade === 'F' 
                            ? "bg-rose-50 text-rose-700" 
                            : "bg-indigo-50 text-indigo-700"
                      )}>
                        {grade.grade}
                      </span>
                    </td>
                    <td className="py-3.5 text-[#666] italic text-xs">
                      {grade.remarks || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export default function ParentDashboard({ onRoleChange, currentUser }) {
  const [page, setPage] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [children, setChildren] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const { alert, DialogHost } = useDialog();

  const [parentsList, setParentsList] = useState([]);
  const [activeParent, setActiveParent] = useState(currentUser);

  const parentId = activeParent?.id || activeParent?.ID || currentUser?.id || 1;

  const fetchData = async () => {
    try {
      const data = await api.getParentData(parentId);
      setChildren(data.children || []);
      setAttendanceData(data.attendanceData || {});
      setLoading(false);
    } catch (err) {
      console.error("Error loading parent data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [parentId]);

  useEffect(() => {
    const loadParents = async () => {
      try {
        const users = await api.getUsersList();
        const parents = users.filter(u => (u.ROLE || u.role) === 'Parent');
        setParentsList(parents);
      } catch (err) {
        console.error("Error loading parents:", err);
      }
    };
    loadParents();
  }, []);

  const handleAddChild = async (childForm) => {
    try {
      await api.addChild({ ...childForm, parentId });
      fetchData();
    } catch (err) {
      await alert("Error adding child: " + err.message, "error", "Error");
    }
  };

  const renderPage = () => {
    if (loading) {
      return <PageLoader message="Fetching children records from Oracle database..." />;
    }


    const pageProps = { onMenuClick: () => setIsSidebarOpen(true) };

    switch (page) {
      case "dashboard":
        return <DashboardPage {...pageProps} children={children} parentName={activeParent?.name || currentUser?.name} />;
      case "children":
        return <MyChildrenPage {...pageProps} children={children} onAddChild={handleAddChild} />;
      case "accounts":
        return <ChildrenAccountsPage {...pageProps} children={children} />;
      case "attendance":
        return <AttendancePage {...pageProps} children={children} attendanceData={attendanceData} />;
      case "examGrades":
        return <ParentExamGrades children={children} />;
      case "messages":
        return <MessagesPage currentUser={currentUser} />;
      case "profile":
        return <ProfilePage currentUser={activeParent} />;
      default:
        return <DashboardPage {...pageProps} children={children} parentName={activeParent?.name || currentUser?.name} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f5fb] font-sans text-[#1e1b4b] w-full relative">
      <DialogHost />
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
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
          portalTitle="Parent Portal"
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

