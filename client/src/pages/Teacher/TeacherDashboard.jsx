import { useState, useEffect } from "react";
import { api } from "../../services/api";
import Sidebar from "../../components/Sidebar";
import DashboardStats from "../../components/Teacher/DashboardStats";
import ScheduleTable from "../../components/Teacher/ScheduleTable";
import AttendanceProgress from "../../components/Teacher/AttendanceProgress";
import { QuizPreview, CreateMCQ } from "../QuizPages";
import ProfilePage from "../ProfilePage";
import TeacherExamGrades from "./TeacherExamGrades";
import MessagesPage from "../MessagesPage";
import { Icon, icons } from "../../components/Icons";
import Header from "../../components/Header";
import { FaBook, FaUsers, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { PageLoader } from "../../components/NotificationSystem";


function TeacherDashboard({ onRoleChange, currentUser }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [teachersList, setTeachersList] = useState([]);
  const [activeTeacher, setActiveTeacher] = useState(currentUser);

  const getStudentsForClass = (className) => {
    if (!className) return [];
    const classNum = className.match(/\d+/)?.[0];
    const classLetter = className.split('-')[1]?.trim().toLowerCase();
    return students.filter(s => {
      const sGrade = String(s.grade || '').trim();
      const sSection = String(s.section || '').trim().toLowerCase();
      const isGradeMatch = sGrade === classNum || sGrade.includes(classNum);
      const isSectionMatch = sSection === classLetter || sGrade.toLowerCase().includes(`-${classLetter}`);
      return isGradeMatch && isSectionMatch;
    });
  };

  const fetchTeacherData = async () => {
    try {
      const data = await api.getTeacherData();
      setStats(data.stats);
      setStudents(data.students);
      setWeeklySchedule(data.weeklySchedule);
      setQuizzes(data.quizzes || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching teacher data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const users = await api.getUsersList();
        const teachers = users.filter(u => (u.ROLE || u.role) === 'Teacher');
        setTeachersList(teachers);
      } catch (err) {
        console.error("Error loading teachers:", err);
      }
    };
    loadTeachers();
  }, []);

  const handleSaveAttendance = async (attendanceList, date, className, subject) => {
    try {
      await api.saveAttendance({
        students: attendanceList,
        date,
        className,
        subject
      });
      fetchTeacherData();
      return true;
    } catch (err) {
      console.error("Error saving attendance:", err.message);
      return false;
    }
  };

  const renderContent = () => {
    if (loading) {
      return <PageLoader message="Fetching classroom schedule and student roster from Oracle database..." />;
    }


    switch (activePage) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <DashboardStats stats={stats} />
            <ScheduleTable weeklySchedule={weeklySchedule} />
          </div>
        );
      case "attendance":
        return (
          <AttendanceProgress 
            studentsList={students} 
            onSave={handleSaveAttendance} 
          />
        );
      case "classes":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-2">My Classes Overview</h2>
            <p className="text-sm text-gray-500 mb-6">List of classes assigned to you this term. Click on any card to view roster details and schedules.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Grade 7-A", subject: "Mathematics", room: "Room 101", color: "from-blue-500 to-indigo-600" },
                { name: "Grade 8-B", subject: "Mathematics", room: "Room 105", color: "from-purple-500 to-indigo-600" },
                { name: "Grade 6-A", subject: "Algebra", room: "Room 101", color: "from-teal-500 to-emerald-600" },
                { name: "Grade 9-C", subject: "Calculus", room: "Room 203", color: "from-orange-500 to-rose-600" },
                { name: "Grade 7-B", subject: "Mathematics", room: "Room 101", color: "from-indigo-500 to-purple-600" }
              ].map((cls, i) => {
                const classStudents = getStudentsForClass(cls.name);
                const count = classStudents.length;
                return (
                  <div 
                    key={i} 
                    onClick={() => setSelectedClass({ ...cls, count })}
                    className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                  >
                    <div className={`h-2 bg-gradient-to-r ${cls.color}`} />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-extrabold text-base text-gray-800 group-hover:text-[#5235f5] transition-colors">{cls.name}</h3>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">Active</span>
                      </div>
                      <div className="space-y-2.5 mt-4 text-xs text-gray-600">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center"><FaBook size={12} className="text-indigo-600" /></span>
                          <span><strong>Subject:</strong> {cls.subject}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center"><FaUsers size={12} className="text-purple-600" /></span>
                          <span><strong>Students:</strong> {count} enrolled</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center"><FaMapMarkerAlt size={12} className="text-emerald-600" /></span>
                          <span><strong>Room:</strong> {cls.room}</span>
                        </div>
                      </div>
                      <div className="mt-5 pt-3 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold text-indigo-600 uppercase tracking-wider group-hover:underline">
                        <span>View details</span>
                        <span>→</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedClass && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
                <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-5">
                    <h3 className="text-lg font-extrabold text-gray-800">Class Details: {selectedClass.name}</h3>
                    <button 
                      onClick={() => setSelectedClass(null)}
                      className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer border-0 bg-transparent outline-none font-bold"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3.5 bg-indigo-50/40 border border-indigo-100/30 rounded-xl">
                        <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">Subject</span>
                        <p className="text-sm font-bold text-gray-800 mt-1">{selectedClass.subject}</p>
                      </div>
                      <div className="p-3.5 bg-purple-50/40 border border-purple-100/30 rounded-xl">
                        <span className="text-[11px] font-bold text-purple-500 uppercase tracking-wider">Location / Room</span>
                        <p className="text-sm font-bold text-gray-800 mt-1">{selectedClass.room}</p>
                      </div>
                    </div>

                    {(() => {
                      const classStudents = getStudentsForClass(selectedClass.name);
                      const displayStudents = classStudents.slice(0, 8);
                      const hasMore = classStudents.length > 8;
                      
                      return (
                        <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl space-y-2.5">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Class Roster ({classStudents.length} Students)</h4>
                          {classStudents.length > 0 ? (
                            <>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                {displayStudents.map((student, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-gray-100/40">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 bg-[#5235f5] rounded-full" />
                                      <span className="font-medium">{student.name}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-mono">Roll: {student.rollNo}</span>
                                  </div>
                                ))}
                              </div>
                              {hasMore && (
                                <p className="text-[10px] text-gray-400 text-right italic pt-1">+ {classStudents.length - 8} more students</p>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-gray-500 italic py-2">No students registered in this class.</p>
                          )}
                        </div>
                      );
                    })()}

                    {(() => {
                      const classStudents = getStudentsForClass(selectedClass.name);
                      const totalStudents = classStudents.length;
                      const avgAttendance = totalStudents > 0
                        ? Math.round(classStudents.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) / totalStudents)
                        : 0;

                      return (
                        <div className="p-4 bg-emerald-50/30 border border-emerald-100/30 rounded-xl space-y-2">
                          <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Academic Performance</h4>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-gray-550">Avg Attendance:</span>
                              <span className="font-bold text-emerald-700 ml-1.5">{totalStudents > 0 ? `${avgAttendance}%` : "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-gray-550">Active Students:</span>
                              <span className="font-bold text-emerald-700 ml-1.5">
                                {classStudents.filter(s => s.status === 'ACTIVE').length} / {totalStudents}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {(() => {
                      const classSchedule = [];
                      if (weeklySchedule && weeklySchedule.schedule) {
                        Object.entries(weeklySchedule.schedule).forEach(([timeSlot, days]) => {
                          Object.entries(days).forEach(([day, entry]) => {
                            if (entry && entry.className === selectedClass.name) {
                              classSchedule.push({
                                day,
                                timeSlot,
                                subject: entry.subject,
                                room: entry.room
                              });
                            }
                          });
                        });
                      }

                      return (
                        <div className="p-4 bg-amber-50/30 border border-amber-100/30 rounded-xl space-y-1.5">
                          <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider">Schedule Time</h4>
                          {classSchedule.length > 0 ? (
                            <div className="space-y-1">
                              {classSchedule.map((sched, idx) => (
                                <p key={idx} className="text-xs text-gray-700 font-medium flex items-center gap-1.5">
                                  <FaCalendarAlt size={12} className="text-amber-600" /> {sched.day} — {sched.timeSlot} ({sched.room})
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 italic">No scheduled timetable slots found.</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => setSelectedClass(null)}
                      className="w-full py-2.5 bg-[#5235f5] hover:bg-[#4326e0] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100 cursor-pointer border-0"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "timetable":
        return <ScheduleTable weeklySchedule={weeklySchedule} />;
      case "quizPreview":
        return <QuizPreview setPage={setActivePage} data={{ quizzes }} refreshData={fetchTeacherData} />;
      case "createMcq":
        return <CreateMCQ setPage={setActivePage} refreshData={fetchTeacherData} />;
      case "profile":
        return <ProfilePage currentUser={activeTeacher} />;
      case "messages":
        return <MessagesPage currentUser={currentUser} />;
      case "examGrades":
        return <TeacherExamGrades studentsList={students} />;
      default:
        return <DashboardStats stats={stats} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f5fb] font-sans text-gray-800 w-full relative">
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        currentPage={activePage}
        setCurrentPage={setActivePage}
        onRoleChange={onRoleChange}
        currentUser={currentUser}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          portalTitle="Teacher Portal"
          currentUser={currentUser}
          onNavigateMessages={() => setActivePage("messages")}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}


export default TeacherDashboard;