import { useState } from 'react'
import { api } from '../services/api'
import { Icon, icons } from '../components/Icons'
import { PageHeader, Input, Select, Btn, useDialog } from '../components/UI'

export function TimetableManagement({ setPage, data, refreshData, setEditingTimetable }) {
  const [search, setSearch] = useState('')
  const { alert, confirm, DialogHost } = useDialog()

  const timetable = data?.timetable || []

  // Derive class badge colors
  const getClassBadgeColor = (className) => {
    if (className.includes('6-A')) return 'bg-purple-100 text-purple-700'
    if (className.includes('7-A')) return 'bg-blue-100 text-blue-700'
    if (className.includes('7-B')) return 'bg-orange-100 text-orange-700'
    if (className.includes('8-B')) return 'bg-indigo-100 text-indigo-700'
    if (className.includes('9-C')) return 'bg-green-100 text-green-700'
    return 'bg-gray-100 text-gray-700'
  }

  const handleEdit = (entry) => {
    setEditingTimetable(entry)
    setPage('addTimetable')
  }

  const handleDelete = async (id, subject, className) => {
    const ok = await confirm(
      `This will permanently remove the "${subject}" slot for "${className}".`,
      'Delete Timetable Entry?',
      'delete',
      'Delete Entry'
    )
    if (!ok) return
    try {
      await api.deleteTimetable(id)
      await alert('Timetable entry deleted successfully!', 'success', 'Entry Deleted')
      refreshData()
    } catch (err) {
      await alert('Error deleting timetable entry: ' + err.message, 'error', 'Delete Failed')
    }
  }

  const filteredTimetable = timetable.filter((t) => 
    t.className.toLowerCase().includes(search.toLowerCase()) || 
    t.subject.toLowerCase().includes(search.toLowerCase()) || 
    t.room.toLowerCase().includes(search.toLowerCase()) || 
    t.day.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <DialogHost />
      <PageHeader
        title="Timetable Management"
        subtitle="Manage school-wide class timetables."
        action={
          <>
            <Btn variant="outline" onClick={() => setPage('bulkTimetable')}>Bulk Add</Btn>
            <Btn icon="plus" onClick={() => { setEditingTimetable(null); setPage('addTimetable'); }}>Add Entry</Btn>
          </>
        }
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-2.5 pointer-events-none">
              <Icon path={icons.search} size={16} color="#9ca3af" />
            </div>
            <input 
              placeholder="Search timetable..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-2.5 text-sm focus:outline-none pl-9" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] lg:min-w-full">
            <thead>
              <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                {['Class', 'Subject', 'Teacher', 'Day', 'Time Slot', 'Room', 'Actions'].map((h) => (
                  <th key={h} className="text-left pb-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTimetable.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getClassBadgeColor(r.className)}`}>{r.className}</span>
                  </td>
                  <td className="py-3 text-sm text-gray-800 font-medium">{r.subject}</td>
                  <td className="py-3 text-sm text-gray-600">Ms. Sarah Johnson</td> {/* Mock teacher */}
                  <td className="py-3 text-sm text-gray-600">{r.day}</td>
                  <td className="py-3 text-sm text-gray-600">{r.timeSlot}</td>
                  <td className="py-3 text-sm text-gray-600">{r.room}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(r)}
                        className="text-indigo-500 hover:text-indigo-700 bg-transparent border-0 cursor-pointer text-sm font-semibold"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(r.id, r.subject, r.className)}
                        className="text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer text-sm font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTimetable.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-400">No timetable entries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function AddTimetable({ setPage, refreshData, editingTimetable, setEditingTimetable }) {
  const isEdit = !!(editingTimetable && editingTimetable.id)
  const { alert, DialogHost } = useDialog()

  // Split time slot into start and end times
  let initialStart = ''
  let initialEnd = ''
  if (editingTimetable && editingTimetable.timeSlot) {
    const parts = editingTimetable.timeSlot.split(' - ')
    initialStart = parts[0] || ''
    initialEnd = parts[1] || ''
  }

  const [className, setClassName] = useState(editingTimetable?.className || '')
  const [subject, setSubject] = useState(editingTimetable?.subject || '')
  const [day, setDay] = useState(editingTimetable?.day || '')
  const [startTime, setStartTime] = useState(initialStart)
  const [endTime, setEndTime] = useState(initialEnd)
  const [room, setRoom] = useState(editingTimetable?.room || '')

  const parseTime = (timeStr) => {
    try {
      const [time, modifier] = timeStr.split(' ')
      let [hours, minutes] = time.split(':').map(Number)
      if (modifier === 'PM' && hours !== 12) hours += 12
      if (modifier === 'AM' && hours === 12) hours = 0
      return hours * 60 + minutes
    } catch (e) {
      return 9999
    }
  }

  const baseTimeOptions = [
    '8:00 AM', '8:15 AM', '8:30 AM', '8:45 AM',
    '9:00 AM', '9:15 AM', '9:30 AM', '9:45 AM',
    '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
    '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
    '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
    '1:00 PM', '1:15 PM', '1:30 PM', '1:45 PM',
    '2:00 PM', '2:15 PM', '2:30 PM', '2:45 PM',
    '3:00 PM', '3:30 PM', '4:00 PM'
  ]

  const startTimeOptions = Array.from(new Set(
    [...baseTimeOptions, initialStart].filter(Boolean)
  )).sort((a, b) => parseTime(a) - parseTime(b))

  const endTimeOptions = Array.from(new Set(
    [...baseTimeOptions, initialEnd].filter(Boolean)
  )).sort((a, b) => parseTime(a) - parseTime(b))

  const handleSave = async () => {
    if (!className || !subject || !day || !startTime || !endTime || !room) {
      await alert('Please fill in all fields.', 'warning', 'Missing Fields')
      return
    }

    const payload = {
      day,
      timeSlot: `${startTime} - ${endTime}`,
      className,
      subject,
      room
    }

    try {
      if (isEdit) {
        await api.updateTimetable(editingTimetable.id, payload)
        await alert('Timetable entry updated successfully!', 'success', 'Entry Updated')
      } else {
        await api.addTimetable(payload)
        await alert('Timetable entry added successfully!', 'success', 'Entry Added')
      }
      setEditingTimetable(null)
      refreshData()
      setPage('timetableManagement')
    } catch (err) {
      await alert('Error saving timetable entry: ' + err.message, 'error', 'Save Failed')
    }
  }

  const handleCancel = () => {
    setEditingTimetable(null)
    setPage('timetableManagement')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <DialogHost />
      <PageHeader 
        title={isEdit ? "Edit Timetable Entry" : "Add Timetable Entry"} 
        subtitle={isEdit ? "Modify timetable entry settings." : "Add a single period to the timetable."} 
      />
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Class</label>
          <select 
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white"
          >
            <option value="">Select class...</option>
            {['Grade 6-A', 'Grade 7-A', 'Grade 7-B', 'Grade 8-B', 'Grade 9-C'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Subject</label>
          <select 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white"
          >
            <option value="">Select subject...</option>
            {['Mathematics', 'Science', 'English', 'History', 'Algebra', 'Calculus', 'Physics'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Day</label>
          <select 
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white"
          >
            <option value="">Select day...</option>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Start Time</label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white"
            >
              <option value="">Select start time...</option>
              {startTimeOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">End Time</label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white"
            >
              <option value="">Select end time...</option>
              {endTimeOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Room / Location</label>
          <select 
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white"
          >
            <option value="">Select room...</option>
            {['Room 101', 'Room 103', 'Room 105', 'Room 201', 'Room 203', 'Lab 1', 'Lab 2', 'Gym'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Btn icon="calendar" onClick={handleSave}>{isEdit ? "Save Changes" : "Save Entry"}</Btn>
          <Btn variant="outline" onClick={handleCancel}>Cancel</Btn>
        </div>
      </div>
    </div>
  )
}

export function BulkTimetable({ setPage }) {
  const periods = [
    '8:30 AM - 9:15 AM',
    '9:15 AM - 10:00 AM',
    '10:00 AM - 10:45 AM',
    '10:45 AM - 11:00 AM',
    '11:00 AM - 11:45 AM',
    '11:45 AM - 12:15 PM',
    '12:15 PM - 12:45 PM',
    '12:45 PM - 1:30 PM',
    '1:30 PM - 2:15 PM'
  ]
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
    </div>
  )
}export function WeeklyTimetable({ data, refreshData, setPage, setEditingTimetable }) {
  const timetable = data?.timetable || []
  
  // Extract all unique class names dynamically
  const classOptions = Array.from(new Set(timetable.map((t) => t.className)))
    .filter(Boolean)
    .sort();
  const classes = classOptions.length > 0 ? classOptions : ['Grade 6-A', 'Grade 7-A', 'Grade 7-B', 'Grade 8-B', 'Grade 9-C'];

  const [selectedClass, setSelectedClass] = useState(classes.includes('Grade 7-A') ? 'Grade 7-A' : (classes[0] || ''));
  const [selectedTerm, setSelectedTerm] = useState('Term 2 - 2026');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { alert, confirm, DialogHost } = useDialog();

  const dayMap = {
    'Monday': 'Mon',
    'Tuesday': 'Tue',
    'Wednesday': 'Wed',
    'Thursday': 'Thu',
    'Friday': 'Fri'
  };

  const reverseDayMap = {
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday'
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dayLabels = { Mon: 'MONDAY', Tue: 'TUESDAY', Wed: 'WEDNESDAY', Thu: 'THURSDAY', Fri: 'FRIDAY' };

  // Filter timetable for currently selected class
  const classEntries = timetable.filter(
    (t) => t.className === selectedClass
  );

  const basePeriods = [
    '8:30 AM - 9:15 AM',
    '9:15 AM - 10:00 AM',
    '10:00 AM - 10:45 AM',
    '10:45 AM - 11:00 AM',
    '11:00 AM - 11:45 AM',
    '11:45 AM - 12:15 PM',
    '12:15 PM - 12:45 PM',
    '12:45 PM - 1:30 PM',
    '1:30 PM - 2:15 PM'
  ];

  // Merge database slots and base periods to ensure everything is visible
  const dbSlots = classEntries.map((t) => t.timeSlot).filter(Boolean);
  const uniqueSlots = Array.from(new Set([...basePeriods, ...dbSlots]));

  // Helper to parse timeSlot start time for chronological sorting
  const parseTime = (timeStr) => {
    try {
      const startTimeStr = timeStr.split(' - ')[0];
      const [time, modifier] = startTimeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    } catch (e) {
      return 9999;
    }
  };

  const periods = uniqueSlots.sort((a, b) => parseTime(a) - parseTime(b));

  const getSubjectStyle = (subjectName) => {
    const name = (subjectName || '').toLowerCase();
    if (name.includes('math') || name.includes('algebra') || name.includes('calculus')) {
      return { bg: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100/70', borderHex: '#6366f1', textHex: '#4338ca' };
    }
    if (name.includes('science') || name.includes('physic') || name.includes('chem') || name.includes('bio')) {
      return { bg: 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100/70', borderHex: '#0ea5e9', textHex: '#0369a1' };
    }
    if (name.includes('english') || name.includes('lit')) {
      return { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/70', borderHex: '#10b981', textHex: '#047857' };
    }
    if (name.includes('history') || name.includes('social') || name.includes('geography')) {
      return { bg: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100/70', borderHex: '#f59e0b', textHex: '#b45309' };
    }
    if (name.includes('pe') || name.includes('physical') || name.includes('gym') || name.includes('sport')) {
      return { bg: 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/70', borderHex: '#f43f5e', textHex: '#be123c' };
    }
    if (name.includes('art') || name.includes('music') || name.includes('draw')) {
      return { bg: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700 hover:bg-fuchsia-100/70', borderHex: '#d946ef', textHex: '#a21caf' };
    }
    if (name.includes('computer') || name.includes('it') || name.includes('coding')) {
      return { bg: 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100/70', borderHex: '#8b5cf6', textHex: '#6d28d9' };
    }
    return { bg: 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70', borderHex: '#64748b', textHex: '#475569' };
  };

  const getTeacherForSubject = (subject) => {
    const lower = (subject || '').toLowerCase();
    if (lower.includes('math') || lower.includes('algebra') || lower.includes('calculus')) return 'Ms. Sarah Johnson';
    if (lower.includes('science') || lower.includes('physic') || lower.includes('chem')) return 'Mr. Robert Lee';
    if (lower.includes('english')) return 'Ms. Emily White';
    if (lower.includes('history') || lower.includes('social')) return 'Mr. David Brown';
    if (lower.includes('pe') || lower.includes('physical')) return 'Mr. James Wilson';
    if (lower.includes('art')) return 'Ms. Julia Park';
    return 'Ms. Sarah Johnson';
  };

  return (
    <div className="pb-12 space-y-6">
      <DialogHost />
      
      <PageHeader 
        title="Weekly Timetable" 
        subtitle="Manage and view full weekly timetable schedules." 
        action={
          <Btn icon="plus" onClick={() => { setEditingTimetable(null); setPage('addTimetable'); }}>
            New Class Slot
          </Btn>
        }
      />

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 focus:outline-none bg-white cursor-pointer hover:border-gray-300 transition-colors"
          >
            {classes.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          <select 
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 focus:outline-none bg-white cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="Term 2 - 2026">Term 2 - 2026</option>
            <option value="Term 1 - 2026">Term 1 - 2026</option>
          </select>
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-72">
          <span className="absolute left-3.5 top-3 pointer-events-none flex items-center">
            <Icon path={icons.search} size={15} color="#9ca3af" />
          </span>
          <input 
            type="text"
            placeholder="Search subject, room, teacher..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-white" 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-2.5 bg-transparent border-0 text-gray-400 hover:text-gray-600 cursor-pointer text-base font-bold outline-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Timetable Grid Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <th className="text-left pb-4 pr-4 w-28">PERIOD</th>
              {days.map((d) => (
                <th key={d} className="text-center pb-4 px-2 text-xs font-bold text-gray-400">{dayLabels[d]}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {periods.map((period) => {
              if (period === '11:45 AM - 12:15 PM') {
                return (
                  <tr key={period} className="bg-amber-50/25">
                    <td className="py-4 pr-4 text-xs font-extrabold text-amber-900 whitespace-nowrap align-middle text-center border-r border-gray-100">
                      <div>Lunch</div>
                      <div className="text-[10px] text-amber-700 font-bold mt-0.5">{period}</div>
                    </td>
                    <td colSpan={5} className="py-4 px-2 text-center align-middle font-bold text-amber-800 text-sm">
                      Lunch Break (30 mins)
                    </td>
                  </tr>
                );
              }

              const periodLabelsMap = {
                '8:30 AM - 9:15 AM': 'Period 1',
                '9:15 AM - 10:00 AM': 'Period 2',
                '10:00 AM - 10:45 AM': 'Period 3',
                '10:45 AM - 11:00 AM': 'Recess',
                '11:00 AM - 11:45 AM': 'Period 4',
                '12:15 PM - 12:45 PM': 'Period 5',
                '12:45 PM - 1:30 PM': 'Period 6',
                '1:30 PM - 2:15 PM': 'Period 7'
              };
              const periodLabel = periodLabelsMap[period] || 'Extra Slot';

              return (
                <tr key={period} className="hover:bg-slate-50/20 transition-colors">
                  <td className="py-4 pr-4 text-xs font-extrabold text-gray-800 whitespace-nowrap align-middle text-center border-r border-gray-100">
                    <div>{periodLabel}</div>
                    <div className="text-[10px] text-gray-500 font-bold mt-0.5">{period}</div>
                  </td>
                  {days.map((d) => {
                    const entry = classEntries.find((e) => {
                      const shortDay = dayMap[e.day] || e.day;
                      return shortDay.toLowerCase() === d.toLowerCase() && e.timeSlot === period;
                    });

                    if (!entry) {
                      const fullDay = reverseDayMap[d] || d;
                      return (
                        <td key={d} className="py-4 px-2 text-center text-gray-300 align-middle relative group">
                          <span className="font-light text-xs opacity-60">—</span>
                          {/* Hover Quick Add Plus Icon */}
                          <button
                            onClick={() => {
                              setEditingTimetable({
                                day: fullDay,
                                timeSlot: period,
                                className: selectedClass,
                                subject: '',
                                room: ''
                              });
                              setPage('addTimetable');
                            }}
                            className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-[#5235f5] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#5235f5] hover:text-white transition-all hover:scale-105 shadow-sm cursor-pointer z-10"
                            title={`Quick Add slot for ${fullDay} at ${period}`}
                          >
                            <Icon path={icons.plus} size={12} />
                          </button>
                        </td>
                      );
                    }

                    const style = getSubjectStyle(entry.subject);
                    const teacher = getTeacherForSubject(entry.subject);

                    // Highlight filter status
                    const isMatch = searchQuery 
                      ? entry.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        entry.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        teacher.toLowerCase().includes(searchQuery.toLowerCase())
                      : true;

                    return (
                      <td key={d} className="py-2.5 px-2 align-middle">
                        <button
                          onClick={() => setSelectedSlot(entry)}
                          className={`w-full text-left rounded-xl p-2.5 border border-l-4 transition-all duration-200 shadow-sm cursor-pointer block hover:-translate-y-0.5 outline-none ${style.bg} ${isMatch ? 'opacity-100 scale-100' : 'opacity-40 scale-95 border-dashed'}`}
                          style={{ borderLeftColor: style.borderHex }}
                        >
                          <p className="text-sm font-extrabold truncate" style={{ color: style.textHex }}>{entry.subject}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5 font-semibold truncate">{teacher}</p>
                          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 font-semibold font-mono">
                            <Icon path={icons.building} size={10} color="#9ca3af" />
                            {entry.room}
                          </p>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Entry Details Popup Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 transition-opacity backdrop-blur-[1px]">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl overflow-hidden border border-gray-100">
            {(() => {
              const style = getSubjectStyle(selectedSlot.subject);
              const teacher = getTeacherForSubject(selectedSlot.subject);
              return (
                <>
                  <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${style.borderHex}, ${style.borderHex}dd)` }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 bg-white/20 rounded-md">
                          {selectedClass}
                        </span>
                        <h3 className="text-xl font-extrabold mt-2 leading-tight pr-4">{selectedSlot.subject}</h3>
                      </div>
                      <button 
                        onClick={() => setSelectedSlot(null)}
                        className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer text-lg font-bold outline-none"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Metadata Items */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-[#5235f5] shrink-0">
                        <Icon path={icons.calendar} size={15} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Day</p>
                        <p className="text-sm font-bold text-gray-800">{selectedSlot.day}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <Icon path={icons.clock} size={15} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Time Slot</p>
                        <p className="text-sm font-bold text-gray-800">{selectedSlot.timeSlot}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                        <Icon path={icons.building} size={15} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Room / Location</p>
                        <p className="text-sm font-bold text-gray-800">{selectedSlot.room}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                        <Icon path={icons.users} size={15} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Instructor</p>
                        <p className="text-sm font-bold text-gray-800">{teacher}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="bg-gray-50 px-6 py-4 flex items-center justify-between gap-3 border-t border-gray-100">
                    <button
                      onClick={async () => {
                        const id = selectedSlot.id;
                        const subjectName = selectedSlot.subject;
                        const className = selectedSlot.className;
                        setSelectedSlot(null); // Close modal

                        const ok = await confirm(
                          `This will permanently remove the "${subjectName}" slot for "${className}".`,
                          'Delete Timetable Entry?',
                          'delete',
                          'Delete Entry'
                        );
                        if (!ok) return;
                        try {
                          await api.deleteTimetable(id);
                          await alert('Timetable entry deleted successfully!', 'success', 'Entry Deleted');
                          refreshData();
                        } catch (err) {
                          await alert('Error deleting timetable entry: ' + err.message, 'error', 'Delete Failed');
                        }
                      }}
                      className="px-3.5 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-rose-100 cursor-pointer"
                    >
                      <Icon path={icons.trash} size={12} />
                      Delete
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTimetable(selectedSlot);
                          setSelectedSlot(null);
                          setPage('addTimetable');
                        }}
                        className="px-3.5 py-2 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Icon path={icons.edit} size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => setSelectedSlot(null)}
                        className="px-4 py-2 bg-[#5235f5] text-white hover:opacity-95 font-bold rounded-xl text-xs transition-colors border-0 cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
