import { Icon, icons } from '../components/Icons'
import { PageHeader, Input, Select, Btn } from '../components/UI'

export function TimetableManagement({ setPage }) {
  const rows = [
    { class: 'Grade 7-A', classC: 'bg-blue-100 text-blue-700', subject: 'Mathematics', teacher: 'Ms. Sarah Johnson', day: 'Monday', time: '8:00 - 9:00', room: 'Room 101' },
    { class: 'Grade 8-B', classC: 'bg-indigo-100 text-indigo-700', subject: 'Science', teacher: 'Mr. David Lee', day: 'Monday', time: '9:00 - 10:00', room: 'Lab 1' },
    { class: 'Grade 6-A', classC: 'bg-purple-100 text-purple-700', subject: 'English', teacher: 'Ms. Emily White', day: 'Monday', time: '10:00 - 11:00', room: 'Room 203' },
    { class: 'Grade 7-A', classC: 'bg-blue-100 text-blue-700', subject: 'History', teacher: 'Mr. James Brown', day: 'Tuesday', time: '8:00 - 9:00', room: 'Room 105' },
    { class: 'Grade 9-C', classC: 'bg-green-100 text-green-700', subject: 'Calculus', teacher: 'Ms. Sarah Johnson', day: 'Tuesday', time: '9:00 - 10:00', room: 'Room 203' },
    { class: 'Grade 8-B', classC: 'bg-indigo-100 text-indigo-700', subject: 'Computer Science', teacher: 'Dr. Alex Kim', day: 'Tuesday', time: '11:00 - 12:00', room: 'Lab 2' },
  ]

  return (
    <div>
      <PageHeader
        title="Timetable Management"
        subtitle="Manage school-wide class timetables."
        action={
          <>
            <Btn variant="outline" onClick={() => setPage('bulkTimetable')}>Bulk Add</Btn>
            <Btn icon="plus" onClick={() => setPage('addTimetable')}>Add Entry</Btn>
          </>
        }
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-2.5 pointer-events-none">
              <Icon path={icons.search} size={16} color="#9ca3af" />
            </div>
            <input placeholder="Search timetable..." className="w-full border border-gray-200 rounded-xl py-2.5 text-sm focus:outline-none pl-9" />
          </div>
          <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none bg-white"><option>All Classes</option></select>
          <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none bg-white"><option>All Days</option></select>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
              {['Class', 'Subject', 'Teacher', 'Day', 'Time Slot', 'Room', 'Actions'].map((h) => (
                <th key={h} className="text-left pb-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${r.classC}`}>{r.class}</span>
                </td>
                <td className="py-3 text-sm text-gray-800 font-medium">{r.subject}</td>
                <td className="py-3 text-sm text-gray-600">{r.teacher}</td>
                <td className="py-3 text-sm text-gray-600">{r.day}</td>
                <td className="py-3 text-sm text-gray-600">{r.time}</td>
                <td className="py-3 text-sm text-gray-600">{r.room}</td>
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

export function AddTimetable({ setPage }) {
  return (
    <div>
      <PageHeader title="Add Timetable Entry" subtitle="Add a single period to the timetable." />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl">
        <div className="space-y-4">
          <Select label="Class" placeholder="Select class" options={['Grade 6-A', 'Grade 7-A', 'Grade 7-B', 'Grade 8-B', 'Grade 9-C']} />
          <Select label="Subject" placeholder="Select subject" options={['Mathematics', 'Science', 'English', 'History', 'Physical Education']} />
          <Select label="Teacher" placeholder="Select teacher" options={['Ms. Sarah Johnson', 'Mr. David Lee', 'Ms. Emily White']} />
          <Select label="Day" placeholder="Select day" options={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" placeholder="Start" />
            <Input label="End Time" placeholder="End" />
          </div>
          <Select label="Room / Location" placeholder="Select room" options={['Room 101', 'Room 103', 'Room 105', 'Room 203', 'Lab 1', 'Lab 2', 'Gym']} />
        </div>
        <div className="flex gap-3 mt-6">
          <Btn icon="calendar">Save Entry</Btn>
          <Btn variant="outline" onClick={() => setPage('timetableManagement')}>Cancel</Btn>
        </div>
      </div>
    </div>
  )
}

export function BulkTimetable({ setPage }) {
  const periods = ['8:00 - 9:00', '9:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '1:00 - 2:00', '2:00 - 3:00']
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
  const subjectOpts = ['', 'Math', 'Science', 'English', 'History', 'PE', 'Art', 'Computer Science']

  return (
    <div>
      <PageHeader title="Bulk Add Timetable" subtitle="Fill in the weekly timetable for a class at once." />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Class" placeholder="Select class" options={['Grade 6-A', 'Grade 7-A', 'Grade 7-B', 'Grade 8-B', 'Grade 9-C']} />
          <Input label="Term" placeholder="" value="Term 2 - 2026" />
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <th className="text-left pb-3 pr-4">PERIOD</th>
                {days.map((d) => <th key={d} className="text-left pb-3 px-2">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {periods.map((p, i) => (
                <tr key={i} className="border-t border-gray-50">
                  <td className="py-2 pr-4 text-sm text-gray-500 font-medium whitespace-nowrap">{p}</td>
                  {days.map((d) => (
                    <td key={d} className="py-2 px-2">
                      <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none bg-white w-full">
                        {subjectOpts.map((o) => <option key={o} value={o}>{o || '—'}</option>)}
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 mt-6">
          <Btn icon="calendar">Save Timetable</Btn>
          <Btn variant="outline" onClick={() => setPage('timetableManagement')}>Cancel</Btn>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
            <Icon path={icons.upload} size={16} color="#9ca3af" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Import from CSV</p>
            <p className="text-xs text-gray-500">Upload a CSV file to bulk-import timetable entries</p>
          </div>
        </div>
        <Btn variant="outline">Upload CSV</Btn>
      </div>
    </div>
  )
}

export function WeeklyTimetable() {
  const subjectColors = {
    Math: { bg: '#eef0ff', text: '#5b5fc7', border: '#5b5fc7' },
    Science: { bg: '#f0f9ff', text: '#0369a1', border: '#0369a1' },
    English: { bg: '#f0fdf4', text: '#15803d', border: '#15803d' },
    History: { bg: '#fffbeb', text: '#d97706', border: '#d97706' },
    PE: { bg: '#fff1f2', text: '#be123c', border: '#be123c' },
    Art: { bg: '#fdf4ff', text: '#9333ea', border: '#a855f7' },
  }
  const schedule = {
    '8:00-9:00': { Mon: ['Math', 'Ms. Johnson', 'R101'], Tue: ['History', 'Mr. Brown', 'R105'], Wed: ['Math', 'Ms. Johnson', 'R101'], Thu: ['English', 'Ms. White', 'R203'], Fri: ['Math', 'Ms. Johnson', 'R101'] },
    '9:00-10:00': { Mon: ['Science', 'Mr. Lee', 'Lab1'], Tue: ['Math', 'Ms. Johnson', 'R101'], Wed: ['History', 'Mr. Brown', 'R105'], Thu: ['Science', 'Mr. Lee', 'Lab1'], Fri: ['PE', 'Mr. Wilson', 'Gym'] },
    '10:00-11:00': { Mon: ['English', 'Ms. White', 'R203'], Tue: null, Wed: ['Science', 'Mr. Lee', 'Lab1'], Thu: null, Fri: ['Art', 'Ms. Park', 'Art'] },
    '11:00-12:00': { Mon: null, Tue: ['PE', 'Mr. Wilson', 'Gym'], Wed: null, Thu: ['Math', 'Ms. Johnson', 'R101'], Fri: null },
    '12:00-1:00': { Mon: null, Tue: null, Wed: null, Thu: null, Fri: null },
    '1:00-2:00': { Mon: ['Art', 'Ms. Park', 'Art'], Tue: ['English', 'Ms. White', 'R203'], Wed: null, Thu: ['History', 'Mr. Brown', 'R105'], Fri: null },
    '2:00-3:00': { Mon: null, Tue: null, Wed: ['PE', 'Mr. Wilson', 'Gym'], Thu: null, Fri: ['English', 'Ms. White', 'R203'] },
  }
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const dayLabels = { Mon: 'MONDAY', Tue: 'TUESDAY', Wed: 'WEDNESDAY', Thu: 'THURSDAY', Fri: 'FRIDAY' }

  return (
    <div>
      <PageHeader title="Weekly Timetable" subtitle="View full weekly timetable for each class." />
      <div className="flex gap-3 mb-5">
        <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none bg-white">
          <option>Grade 7-A</option><option>Grade 6-A</option><option>Grade 8-B</option>
        </select>
        <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none bg-white">
          <option>Term 2 - 2026</option><option>Term 1 - 2026</option>
        </select>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <th className="text-left pb-4 pr-4 w-28">PERIOD</th>
              {days.map((d) => (
                <th key={d} className="text-center pb-4 px-2 text-xs font-semibold text-gray-400">{dayLabels[d]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(schedule).map(([period, dayCells]) => (
              <tr key={period}>
                <td className="py-2 pr-4 text-sm text-gray-500 font-medium whitespace-nowrap align-top pt-3">{period}</td>
                {days.map((d) => {
                  const cell = dayCells[d]
                  if (!cell) return <td key={d} className="py-2 px-2 text-center text-gray-300 align-top pt-3">—</td>
                  const c = subjectColors[cell[0]] || { bg: '#f9fafb', text: '#374151', border: '#d1d5db' }
                  return (
                    <td key={d} className="py-2 px-2 align-top">
                      <div className="rounded-xl p-2.5 text-center" style={{ background: c.bg, borderLeft: `3px solid ${c.border}` }}>
                        <p className="text-sm font-bold" style={{ color: c.text }}>{cell[0]}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{cell[1]}</p>
                        <p className="text-xs text-gray-400">{cell[2]}</p>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
