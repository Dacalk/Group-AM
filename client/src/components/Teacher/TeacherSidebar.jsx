import {
  FaGraduationCap,  
  FaTachometerAlt,
  FaClipboardCheck,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaUserCircle,
  FaClipboardList,
  FaPenSquare,
  FaSignOutAlt,
  FaEnvelope,
} from "react-icons/fa";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function TeacherSidebar({ activePage, setActivePage, onRoleChange, currentUser, teachersList, onTeacherSelect, isOpen, onClose }) {
  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { key: "attendance", label: "Attendance", icon: <FaClipboardCheck /> },
    { key: "classes", label: "My Classes", icon: <FaChalkboardTeacher /> },
    { key: "timetable", label: "My Timetable", icon: <FaCalendarAlt /> },
    { key: "quizPreview", label: "Quizzes", icon: <FaClipboardList /> },
    { key: "examGrades", label: "Exam Grades", icon: <FaPenSquare /> },
    { key: "messages", label: "Messages", icon: <FaEnvelope /> },
    { key: "profile", label: "My Profile", icon: <FaUserCircle /> },
  ];

  return (
    <aside className={cn(
      "w-72 min-h-screen bg-[#08033a] text-white p-6 flex flex-col fixed z-[100] transition-transform duration-300",
      isOpen ? "translate-x-0" : "-translate-x-full",
      "md:translate-x-0"
    )}>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#636af3]">
          <FaGraduationCap className="text-xl text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">EduManage</h1>
          <p className="text-xs text-gray-400">School System</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-gray-400/50 px-2 pb-2 uppercase tracking-widest">
          Teacher Portal
        </p>

        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setActivePage(item.key);
              if (onClose) onClose();
            }}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-all border-0 outline-none text-left cursor-pointer",
              activePage === item.key || (item.key === 'quizPreview' && activePage === 'createMcq')
                ? "bg-[#5235f5] text-white font-semibold"
                : "bg-transparent text-gray-300 hover:bg-white/5 hover:text-white"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-8 border-t border-[#4274fd]">
        <div className="flex items-center gap-3">
          {currentUser?.avatarClass ? (
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs", currentUser.avatarClass)}>
              {currentUser.initials}
            </div>
          ) : (
            <FaUserCircle size={42} className="text-gray-300" />
          )}
          <div>
            <h4 className="font-medium text-sm">{currentUser?.name || "Ms. Johnson"}</h4>
            <p className="text-xs text-gray-300">Teacher</p>
          </div>
        </div>
        <button
          onClick={() => onRoleChange(null)}
          className="w-full mt-2 text-center text-xs py-1.5 rounded-md text-red-300 hover:text-white bg-red-900/30 hover:bg-red-800/50 transition border-0 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default TeacherSidebar;