import { useState, useEffect } from 'react'
import { Icon, icons } from '../components/Icons'
import { Badge, StatCard, PageHeader } from '../components/UI'
import { api } from '../services/api'

// ─── CUSTOM CHART COMPONENTS ──────────────────────────────────────────────────

const BarChart = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.count), 1);
  const chartHeight = 110;
  const chartWidth = 220;
  const startX = 45;
  const startY = 140;
  
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col h-[280px]">
      <h3 className="text-sm font-bold text-gray-800 mb-2">Student Distribution</h3>
      <div className="flex-1 flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 300 180" className="overflow-visible">
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          
          {/* Y Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = startY - ratio * chartHeight;
            const gridVal = Math.round(ratio * maxVal);
            return (
              <g key={i} className="opacity-40">
                <line x1={startX} y1={y} x2={startX + chartWidth} y2={y} stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" />
                <text x={startX - 10} y={y + 3} textAnchor="end" className="text-[9px] fill-gray-400 font-medium">{gridVal}</text>
              </g>
            );
          })}
          
          {/* Bars */}
          {data.map((item, index) => {
            const barWidth = 24;
            const barSpacing = (chartWidth - (data.length * barWidth)) / (data.length + 1);
            const x = startX + barSpacing + index * (barWidth + barSpacing);
            const h = (item.count / maxVal) * chartHeight;
            const y = startY - h;
            
            return (
              <g key={index} className="group cursor-pointer">
                <rect 
                  x={x} 
                  y={y} 
                  width={barWidth} 
                  height={h} 
                  rx="5" 
                  fill="url(#barGrad)"
                  className="transition-all duration-300 hover:opacity-90"
                />
                <text 
                  x={x + barWidth / 2} 
                  y={y - 6} 
                  textAnchor="middle" 
                  className="text-[10px] font-bold fill-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  {item.count}
                </text>
                <text 
                  x={x + barWidth / 2} 
                  y={startY + 15} 
                  textAnchor="middle" 
                  className="text-[9px] fill-gray-500 font-bold"
                >
                  {item.name.replace('Grade ', 'G')}
                </text>
              </g>
            );
          })}
          
          <line x1={startX} y1={startY} x2={startX + chartWidth} y2={startY} stroke="#e2e8f0" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
};

const DonutChart = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const colors = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444'];
  let accumulatedCircumference = 0;
  
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col h-[280px]">
      <h3 className="text-sm font-bold text-gray-800 mb-2">User Roles</h3>
      <div className="flex-1 flex flex-row items-center justify-between gap-2">
        <div className="w-1/2 flex items-center justify-center relative">
          <svg width="110" height="110" viewBox="0 0 120 120" className="transform -rotate-90 overflow-visible">
            {data.map((item, index) => {
              const percentage = item.value / total;
              const strokeLength = percentage * 314.16;
              const strokeOffset = 314.16 - strokeLength + accumulatedCircumference;
              accumulatedCircumference -= strokeLength;
              
              return (
                <circle
                  key={index}
                  cx="60"
                  cy="60"
                  r="50"
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth="12"
                  strokeDasharray="314.16"
                  strokeDashoffset={strokeOffset}
                  className="transition-all duration-500 hover:stroke-[14px] cursor-pointer"
                />
              );
            })}
            <circle cx="60" cy="60" r="44" fill="white" />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</span>
            <span className="text-base font-black text-gray-800 leading-none mt-0.5">{total}</span>
          </div>
        </div>
        
        <div className="w-1/2 flex flex-col justify-center space-y-2">
          {data.map((item, index) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[index % colors.length] }} />
                  <span className="font-semibold text-gray-600 truncate">{item.name}</span>
                </div>
                <span className="font-bold text-gray-800 shrink-0 ml-1">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const LineChart = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.count), 1);
  const chartHeight = 110;
  const chartWidth = 220;
  const startX = 45;
  const startY = 140;
  
  const points = data.map((item, index) => {
    const x = startX + index * (chartWidth / Math.max(data.length - 1, 1));
    const y = startY - (item.count / maxVal) * chartHeight;
    return { x, y, name: item.name, count: item.count };
  });

  const pathD = points.reduce((acc, p, i) => {
    return acc + `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
  }, '');

  const areaD = pathD 
    ? `${pathD} L ${points[points.length - 1].x} ${startY} L ${points[0].x} ${startY} Z`
    : '';

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col h-[280px]">
      <h3 className="text-sm font-bold text-gray-800 mb-2">Class Workload (Weekly Slots)</h3>
      <div className="flex-1 flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 300 180" className="overflow-visible">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Y Grid Lines */}
          {[0, 0.5, 1].map((ratio, i) => {
            const y = startY - ratio * chartHeight;
            const gridVal = Math.round(ratio * maxVal);
            return (
              <g key={i} className="opacity-40">
                <line x1={startX} y1={y} x2={startX + chartWidth} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x={startX - 10} y={y + 3} textAnchor="end" className="text-[9px] fill-gray-400 font-medium">{gridVal}</text>
              </g>
            );
          })}
          
          {areaD && (
            <path d={areaD} fill="url(#lineGrad)" />
          )}

          {pathD && (
            <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
          
          {points.map((p, index) => {
            return (
              <g key={index} className="group cursor-pointer">
                <line 
                  x1={p.x} 
                  y1={p.y} 
                  x2={p.x} 
                  y2={startY} 
                  stroke="#4f46e5" 
                  strokeDasharray="2 2" 
                  strokeWidth="1" 
                  className="opacity-0 group-hover:opacity-40 transition-opacity duration-200" 
                />
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="4" 
                  fill="#ffffff" 
                  stroke="#4f46e5" 
                  strokeWidth="2.5" 
                  className="transition-all duration-200 group-hover:r-[6px]"
                />
                <text 
                  x={p.x} 
                  y={p.y - 8} 
                  textAnchor="middle" 
                  className="text-[10px] font-bold fill-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  {p.count}
                </text>
                <text 
                  x={p.x} 
                  y={startY + 15} 
                  textAnchor="middle" 
                  className="text-[9px] fill-gray-500 font-bold"
                >
                  {p.name.replace('Grade ', '')}
                </text>
              </g>
            );
          })}
          
          <line x1={startX} y1={startY} x2={startX + chartWidth} y2={startY} stroke="#e2e8f0" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
};

// ─── EVENT CALENDAR COMPONENT ─────────────────────────────────────────────────

const EventCalendar = ({ events = [], refreshData }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // June 2026 default
  const [selectedDateStr, setSelectedDateStr] = useState('2026-06-17');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('9:00 AM');
  const [newType, setNewType] = useState('activity');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarDays.push(d);
  }

  const selectedDateEvents = events.filter(e => e.date === selectedDateStr);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await api.addSchoolEvent({
        title: newTitle.trim(),
        date: selectedDateStr,
        time: newTime,
        type: newType
      });
      setNewTitle('');
      setShowAddForm(false);
      if (refreshData) refreshData();
    } catch (err) {
      console.error("Error adding event:", err);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await api.deleteSchoolEvent(id);
      if (refreshData) refreshData();
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <Icon path={icons.calendar} size={16} color="#5b5fc7" />
          School Calendar
        </h2>
        <div className="flex items-center gap-1">
          <button 
            type="button"
            onClick={handlePrevMonth} 
            className="p-1 hover:bg-gray-100 rounded-lg border-0 bg-transparent cursor-pointer text-gray-500 hover:text-gray-700 font-bold outline-none"
          >
            ←
          </button>
          <span className="text-xs font-bold text-gray-600 px-1">
            {monthNames[month]} {year}
          </span>
          <button 
            type="button"
            onClick={handleNextMonth} 
            className="p-1 hover:bg-gray-100 rounded-lg border-0 bg-transparent cursor-pointer text-gray-500 hover:text-gray-700 font-bold outline-none"
          >
            →
          </button>
        </div>
      </div>

      {/* Week Day Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400">
        <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="py-1"></div>;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = selectedDateStr === dateStr;
          const isToday = 
            new Date().getDate() === day && 
            new Date().getMonth() === month && 
            new Date().getFullYear() === year;
          const dayEvents = events.filter(e => e.date === dateStr);
          const hasEvents = dayEvents.length > 0;

          return (
            <button
              type="button"
              key={`day-${day}`}
              onClick={() => {
                setSelectedDateStr(dateStr);
                setShowAddForm(false);
              }}
              className={`py-1.5 text-xs font-bold rounded-lg relative cursor-pointer border outline-none flex flex-col items-center justify-center transition-all ${
                isSelected 
                  ? 'bg-[#5b5fc7] text-white border-[#5b5fc7]' 
                  : isToday
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-100/50 hover:bg-indigo-100/40'
                    : 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-1">
                {day}
                {isToday && (
                  <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-600'}`} />
                )}
              </span>
              {hasEvents && (
                <span 
                  className={`w-1.5 h-1.5 rounded-full absolute bottom-0.5 ${
                    isSelected ? 'bg-white' : 'bg-indigo-600'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Agenda & Event Operations */}
      <div className="border-t pt-3 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-500 uppercase">
            {(() => {
              const [y, m, d] = selectedDateStr.split('-').map(Number);
              const dateObj = new Date(y, m - 1, d);
              return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' });
            })()}
          </span>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-[10px] font-bold text-[#5b5fc7] hover:text-[#4b4fa7] bg-transparent border-0 cursor-pointer flex items-center gap-1 outline-none font-semibold"
          >
            {showAddForm ? '✕ Cancel' : '+ Add Event'}
          </button>
        </div>

        {/* Add Event Form */}
        {showAddForm && (
          <form onSubmit={handleAddEvent} className="bg-slate-50 p-3 rounded-xl border border-gray-150 space-y-2.5">
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Event Title</label>
              <input 
                type="text"
                required
                placeholder="e.g. Teacher's Meeting"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#5b5fc7] bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Time</label>
                <input 
                  type="text"
                  placeholder="e.g. 9:00 AM"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#5b5fc7] bg-white"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Type</label>
                <select 
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#5b5fc7] bg-white cursor-pointer"
                >
                  <option value="activity">Activity</option>
                  <option value="meeting">Meeting</option>
                  <option value="holiday">Holiday</option>
                  <option value="exam">Exam</option>
                </select>
              </div>
            </div>
            <button 
              type="submit"
              className="w-full py-1.5 bg-[#5b5fc7] hover:bg-[#4b4fa7] text-white text-xs font-bold rounded-lg border-0 cursor-pointer transition-colors"
            >
              Save Event
            </button>
          </form>
        )}

        {/* Selected Day Events List */}
        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
          {selectedDateEvents.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-50 bg-slate-50/50 hover:bg-slate-50 transition-all">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: item.color }} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{item.title}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{item.time || 'All Day'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteEvent(item.id)}
                className="text-gray-400 hover:text-red-500 bg-transparent border-0 cursor-pointer p-1 rounded hover:bg-red-50 outline-none flex items-center justify-center shrink-0"
              >
                <Icon path={icons.trash} size={13} />
              </button>
            </div>
          ))}

          {selectedDateEvents.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-xs italic">
              No special school events listed for this date.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────

export default function Dashboard({ data, refreshData, setPage }) {
  const students = data?.students || [];
  const subjects = data?.subjects || [];
  const users = data?.users || [];
  const timetable = data?.timetable || [];
  
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    api.getAuditLogs()
      .then(res => {
        if (res.success) {
          setRecentLogs((res.logs || []).slice(0, 5));
        }
      })
      .catch(err => console.error("Error loading recent logs:", err));
  }, []);

  const getActionCategory = (action) => {
    const act = (action || '').toLowerCase();
    if (act.includes('create') || act.includes('add')) return 'Create';
    if (act.includes('update') || act.includes('edit')) return 'Update';
    if (act.includes('delete') || act.includes('remove')) return 'Delete';
    if (act.includes('login') || act.includes('auth')) return 'Auth';
    return 'Other';
  };

  const getBadgeColor = (action) => {
    const category = getActionCategory(action);
    switch (category) {
      case 'Create': return 'green';
      case 'Update': return 'yellow';
      case 'Delete': return 'red';
      case 'Auth': return 'blue';
      default: return 'gray';
    }
  };

  // Calculate average attendance dynamically
  const avgAttendanceVal = students.length 
    ? Math.round(students.reduce((sum, s) => sum + (s.attendance || 0), 0) / students.length)
    : 91;

  // Process Bar Chart (Students by Grade)
  const studentsByGrade = {};
  students.forEach(s => {
    const gradeLabel = s.grade ? `Grade ${s.grade}` : 'Unknown';
    studentsByGrade[gradeLabel] = (studentsByGrade[gradeLabel] || 0) + 1;
  });
  let barData = Object.entries(studentsByGrade).map(([name, count]) => ({ name, count }));
  if (barData.length === 0) {
    barData = [
      { name: 'Grade 6', count: 28 },
      { name: 'Grade 7', count: 32 },
      { name: 'Grade 8', count: 25 },
      { name: 'Grade 9', count: 35 },
      { name: 'Grade 10', count: 18 }
    ];
  } else {
    barData.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Process Pie Chart (User Roles Share)
  const rolesCount = {};
  users.forEach(u => {
    if (u.role) {
      rolesCount[u.role] = (rolesCount[u.role] || 0) + 1;
    }
  });
  let pieData = Object.entries(rolesCount).map(([name, value]) => ({ name, value }));
  if (pieData.length === 0) {
    pieData = [
      { name: 'Admin', value: 2 },
      { name: 'Teacher', value: 12 },
      { name: 'Parent', value: 45 },
      { name: 'Library', value: 1 }
    ];
  }

  // Process Line Chart (Timetable Workload by Class)
  const workloadByClass = {};
  timetable.forEach(t => {
    if (t.className) {
      workloadByClass[t.className] = (workloadByClass[t.className] || 0) + 1;
    }
  });
  let lineData = Object.entries(workloadByClass).map(([name, count]) => ({ name, count }));
  if (lineData.length === 0) {
    lineData = [
      { name: 'Grade 6-A', count: 8 },
      { name: 'Grade 7-A', count: 12 },
      { name: 'Grade 7-B', count: 5 },
      { name: 'Grade 8-B', count: 9 },
      { name: 'Grade 9-C', count: 11 }
    ];
  } else {
    lineData.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Welcome back, Admin!"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Students"
          value={students.length.toString()}
          iconBg="bg-purple-100"
          icon={<Icon path={icons.users} size={20} color="#7c3aed" />}
        />
        <StatCard
          title="Avg Attendance"
          value={`${avgAttendanceVal}%`}
          sub="+2% this month"
          subColor="text-green-600"
          iconBg="bg-green-100"
          icon={<Icon path={icons.calendar} size={20} color="#16a34a" />}
        />
        <StatCard
          title="Total Subjects"
          value={subjects.length.toString()}
          iconBg="bg-indigo-100"
          icon={<Icon path={icons.book} size={20} color="#4f46e5" />}
        />
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <BarChart data={barData} />
        <DonutChart data={pieData} />
        <LineChart data={lineData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Children Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] lg:min-w-full">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <th className="text-left pb-3">Name</th>
                  <th className="text-left pb-3">Class</th>
                  <th className="text-left pb-3">Section</th>
                  <th className="text-left pb-3">Roll No</th>
                  <th className="text-left pb-3">Attendance</th>
                  <th className="text-left pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="py-3 text-sm font-medium text-gray-800">{s.name}</td>
                    <td className="py-3 text-sm text-gray-600">{s.grade}</td>
                    <td className="py-3 text-sm text-gray-600">{s.section}</td>
                    <td className="py-3 text-sm text-gray-600">{s.rollNo}</td>
                    <td className="py-3">
                      <Badge color={s.attendance >= 90 ? 'green' : 'yellow'}>
                        {s.attendance}%
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge color={s.status === 'Active' ? 'green' : 'gray'}>
                        {s.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-400">No students cataloged in database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Event Calendar Column */}
        <div className="col-span-1 lg:col-span-1">
          <EventCalendar events={data?.events || []} refreshData={refreshData} />
        </div>
      </div>

      {/* Recent Activity / Audit Log Panel */}
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Icon path={icons.list} size={18} color="#4f46e5" />
            Recent Activity (Audit Logs)
          </h2>
          {setPage && (
            <button 
              onClick={() => setPage('auditLogs')}
              className="text-xs font-bold text-[#5b5fc7] hover:text-[#4b4fa7] bg-transparent border-0 cursor-pointer outline-none hover:underline"
            >
              View All Logs →
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="text-left pb-3 pr-4">Timestamp</th>
                <th className="text-left pb-3 pr-4">Admin</th>
                <th className="text-left pb-3 pr-4">Action</th>
                <th className="text-left pb-3 pr-4">Target Type</th>
                <th className="text-left pb-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 pr-4 text-xs font-mono text-gray-400 whitespace-nowrap">{log.createdAt}</td>
                  <td className="py-3 pr-4 text-sm font-medium text-gray-700">{log.username}</td>
                  <td className="py-3 pr-4">
                    <Badge color={getBadgeColor(log.action)}>{log.action}</Badge>
                  </td>
                  <td className="py-3 pr-4 text-xs font-semibold text-gray-500">{log.targetType || '-'}</td>
                  <td className="py-3 text-sm text-gray-600 max-w-sm truncate" title={log.details}>
                    {log.details || '-'}
                  </td>
                </tr>
              ))}
              {recentLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400 text-sm">
                    No recent activity logs available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
