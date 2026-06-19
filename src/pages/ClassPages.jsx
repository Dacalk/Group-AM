import { Icon, icons } from '../components/Icons'
import { Badge, PageHeader, Input, Select, Btn } from '../components/UI'

export function ClassManagementPage({ setPage }) {
  const classes = [
    { name: 'Grade 6-A', sec: 'A', teacher: 'Ms. Emily White', students: 30, room: 'Room 101', year: 2026, status: 'Active' },
    { name: 'Grade 7-A', sec: 'A', teacher: 'Ms. Sarah Johnson', students: 32, room: 'Room 103', year: 2026, status: 'Active' },
    { name: 'Grade 7-B', sec: 'B', teacher: 'Mr. James Brown', students: 29, room: 'Room 105', year: 2026, status: 'Active' },
    { name: 'Grade 8-B', sec: 'B', teacher: 'Mr. David Lee', students: 28, room: 'Room 201', year: 2026, status: 'Active' },
    { name: 'Grade 9-C', sec: 'C', teacher: 'Dr. Alex Kim', students: 25, room: 'Room 203', year: 2026, status: 'Active' },
    { name: 'Grade 10-A', sec: 'A', teacher: 'Ms. Lisa Ray', students: 22, room: 'Room 301', year: 2026, status: 'Inactive' },
  ]

  return (
    <div>
      <PageHeader
        title="Class Management"
        subtitle="Manage school classes, sections, and homeroom teachers."
        action={<Btn icon="plus" onClick={() => setPage('addClass')}>Add Class</Btn>}
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-2.5 pointer-events-none">
              <Icon path={icons.search} size={16} color="#9ca3af" />
            </div>
            <input placeholder="Search classes..." className="w-full border border-gray-200 rounded-xl py-2.5 text-sm focus:outline-none pl-9" />
          </div>
          <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none bg-white">
            <option>All Status</option>
          </select>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
              {['Class Name', 'Section', 'Homeroom Teacher', 'Students', 'Room', 'Academic Year', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left pb-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {classes.map((c, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 text-sm font-bold text-gray-800">{c.name}</td>
                <td className="py-3 text-sm text-gray-600">{c.sec}</td>
                <td className="py-3 text-sm text-gray-600">{c.teacher}</td>
                <td className="py-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Icon path={icons.users} size={13} color="#9ca3af" /> {c.students}
                  </span>
                </td>
                <td className="py-3 text-sm text-gray-600">{c.room}</td>
                <td className="py-3 text-sm text-gray-600">{c.year}</td>
                <td className="py-3"><Badge color={c.status === 'Active' ? 'green' : 'gray'}>{c.status}</Badge></td>
                <td className="py-3">
                  <div className="flex gap-2">
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

export function AddClass({ setPage }) {
  return (
    <div>
      <PageHeader title="Add New Class" subtitle="Create a new class or section for the school." />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Select label="Grade Level" placeholder="Select grade" options={['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']} />
          <Select label="Section" placeholder="Select section" options={['A', 'B', 'C', 'D']} />
        </div>
        <div className="mb-4"><Input label="Class Name" placeholder="e.g. Grade 7-A" /></div>
        <div className="mb-4">
          <Select label="Homeroom Teacher" placeholder="Select teacher" options={['Ms. Sarah Johnson', 'Mr. David Lee', 'Ms. Emily White', 'Mr. James Brown']} />
        </div>
        <div className="mb-4">
          <Select label="Classroom / Room No" placeholder="Select room" options={['Room 101', 'Room 103', 'Room 105', 'Room 201', 'Room 203', 'Room 301']} />
        </div>
        <div className="mb-4"><Input label="Capacity (Max Students)" placeholder="e.g. 35" /></div>
        <div className="mb-4"><Input label="Academic Year" placeholder="" value="2026" /></div>
        <div className="mb-6"><Select label="Status" placeholder="" options={['Active', 'Inactive']} /></div>
        <div className="flex gap-3">
          <Btn icon="building">Create Class</Btn>
          <Btn variant="outline" onClick={() => setPage('classMgmt')}>Cancel</Btn>
        </div>
      </div>
    </div>
  )
}
