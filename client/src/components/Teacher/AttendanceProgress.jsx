import React, { useState, useEffect } from "react";
import {
  Search,
  Save,
  UserCheck,
  Calendar,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { api } from "../../services/api";

const AttendanceProgress = ({ studentsList = [], onSave }) => {
  const dummyClasses = [
    "Grade 7-A",
    "Grade 8-B",
    "Grade 6-A",
    "Grade 9-C",
    "Grade 7-B",
  ];

  const dummySubjects = [
    "Mathematics",
    "Algebra",
    "Calculus",
    "Physics",
    "Chemistry",
  ];

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("Grade 7-A");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [savedBanner, setSavedBanner] = useState(null);
  const [dbAttendance, setDbAttendance] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Helper to filter students based on class name parsing
  const getStudentsForClass = (className, fullList) => {
    if (!className || !fullList) return [];
    const classNum = className.match(/\d+/)?.[0];
    const classLetter = className.split('-')[1]?.trim().toLowerCase();
    return fullList.filter(s => {
      const sGrade = String(s.grade || '').trim();
      const sSection = String(s.section || '').trim().toLowerCase();
      const isGradeMatch = sGrade === classNum || sGrade.includes(classNum);
      const isSectionMatch = sSection === classLetter || sGrade.toLowerCase().includes(`-${classLetter}`);
      return isGradeMatch && isSectionMatch;
    });
  };

  // Fetch existing attendance records from the database whenever date changes
  useEffect(() => {
    const fetchExistingAttendance = async () => {
      setLoadingAttendance(true);
      try {
        const res = await api.getAttendance(currentDate);
        if (res && res.success) {
          setDbAttendance(res.attendance || []);
        }
      } catch (err) {
        console.error("Error fetching existing attendance:", err);
      } finally {
        setLoadingAttendance(false);
      }
    };
    fetchExistingAttendance();
  }, [currentDate]);

  // Sync state with studentsList prop, class selection, and dbAttendance
  useEffect(() => {
    if (studentsList && studentsList.length > 0) {
      // 1. Filter students to only those in the selected class
      const classStudents = getStudentsForClass(selectedClass, studentsList);

      // 2. Map and set the attendance status based on dbAttendance
      const mapped = classStudents.map(s => {
        // Find matching record in dbAttendance
        const match = dbAttendance.find(att => att.STUDENTID === s.id || att.studentId === s.id);
        const savedStatus = match?.STATUS || match?.status;
        const isRealStatus = ["Present", "Absent", "Late", "Leave"].includes(savedStatus);
        const attStatus = isRealStatus ? savedStatus : "Present";

        return {
          id: s.id,
          rollNo: s.rollNo,
          name: s.name,
          status: attStatus,
          mark: attStatus === "Absent" ? "A" : attStatus === "Late" ? "L" : attStatus === "Leave" ? "LV" : "P"
        };
      });

      setStudents(mapped);
    } else {
      setStudents([]);
    }
  }, [studentsList, selectedClass, dbAttendance]);

  const handleStatusChange = (id, status) => {
    setStudents(
      students.map((student) =>
        student.id === id
          ? {
              ...student,
              status,
              mark:
                status === "Present"
                  ? "P"
                  : status === "Absent"
                    ? "A"
                    : status === "Late"
                      ? "L"
                      : status === "Leave"
                        ? "LV"
                        : "P",
            }
          : student,
      ),
    );
  };

  const handleMarkChange = (id, mark) => {
    setStudents(
      students.map((student) =>
        student.id === id
          ? {
              ...student,
              mark,
              status:
                mark === "P"
                  ? "Present"
                  : mark === "A"
                    ? "Absent"
                    : mark === "L"
                      ? "Late"
                      : mark === "LV"
                        ? "Leave"
                        : "Present",
            }
          : student,
      ),
    );
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const presentCount = students.filter((s) => s.status === "Present").length;
  const totalCount = students.length;

  const handleSaveAttendance = async () => {
    if (!onSave) return;
    const success = await onSave(students, currentDate, selectedClass, selectedSubject);
    if (success) {
      setSavedBanner(`Attendance saved! Present: ${presentCount}/${totalCount}`);
      // Refresh local attendance from DB to ensure state is in sync
      try {
        const res = await api.getAttendance(currentDate);
        if (res && res.success) {
          setDbAttendance(res.attendance || []);
        }
      } catch (err) {
        console.error("Error refreshing attendance:", err);
      }
      setTimeout(() => setSavedBanner(null), 3500);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
      {savedBanner && (
        <div className="mb-4 flex items-center gap-3 px-5 py-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <span className="text-sm font-semibold">{savedBanner}</span>
        </div>
      )}
      <div>
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Mark Today's Attendance
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Record attendance for your class
          </p>
        </div>

        {/* Class Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Class</p>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="text-sm font-semibold text-gray-700 bg-transparent border-0 p-0 focus:ring-0 cursor-pointer w-full outline-none"
                >
                  {dummyClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Subject</p>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="text-sm font-semibold text-gray-700 bg-transparent border-0 p-0 focus:ring-0 cursor-pointer w-full outline-none"
                >
                  {dummySubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Date</p>
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="text-sm font-semibold text-gray-700 bg-transparent border-0 p-0 focus:ring-0 cursor-pointer w-full outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Present Count Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Attendance Summary</p>
                <p className="text-2xl font-bold text-gray-800">
                  Present: <span className="text-blue-600">{presentCount}</span>{" "}
                  / {totalCount}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Attendance Rate</p>
              <p className="text-xl font-bold text-blue-600">
                {totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(0) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mark
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loadingAttendance ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-550 font-medium">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-gray-500">Loading saved attendance from Oracle Database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.rollNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {["Present", "Absent", "Late", "Leave"].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleStatusChange(student.id, st)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border-0 cursor-pointer ${
                              student.status === st
                                ? st === "Present"
                                  ? "bg-green-100 text-green-700 border border-green-300"
                                  : st === "Absent"
                                    ? "bg-red-100 text-red-700 border border-red-300"
                                    : st === "Late"
                                      ? "bg-purple-100 text-purple-700 border border-purple-300"
                                      : "bg-amber-100 text-amber-700 border border-amber-300"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {["P", "A", "L", "LV"].map((mark) => (
                          <button
                            key={mark}
                            onClick={() => handleMarkChange(student.id, mark)}
                            className={`w-8 h-8 rounded-md text-sm font-semibold transition-colors border-0 cursor-pointer ${
                              student.mark === mark
                                ? mark === "P"
                                  ? "bg-green-500 text-white"
                                  : mark === "A"
                                    ? "bg-red-500 text-white"
                                    : mark === "L"
                                      ? "bg-purple-500 text-white"
                                      : "bg-amber-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {mark}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loadingAttendance && filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveAttendance}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm border-0 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Attendance
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceProgress;
