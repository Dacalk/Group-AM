import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { PageHeader, Btn, useDialog } from "../../components/UI";
import { FaSave, FaCalendarAlt, FaSearch, FaAward, FaCheckCircle, FaUserClock, FaExclamationCircle } from "react-icons/fa";

export default function TeacherExamGrades({ studentsList }) {
  const [selectedClass, setSelectedClass] = useState("Grade 7-A");
  const [selectedSubject, setSelectedSubject] = useState("1");
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { alert, DialogHost } = useDialog();

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getAvatarColor = (name) => {
    if (!name) return "bg-gray-100 text-gray-600 border-gray-200";
    const colors = [
      "bg-indigo-50 text-indigo-700 border-indigo-100",
      "bg-emerald-50 text-emerald-700 border-emerald-100",
      "bg-purple-50 text-purple-700 border-purple-100",
      "bg-blue-50 text-blue-700 border-blue-100",
      "bg-amber-50 text-amber-700 border-amber-100",
      "bg-rose-50 text-rose-700 border-rose-100"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Clear search query when class changes
  useEffect(() => {
    setSearchQuery("");
  }, [selectedClass]);

  // New exam fields
  const [newExamName, setNewExamName] = useState("");
  const [newExamDate, setNewExamDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTotalMarks, setNewTotalMarks] = useState("100");

  // Grades entry local draft state
  const [gradesDraft, setGradesDraft] = useState({});

  const classes = ["Grade 6-A", "Grade 7-A", "Grade 7-B", "Grade 8-B", "Grade 9-C"];
  const terms = ["Term 1", "Term 2", "Term 3"];
  const subjectsList = [
    { id: "1", name: "Mathematics" },
    { id: "2", name: "Science" },
    { id: "3", name: "English" },
    { id: "4", name: "History" }
  ];

  const getStudentsForClass = (className) => {
    if (!className) return [];
    const classNum = className.match(/\d+/)?.[0];
    const classLetter = className.split('-')[1]?.trim().toLowerCase();
    return studentsList.filter(s => {
      const sGrade = String(s.grade || '').trim();
      const sSection = String(s.section || '').trim().toLowerCase();
      const isGradeMatch = sGrade === classNum || sGrade.includes(classNum);
      const isSectionMatch = sSection === classLetter || sGrade.toLowerCase().includes(`-${classLetter}`);
      return isGradeMatch && isSectionMatch;
    });
  };

  // Load exams when class, subject, or term changes
  const loadExams = async () => {
    setIsLoading(true);
    try {
      const res = await api.getExams(selectedSubject, selectedClass, selectedTerm);
      if (res.success) {
        setExams(res.exams);
        if (res.exams.length > 0) {
          setSelectedExam(res.exams[0]);
        } else {
          setSelectedExam(null);
        }
      }
    } catch (err) {
      console.error("Error loading exams:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, [selectedClass, selectedSubject, selectedTerm]);

  // Load draft values whenever the selected exam changes
  useEffect(() => {
    if (selectedExam) {
      const initialDraft = {};
      const classStudents = getStudentsForClass(selectedClass);
      classStudents.forEach(student => {
        const recorded = selectedExam.studentGrades[student.id] || {};
        initialDraft[student.id] = {
          marks: recorded.marks !== undefined ? String(recorded.marks) : "",
          grade: recorded.grade || "",
          remarks: recorded.remarks || ""
        };
      });
      setGradesDraft(initialDraft);
    } else {
      setGradesDraft({});
    }
  }, [selectedExam, selectedClass]);

  const handleCreateExam = async () => {
    if (!newExamName.trim() || !newTotalMarks) {
      await alert("Please enter all exam fields.", "warning", "Missing Fields");
      return;
    }

    try {
      const payload = {
        subjectId: Number(selectedSubject),
        examName: newExamName.trim(),
        examDate: newExamDate,
        totalMarks: Number(newTotalMarks),
        term: selectedTerm,
        className: selectedClass
      };

      const res = await api.createExam(payload);
      if (res.success) {
        await alert("Exam created successfully!", "success", "Exam Created");
        setShowCreateExamModal(false);
        setNewExamName("");
        loadExams();
      }
    } catch (err) {
      await alert("Error creating exam: " + err.message, "error", "Error");
    }
  };

  const handleSaveGrades = async () => {
    if (!selectedExam) return;
    setIsSaving(true);
    try {
      const gradesList = Object.entries(gradesDraft).map(([studentId, data]) => ({
        studentId: Number(studentId),
        marks: data.marks !== "" ? Number(data.marks) : 0,
        grade: data.grade.trim() || "F",
        remarks: data.remarks.trim()
      }));

      const res = await api.saveGrades({
        examId: selectedExam.id,
        gradesList
      });

      if (res.success) {
        await alert("Exam grades saved successfully!", "success", "Grades Saved");
        loadExams();
      }
    } catch (err) {
      await alert("Error saving grades: " + err.message, "error", "Save Failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDraftChange = (studentId, field, value) => {
    setGradesDraft(prev => {
      const updated = {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [field]: value
        }
      };

      if (field === "marks" && value !== "") {
        const marksNum = Number(value);
        let letterGrade = "F";
        const maxMarks = selectedExam?.totalMarks || 100;
        const pct = (marksNum / maxMarks) * 100;

        if (pct >= 90) letterGrade = "A+";
        else if (pct >= 80) letterGrade = "A";
        else if (pct >= 70) letterGrade = "B";
        else if (pct >= 60) letterGrade = "C";
        else if (pct >= 50) letterGrade = "D";
        else letterGrade = "F";

        updated[studentId].grade = letterGrade;
      }

      return updated;
    });
  };

  const classStudents = getStudentsForClass(selectedClass);

  // Calculate statistics for the selected exam
  const gradedStudents = classStudents.filter(s => {
    const draft = gradesDraft[s.id];
    return draft && draft.marks !== "";
  });

  const totalEnrolled = classStudents.length;
  const gradedCount = gradedStudents.length;
  const gradingProgress = totalEnrolled > 0 ? Math.round((gradedCount / totalEnrolled) * 100) : 0;

  let classAverage = 0;
  let averagePercent = 0;
  let highestScore = 0;
  let highestStudent = "";
  let lowestScore = selectedExam?.totalMarks || 100;
  let lowestStudent = "";

  if (gradedCount > 0) {
    let sum = 0;
    let maxScore = -1;
    let minScore = 999999;

    gradedStudents.forEach(s => {
      const m = Number(gradesDraft[s.id]?.marks || 0);
      sum += m;
      if (m > maxScore) {
        maxScore = m;
        highestStudent = s.name;
      }
      if (m < minScore) {
        minScore = m;
        lowestStudent = s.name;
      }
    });

    classAverage = (sum / gradedCount).toFixed(1);
    const maxMarks = selectedExam?.totalMarks || 100;
    averagePercent = ((classAverage / maxMarks) * 100).toFixed(1);
    highestScore = maxScore;
    lowestScore = minScore;
  } else {
    lowestScore = 0;
  }

  // Filter students based on search query
  const filteredStudents = classStudents.filter(s => {
    const nameMatch = (s.name || "")?.toLowerCase().includes(searchQuery.toLowerCase());
    const rollMatch = (s.rollNo || s.roll_no || "")?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || rollMatch;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm">
      <DialogHost />
      <PageHeader 
        title="Exam Grades Management" 
        subtitle="Manage written exam records and student grades for each term."
        action={
          <Btn icon="plus" onClick={() => setShowCreateExamModal(true)}>
            New Written Exam
          </Btn>
        }
      />

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100/80 shadow-inner">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Class</label>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-white cursor-pointer"
          >
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Subject</label>
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-white cursor-pointer"
          >
            {subjectsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Term</label>
          <select 
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-white cursor-pointer"
          >
            {terms.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 border-r border-gray-100 pr-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Written Exams</span>
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-extrabold">{exams.length}</span>
          </h3>
          {isLoading ? (
            <div className="py-6 flex items-center justify-center">
              <p className="text-xs text-gray-400 italic animate-pulse">Loading exams...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-xs text-gray-400 italic px-4">No written exams found for this term.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {exams.map(exam => {
                // Calculate completion progress for this specific exam
                const examGradesCount = classStudents.filter(s => {
                  const gr = exam.studentGrades?.[s.id];
                  return gr && gr.marks !== undefined && gr.marks !== null && gr.marks !== "";
                }).length;
                const isExamCompleted = classStudents.length > 0 && examGradesCount === classStudents.length;

                return (
                  <button
                    key={exam.id}
                    onClick={() => setSelectedExam(exam)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group hover:shadow-sm ${
                      selectedExam?.id === exam.id
                        ? "bg-indigo-50/70 border-indigo-200 text-indigo-700 font-bold border-l-4 border-l-primary"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-slate-50/70 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-bold text-gray-800 text-[13.5px] group-hover:text-primary transition-colors pr-12 truncate">{exam.examName}</div>
                    
                    {/* Progress Badge */}
                    <div className="absolute right-3 top-3.5">
                      {isExamCompleted ? (
                        <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold flex items-center gap-0.5 border border-emerald-100">
                          <FaCheckCircle size={8} /> Graded
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold flex items-center gap-0.5 border border-amber-100">
                          <FaUserClock size={8} /> {examGradesCount}/{classStudents.length}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3 text-gray-400 font-medium">
                      <span className="flex items-center gap-1.5 text-[11px]"><FaCalendarAlt size={11} /> {exam.examDate}</span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-[9.5px] font-bold">Max: {exam.totalMarks}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {selectedExam ? (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    {selectedExam.examName}
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">{selectedTerm}</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Enter student marks out of {selectedExam.totalMarks}. Letter grades will calculate automatically.</p>
                </div>
                <button
                  onClick={handleSaveGrades}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:opacity-95 text-white rounded-xl text-xs font-bold transition shadow-sm border-0 cursor-pointer disabled:opacity-50"
                >
                  <FaSave /> {isSaving ? "Saving..." : "Save Exam Grades"}
                </button>
              </div>

              {/* Overview Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-gray-150 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Graded Progress</span>
                  <div className="flex items-end justify-between mt-2.5">
                    <span className="text-lg font-black text-gray-800">{gradedCount} <span className="text-xs font-medium text-gray-400">/ {totalEnrolled}</span></span>
                    <span className="text-xs font-extrabold text-[#5235f5] bg-indigo-50 px-2 py-0.5 rounded-lg">{gradingProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                    <div className="bg-[#5235f5] h-1.5 rounded-full transition-all duration-500" style={{ width: `${gradingProgress}%` }}></div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-4 border border-gray-150 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Class Average</span>
                  <div className="mt-2.5">
                    <span className="text-lg font-black text-gray-800">{classAverage} <span className="text-xs font-medium text-gray-400">/ {selectedExam.totalMarks}</span></span>
                    <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1 font-medium">
                      <FaAward className="text-indigo-400" /> Average: <span className="font-extrabold text-[#5235f5]">{averagePercent}%</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-150 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Highest Score</span>
                  <div className="mt-2.5">
                    <span className="text-lg font-black text-emerald-600">{highestScore} <span className="text-xs font-medium text-gray-400">/ {selectedExam.totalMarks}</span></span>
                    <p className="text-[9.5px] text-gray-500 truncate mt-1.5" title={highestStudent}>
                      By: <span className="font-bold text-gray-700">{highestStudent || "N/A"}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-150 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lowest Score</span>
                  <div className="mt-2.5">
                    <span className="text-lg font-black text-rose-500">{lowestScore} <span className="text-xs font-medium text-gray-400">/ {selectedExam.totalMarks}</span></span>
                    <p className="text-[9.5px] text-gray-500 truncate mt-1.5" title={lowestStudent}>
                      By: <span className="font-bold text-gray-700">{lowestStudent || "N/A"}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Roster Search Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <div className="relative flex-1 max-w-sm">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                    <FaSearch size={12} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search student by name or roll no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none bg-white placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")} 
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="text-[10.5px] text-gray-500 font-semibold flex items-center justify-end px-1">
                  Showing <span className="font-extrabold text-gray-800 mx-1">{filteredStudents.length}</span> of <span className="font-extrabold text-gray-800 mx-1">{classStudents.length}</span> students
                </div>
              </div>

              {classStudents.length === 0 ? (
                <div className="py-12 text-center bg-gray-50/30 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-500 italic">No students enrolled in this class.</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-12 text-center bg-gray-50/30 rounded-2xl border border-dashed border-gray-200">
                  <FaSearch className="text-2xl text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 italic mt-1.5">No students match your search.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                        <th className="py-3.5 px-4">Roll No</th>
                        <th className="py-3.5 px-4">Student</th>
                        <th className="py-3.5 px-4 w-28">Marks</th>
                        <th className="py-3.5 px-4 w-24 text-center">Grade</th>
                        <th className="py-3.5 px-4">Remarks / Comments</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150/70 text-xs">
                      {filteredStudents.map(student => {
                        const draft = gradesDraft[student.id] || { marks: "", grade: "", remarks: "" };
                        
                        // Detect unsaved changes
                        const original = selectedExam.studentGrades[student.id] || {};
                        const originalMarks = original.marks !== undefined && original.marks !== null ? String(original.marks) : "";
                        const originalRemarks = original.remarks || "";
                        const isChanged = draft.marks !== originalMarks || draft.remarks !== originalRemarks;

                        // Check if marks are valid
                        const isOverMax = draft.marks !== "" && Number(draft.marks) > selectedExam.totalMarks;

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="py-3 px-4 font-mono text-[11px] text-gray-400 font-semibold">{student.rollNo || student.roll_no}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10.5px] font-extrabold shadow-sm shrink-0 ${getAvatarColor(student.name)}`}>
                                  {getInitials(student.name)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-extrabold text-gray-800 text-[13.5px] truncate">{student.name}</p>
                                  {isChanged && (
                                    <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded mt-0.5 border border-amber-100 animate-pulse">
                                      Unsaved
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-2 px-4">
                              <div className="flex items-center gap-2">
                                <div className="relative flex items-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max={selectedExam.totalMarks}
                                    placeholder="Marks"
                                    value={draft.marks}
                                    onChange={(e) => handleDraftChange(student.id, "marks", e.target.value)}
                                    className={`w-24 pl-3 pr-9 py-2 border text-xs rounded-xl font-bold focus:outline-none transition-all ${
                                      isOverMax 
                                        ? "border-red-400 bg-red-50 text-red-700 focus:ring-2 focus:ring-red-500/20" 
                                        : "border-gray-200 text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                                    }`}
                                  />
                                  <span className="absolute right-2.5 text-[9px] font-bold text-gray-400 select-none">
                                    /{selectedExam.totalMarks}
                                  </span>
                                </div>
                                {isOverMax && (
                                  <span className="text-red-500 hover:scale-110 transition cursor-help shrink-0" title={`Marks cannot exceed maximum exam marks (${selectedExam.totalMarks}).`}>
                                    <FaExclamationCircle size={14} />
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-4 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-[10.5px] font-bold shadow-sm transition-all border ${
                                draft.grade.includes('A') 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                  : draft.grade === 'B' || draft.grade === 'C'
                                    ? "bg-blue-50 text-blue-700 border-blue-100" 
                                    : draft.grade === 'D'
                                      ? "bg-amber-50 text-amber-700 border-amber-100"
                                      : draft.grade === 'F'
                                        ? "bg-rose-50 text-rose-700 border-rose-100"
                                        : "bg-gray-50 text-gray-400 border-dashed border-gray-300"
                              }`}>
                                {draft.grade || "Pending"}
                              </span>
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="text"
                                placeholder="remarks e.g. Excellent work"
                                value={draft.remarks}
                                onChange={(e) => handleDraftChange(student.id, "remarks", e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-700 placeholder-gray-300 transition-all font-medium"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-64 items-center justify-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/40">
              <FaAward className="text-3xl text-gray-300 mb-2.5" />
              <p className="text-xs text-gray-400 italic">Select an exam on the left, or click "New Written Exam" to create one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Exam Modal */}
      {showCreateExamModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-base font-bold text-gray-800">Add Written Exam</h3>
              <button 
                onClick={() => setShowCreateExamModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer border-0 bg-transparent font-bold outline-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Exam Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mid-Term Written Paper"
                  value={newExamName}
                  onChange={(e) => setNewExamName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none bg-white font-medium text-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Date</label>
                  <input
                    type="date"
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none bg-white font-medium text-gray-700 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Total Marks</label>
                  <input
                    type="number"
                    value={newTotalMarks}
                    onChange={(e) => setNewTotalMarks(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none bg-white font-medium text-gray-700"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateExamModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateExam}
                className="px-5 py-2.5 bg-primary hover:opacity-95 text-white rounded-xl text-xs font-bold cursor-pointer transition border-0"
              >
                Create Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
