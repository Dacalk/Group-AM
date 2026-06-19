import { Icon, icons } from '../components/Icons'
import { Badge, PageHeader, Input, Select, Btn } from '../components/UI'

export function SubjectManagement({ setPage }) {
  const subjects = [
    { code: 'MATH-101', name: 'Mathematics', teacher: 'Ms. Sarah Johnson', grade: 'Grade 7-8', type: 'Core', typeC: 'blue', credits: 4, status: 'Active' },
    { code: 'SCI-101', name: 'Science', teacher: 'Mr. David Lee', grade: 'Grade 6-8', type: 'Core', typeC: 'blue', credits: 4, status: 'Active' },
    { code: 'ENG-101', name: 'English Language', teacher: 'Ms. Emily White', grade: 'All Grades', type: 'Core', typeC: 'blue', credits: 3, status: 'Active' },
    { code: 'HIST-201', name: 'World History', teacher: 'Mr. James Brown', grade: 'Grade 8-10', type: 'Core', typeC: 'blue', credits: 3, status: 'Active' },
    { code: 'ART-101', name: 'Visual Arts', teacher: 'Ms. Lily Park', grade: 'Grade 6-9', type: 'Elective', typeC: 'yellow', credits: 2, status: 'Active' },
    { code: 'PE-101', name: 'Physical Education', teacher: 'Mr. Tom Wilson', grade: 'All Grades', type: 'Core', typeC: 'blue', credits: 2, status: 'Active' },
    { code: 'CS-201', name: 'Computer Science', teacher: 'Dr. Alex Kim', grade: 'Grade 9-12', type: 'Elective', typeC: 'yellow', credits: 3, status: 'Inactive' },
  ]

  return (
    <div>
      <PageHeader
        title="Subject Management"
        subtitle="Manage all subjects and course assignments."
        action={<Btn icon="plus" onClick={() => setPage('addSubject')}>Add Subject</Btn>}
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-2.5 pointer-events-none">
              <Icon path={icons.search} size={16} color="#9ca3af" />
            </div>
            <input placeholder="Search subjects..." className="w-full border border-gray-200 rounded-xl py-2.5 text-sm focus:outline-none pl-9" />
          </div>
          <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none bg-white">
            <option>All Types</option><option>Core</option><option>Elective</option>
          </select>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
              {['Code', 'Subject Name', 'Teacher', 'Grade Level', 'Type', 'Credits', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left pb-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjects.map((s, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 text-xs font-mono font-semibold text-indigo-600">{s.code}</td>
                <td className="py-3 text-sm font-medium text-gray-800">{s.name}</td>
                <td className="py-3 text-sm text-gray-600">{s.teacher}</td>
                <td className="py-3 text-sm text-gray-600">{s.grade}</td>
                <td className="py-3"><Badge color={s.typeC}>{s.type}</Badge></td>
                <td className="py-3 text-sm text-gray-700 font-medium">{s.credits}</td>
                <td className="py-3"><Badge color={s.status === 'Active' ? 'green' : 'gray'}>{s.status}</Badge></td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button className="text-indigo-400 hover:text-indigo-600"><Icon path={icons.edit} size={15} /></button>
                    <button className="text-red-400 hover:text-red-600"><Icon path={icons.trash} size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AddSubject({ setPage }) {
  return (
    <div>
      <PageHeader title="Add New Subject" subtitle="Create a new subject and assign to a teacher." />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-3xl">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input label="Subject Code" placeholder="e.g. MATH-102" />
          <Input label="Subject Name" placeholder="e.g. Advanced Mathematics" />
        </div>
        <div className="mb-4">
          <Select label="Assign Teacher" placeholder="Select teacher" options={['Ms. Sarah Johnson', 'Mr. David Lee', 'Ms. Emily White']} />
        </div>
        <div className="mb-4">
          <Select label="Grade Level" placeholder="Select grade level" options={['Grade 1-3', 'Grade 4-6', 'Grade 7-8', 'Grade 9-12', 'All Grades']} />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Select label="Subject Type" placeholder="Select type" options={['Core', 'Elective']} />
          <Select label="Credit Hours" placeholder="Select credits" options={['1', '2', '3', '4']} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea
            placeholder="Brief subject description..."
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none resize-none"
          />
        </div>
        <div className="mb-6"><Select label="Status" placeholder="" options={['Active', 'Inactive']} /></div>
        <div className="flex gap-3">
          <Btn icon="book">Save Subject</Btn>
          <Btn variant="outline" onClick={() => setPage('subjectManagement')}>Cancel</Btn>
        </div>
      </div>
    </div>
  )
}
