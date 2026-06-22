import {
  FaGraduationCap,  
  FaTachometerAlt,
  FaClipboardCheck,
  FaChalkboardTeacher,
  FaBookOpen,
  FaCalendarAlt,
  FaUserCircle,
} from "react-icons/fa";

function Sidebar() {
  return (
    <div className="w-72 min-h-screen bg-[#08033a] text-white p-6 flex flex-col">

      <div className="mb-8 flex items-center gap-3">
  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#636af3]">
    <FaGraduationCap className="text-xl text-white" />
  </div>

  <div>
    <h1 className="text-xl font-bold text-white">
      EduManage
    </h1>

    <p className="text-xs text-gray-400">
      School System
    </p>
  </div>
</div>

      <div className="grid grid-cols-2 gap-2 mb-8">
        <button className="rounded-lg py-2 text-sm hover:bg-[#5235f5]">
  Parent
</button>

        <button className="bg-[#5235f5] text-white rounded-lg py-2 text-sm font-semibold">
  Teacher
</button>

        <button className="rounded-lg py-2 text-sm hover:bg-[#5235f5]">
          Admin
       </button>

        <button className="rounded-lg py-2 text-sm hover:bg-[#5235f5]">
  Library
</button>
      </div>

      <div className="space-y-2">

        <div className="flex items-center gap-3 bg-[#5235f5] p-3 rounded-lg">
          <FaTachometerAlt />
          <span>Dashboard</span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#5235f5]">
          <FaClipboardCheck />
          <span>Attendance</span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#5235f5]">
          <FaChalkboardTeacher />
          <span>My Classes</span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#5235f5]">
          <FaBookOpen />
          <span>Grades & Marks</span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#5235f5]">
          <FaCalendarAlt />
          <span>My Timetable</span>
        </div>

      </div>

      <div className="mt-auto flex items-center gap-3 pt-8 border-t border-[#4274fd]">

        <FaUserCircle size={42} />

        <div>
          <h4 className="font-medium">John Doe</h4>
          <p className="text-sm text-gray-300">Teacher</p>
        </div>

      </div>
    </div>
  );
}

export default Sidebar;