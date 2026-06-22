import { useState, useEffect } from 'react'
import { Icon, icons } from '../components/Icons'
import { PageHeader, Btn, useDialog } from '../components/UI'
import { api } from '../services/api'

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // Default June 2026
  const [selectedDateStr, setSelectedDateStr] = useState('2026-06-17');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('9:00 AM');
  const [newType, setNewType] = useState('activity');

  const { alert, confirm, DialogHost } = useDialog();

  const fetchEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data || []);
    } catch (err) {
      console.error("Error fetching events from DB:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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
      await fetchEvents();
      alert('Event added successfully!', 'success', 'Event Created');
    } catch (err) {
      alert('Error adding event: ' + err.message, 'error', 'Error');
    }
  };

  const handleDeleteEvent = async (id, title) => {
    const ok = await confirm(
      `Are you sure you want to remove the special day event "${title}"?`,
      'Delete School Event?',
      'delete',
      'Delete Event'
    );
    if (!ok) return;

    try {
      await api.deleteSchoolEvent(id);
      await fetchEvents();
      alert('Event deleted successfully!', 'success', 'Event Deleted');
    } catch (err) {
      alert('Error deleting event: ' + err.message, 'error', 'Error');
    }
  };

  const getEventBadgeColor = (type) => {
    if (type === 'holiday') return 'bg-blue-50 text-blue-700 border-blue-150';
    if (type === 'meeting') return 'bg-orange-50 text-orange-700 border-orange-150';
    if (type === 'activity') return 'bg-indigo-50 text-indigo-700 border-indigo-150';
    if (type === 'exam') return 'bg-red-50 text-red-700 border-red-150';
    return 'bg-gray-50 text-gray-700 border-gray-150';
  };

  return (
    <div className="pb-12 space-y-6">
      <DialogHost />
      
      <PageHeader 
        title="School Calendar Management" 
        subtitle="Manage academic schedules, holidays, parents meetings, and events." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Large Calendar Card (col-span-2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Icon path={icons.calendar} size={20} color="#5b5fc7" />
              Calendar Overview
            </h2>
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-gray-250">
              <button 
                onClick={handlePrevMonth} 
                className="p-1.5 hover:bg-white rounded-lg border-0 bg-transparent cursor-pointer text-gray-600 hover:text-gray-800 font-bold outline-none shadow-sm hover:shadow-md transition"
              >
                ←
              </button>
              <span className="text-sm font-extrabold text-gray-700 px-3">
                {monthNames[month]} {year}
              </span>
              <button 
                onClick={handleNextMonth} 
                className="p-1.5 hover:bg-white rounded-lg border-0 bg-transparent cursor-pointer text-gray-600 hover:text-gray-800 font-bold outline-none shadow-sm hover:shadow-md transition"
              >
                →
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>Sunday</span><span>Monday</span><span>Tuesday</span><span>Wednesday</span><span>Thursday</span><span>Friday</span><span>Saturday</span>
          </div>

          {/* Monthly Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="aspect-square bg-slate-50/20 rounded-xl"></div>;
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
                  key={`calendar-day-${day}`}
                  onClick={() => {
                    setSelectedDateStr(dateStr);
                    setShowAddForm(false);
                  }}
                  className={`aspect-square p-2 rounded-2xl cursor-pointer border relative flex flex-col justify-between items-start transition-all ${
                    isSelected 
                      ? 'bg-[#5b5fc7] text-white border-[#5b5fc7] shadow-md scale-[1.02]' 
                      : isToday
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-100/50 hover:bg-indigo-100/40'
                        : 'bg-white text-gray-700 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/20'
                  }`}
                >
                  <span className="text-sm font-extrabold leading-none flex items-center gap-1.5">
                    {day}
                    {isToday && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#5b5fc7]'}`} title="Today" />
                    )}
                  </span>
                  
                  {/* Event indicator markers */}
                  <div className="w-full flex flex-wrap gap-1 mt-auto">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div 
                        key={ev.id} 
                        className={`w-2 h-2 rounded-full ${
                          isSelected ? 'bg-white' : ''
                        }`}
                        style={{ backgroundColor: isSelected ? undefined : ev.color }}
                        title={ev.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className={`text-[8px] font-black leading-none ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Day Events & Manager (col-span-1) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Special Days on</p>
                <h3 className="text-base font-extrabold text-gray-800">
                  {(() => {
                    const [y, m, d] = selectedDateStr.split('-').map(Number);
                    const dateObj = new Date(y, m - 1, d);
                    return dateObj.toLocaleDateString(undefined, { month: 'long', day: 'numeric', weekday: 'long' });
                  })()}
                </h3>
              </div>
              <Btn 
                variant={showAddForm ? 'outline' : 'primary'} 
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? '✕ Close' : '+ Add Event'}
              </Btn>
            </div>

            {/* Add Event Form */}
            {showAddForm && (
              <form onSubmit={handleAddEvent} className="bg-slate-50 p-4 rounded-2xl border border-gray-150 space-y-3">
                <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wide">New Event Settings</h4>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Event Title</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Annual Exams Day"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/20 focus:border-[#5b5fc7] bg-white transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Time</label>
                    <input 
                      type="text"
                      placeholder="e.g. 9:00 AM"
                      value={newTime}
                      onChange={e => setNewTime(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/20 focus:border-[#5b5fc7] bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Type</label>
                    <select 
                      value={newType}
                      onChange={e => setNewType(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/20 focus:border-[#5b5fc7] bg-white cursor-pointer transition"
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
                  className="w-full py-2.5 bg-[#5b5fc7] hover:bg-[#4b4fa7] text-white text-sm font-bold rounded-xl border-0 cursor-pointer transition shadow-sm"
                >
                  Register Special Day
                </button>
              </form>
            )}

            {/* Selected Date Events List */}
            <div className="space-y-3">
              {selectedDateEvents.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-slate-50/30 hover:bg-slate-50 transition-all shadow-sm"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-gray-800 truncate">{item.title}</p>
                      <div className="flex flex-wrap gap-2 mt-1.5 items-center">
                        <span className="text-[10px] text-gray-500 font-bold font-mono">{item.time || 'All Day'}</span>
                        <span className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getEventBadgeColor(item.type)}`}>
                          {item.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(item.id, item.title)}
                    className="text-gray-400 hover:text-red-500 bg-transparent border-0 cursor-pointer p-1.5 rounded-xl hover:bg-red-50 outline-none flex items-center justify-center shrink-0 transition"
                  >
                    <Icon path={icons.trash} size={15} />
                  </button>
                </div>
              ))}

              {selectedDateEvents.length === 0 && (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200 p-4">
                  <Icon path={icons.calendar} size={24} color="#d1d5db" className="mx-auto mb-2" />
                  <p className="text-xs text-gray-400 italic font-semibold">No special school events listed for this date.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
