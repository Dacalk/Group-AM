import React, { useState } from "react";
import {
  Search,
  Save,
  UserCheck,
  Calendar,
  BookOpen,
  Users,
} from "lucide-react";

const AttendanceProgress = () => {
  // Dummy Data
  const dummyStudents = [
    {
      id: 1,
      rollNo: "07A-01",
      name: "Alice Johnson",
      status: "Present",
      mark: "P",
    },
    {
      id: 2,
      rollNo: "07A-02",
      name: "Bob Williams",
      status: "Present",
      mark: "P",
    },
    {
      id: 3,
      rollNo: "07A-03",
      name: "Carol Davis",
      status: "Present",
      mark: "P",
    },
    {
      id: 4,
      rollNo: "07A-04",
      name: "David Miller",
      status: "Present",
      mark: "P",
    },
    {
      id: 5,
      rollNo: "07A-05",
      name: "Eva Martinez",
      status: "Present",
      mark: "P",
    },
    {
      id: 6,
      rollNo: "07A-06",
      name: "Frank Brown",
      status: "Present",
      mark: "P",
    },
  ];

  const dummyClasses = [
    "Grade 7-A",
    "Grade 8-B",
    "Grade 6-A",
    "Grade 9-C",
    "Grade 7-B",
    "Grade 10-A",
    "Grade 8-A",
  ];

  const dummySubjects = [
    "Mathematics",
    "Algebra",
    "Calculus",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "History",
  ];

  const [students, setStudents] = useState(dummyStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("Grade 7-A");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [currentDate, setCurrentDate] = useState("2026-06-12");

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
                mark === "P" ? "Present" : mark === "A" ? "Absent" : "Late",
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

  const handleSaveAttendance = () => {
    alert(
      `Attendance saved successfully!\nPresent: ${presentCount}/${totalCount}`,
    );
    console.log("Saved attendance data:", students);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
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
              <div>
                <p className="text-xs text-gray-500">Class</p>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="text-sm font-semibold text-gray-700 bg-transparent border-0 p-0 focus:ring-0 cursor-pointer"
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
              <div>
                <p className="text-xs text-gray-500">Subject</p>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="text-sm font-semibold text-gray-700 bg-transparent border-0 p-0 focus:ring-0 cursor-pointer"
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
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="text-sm font-semibold text-gray-700 bg-transparent border-0 p-0 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Present Count Banner */}
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-100">
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
                {((presentCount / totalCount) * 100).toFixed(0)}%
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
            <table className="min-w-full divide-y divide-gray-200">
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
                {filteredStudents.map((student, index) => (
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
                        <button
                          onClick={() =>
                            handleStatusChange(student.id, "Present")
                          }
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            student.status === "Present"
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-gray-100 text-gray-600 hover:bg-green-50"
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(student.id, "Absent")
                          }
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            student.status === "Absent"
                              ? "bg-red-100 text-red-700 border border-red-300"
                              : "bg-gray-100 text-gray-600 hover:bg-red-50"
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, "Late")}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            student.status === "Late"
                              ? "bg-amber-100 text-amber-700 border border-amber-300"
                              : "bg-gray-100 text-gray-600 hover:bg-amber-50"
                          }`}
                        >
                          Late
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {["P", "A", "L"].map((mark) => (
                          <button
                            key={mark}
                            onClick={() => handleMarkChange(student.id, mark)}
                            className={`w-8 h-8 rounded-md text-sm font-semibold transition-colors ${
                              student.mark === mark
                                ? mark === "P"
                                  ? "bg-green-500 text-white"
                                  : mark === "A"
                                    ? "bg-red-500 text-white"
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
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveAttendance}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
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
