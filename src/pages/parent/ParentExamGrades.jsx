import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/UI";
import { FaChartBar } from "react-icons/fa";

export default function ParentExamGrades({ children }) {
  const [selectedChild, setSelectedChild] = useState(children[0] || null);
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const terms = ["Term 1", "Term 2", "Term 3"];

  const loadGrades = async () => {
    if (!selectedChild) return;
    setIsLoading(true);
    try {
      const res = await api.getStudentGrades(selectedChild.id);
      if (res.success) {
        const filtered = res.grades.filter(g => g.term === selectedTerm);
        setGrades(filtered);
      }
    } catch (err) {
      console.error("Error loading grades:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGrades();
  }, [selectedChild, selectedTerm]);

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm mb-6">
      <PageHeader
        title="Exam Grades"
        subtitle="View your child's exam results and performance by term."
        action={null}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-50/50 p-4 rounded-xl border border-gray-100">
        {/* Child Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Child</label>
          <select
            value={selectedChild?.id || ""}
            onChange={e => setSelectedChild(children.find(c => c.id === Number(e.target.value)))}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none bg-white font-medium cursor-pointer"
          >
            {children.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.grade}-{c.section})</option>
            ))}
          </select>
        </div>
        {/* Term Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Term</label>
          <select
            value={selectedTerm}
            onChange={e => setSelectedTerm(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none bg-white font-medium cursor-pointer"
          >
            {terms.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="text-sm text-gray-400 italic animate-pulse">Loading grades...</span>
        </div>
      ) : grades.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center bg-gray-50/30 rounded-2xl border border-dashed border-gray-200 p-6">
          <FaChartBar className="text-3xl text-gray-300 mb-2.5" />
          <p className="text-xs text-gray-400 italic font-medium">No grades available for the selected term.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Exam Name</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 w-28 text-center">Marks</th>
                <th className="py-3.5 px-4 w-24 text-center">Grade</th>
                <th className="py-3.5 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150/70 text-xs">
              {grades.map(g => (
                <tr key={g.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-800 text-[13px]">{g.subject}</td>
                  <td className="py-3.5 px-4 text-gray-700 font-semibold">{g.examName}</td>
                  <td className="py-3.5 px-4 text-gray-500 font-medium">{g.examDate}</td>
                  <td className="py-3 px-4 text-center text-gray-700 font-bold font-mono">{g.marks}/{g.totalMarks}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10.5px] font-bold shadow-sm transition-all border ${
                      g.grade.includes('A') 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                        : g.grade === 'B' || g.grade === 'C'
                          ? "bg-blue-50 text-blue-700 border-blue-100" 
                          : g.grade === 'D'
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : g.grade === 'F'
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : "bg-gray-50 text-gray-400 border-dashed border-gray-300"
                    }`}>
                      {g.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 font-medium italic">{g.remarks || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

