import React from "react";
import {
  CheckCircle,
  PlayCircle,
  Clock,
  Users,
  MapPin,
  BookOpen,
} from "lucide-react";

const ScheduleTable = ({ weeklySchedule: propSchedule }) => {
  // Fallback Weekly Schedule Data
  const fallbackSchedule = {
    timeSlots: [
      "8:30 AM - 9:15 AM",
      "9:15 AM - 10:00 AM",
      "10:00 AM - 10:45 AM",
      "10:45 AM - 11:00 AM",
      "11:00 AM - 11:45 AM",
      "11:45 AM - 12:15 PM",
      "12:15 PM - 12:45 PM",
      "12:45 PM - 1:30 PM",
      "1:30 PM - 2:15 PM",
    ],
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    schedule: {
      "8:30 AM - 9:15 AM": {
        Monday: {
          className: "Grade 7-A",
          subject: "Math",
          room: "R101",
          hasClass: true,
          color: "bg-blue-100 border-blue-200",
        },
        Tuesday: { hasClass: false },
        Wednesday: {
          className: "Grade 7-A",
          subject: "Math",
          room: "R101",
          hasClass: true,
          color: "bg-blue-100 border-blue-200",
        },
        Thursday: { hasClass: false },
        Friday: {
          className: "Grade 7-A",
          subject: "Math",
          room: "R101",
          hasClass: true,
          color: "bg-blue-100 border-blue-200",
        },
      },
      "9:15 AM - 10:00 AM": {
        Monday: { hasClass: false },
        Tuesday: {
          className: "Grade 8-B",
          subject: "Math",
          room: "R105",
          hasClass: true,
          color: "bg-green-100 border-green-200",
        },
        Wednesday: { hasClass: false },
        Thursday: {
          className: "Grade 8-B",
          subject: "Math",
          room: "R105",
          hasClass: true,
          color: "bg-green-100 border-green-200",
        },
        Friday: { hasClass: false },
      },
      "10:00 AM - 10:45 AM": {
        Monday: {
          className: "Grade 6-A",
          subject: "Algebra",
          room: "R101",
          hasClass: true,
          color: "bg-purple-100 border-purple-200",
        },
        Tuesday: { hasClass: false },
        Wednesday: {
          className: "Grade 6-A",
          subject: "Algebra",
          room: "R101",
          hasClass: true,
          color: "bg-purple-100 border-purple-200",
        },
        Thursday: { hasClass: false },
        Friday: { hasClass: false },
      },
      "10:45 AM - 11:00 AM": {
        Monday: { hasClass: false },
        Tuesday: { hasClass: false },
        Wednesday: { hasClass: false },
        Thursday: { hasClass: false },
        Friday: { hasClass: false },
      },
      "11:00 AM - 11:45 AM": {
        Monday: { hasClass: false },
        Tuesday: { hasClass: false },
        Wednesday: { hasClass: false },
        Thursday: { hasClass: false },
        Friday: { hasClass: false },
      },
      "11:45 AM - 12:15 PM": {
        Monday: { hasClass: false, isBreak: true, breakLabel: "Lunch Break" },
        Tuesday: { hasClass: false, isBreak: true, breakLabel: "Lunch Break" },
        Wednesday: {
          hasClass: false,
          isBreak: true,
          breakLabel: "Lunch Break",
        },
        Thursday: { hasClass: false, isBreak: true, breakLabel: "Lunch Break" },
        Friday: { hasClass: false, isBreak: true, breakLabel: "Lunch Break" },
      },
      "12:15 PM - 12:45 PM": {
        Monday: { hasClass: false },
        Tuesday: { hasClass: false },
        Wednesday: { hasClass: false },
        Thursday: { hasClass: false },
        Friday: { hasClass: false },
      },
      "12:45 PM - 1:30 PM": {
        Monday: { hasClass: false },
        Tuesday: {
          className: "Grade 9-C",
          subject: "Calculus",
          room: "R203",
          hasClass: true,
          color: "bg-orange-100 border-orange-200",
        },
        Wednesday: { hasClass: false },
        Thursday: {
          className: "Grade 9-C",
          subject: "Calculus",
          room: "R203",
          hasClass: true,
          color: "bg-orange-100 border-orange-200",
        },
        Friday: {
          className: "Grade 9-C",
          subject: "Calculus",
          room: "R203",
          hasClass: true,
          color: "bg-orange-100 border-orange-200",
        },
      },
      "1:30 PM - 2:15 PM": {
        Monday: {
          className: "Grade 7-B",
          subject: "Math",
          room: "R101",
          hasClass: true,
          color: "bg-pink-100 border-pink-200",
        },
        Tuesday: { hasClass: false },
        Wednesday: {
          className: "Grade 7-B",
          subject: "Math",
          room: "R101",
          hasClass: true,
          color: "bg-pink-100 border-pink-200",
        },
        Thursday: { hasClass: false },
        Friday: {
          className: "Grade 7-B",
          subject: "Math",
          room: "R101",
          hasClass: true,
          color: "bg-pink-100 border-pink-200",
        },
      },
    },
  };

  const slotInfo = {
    "8:30 AM - 9:15 AM": { period: "Period 1", time: "8:30 AM - 9:15 AM" },
    "9:15 AM - 10:00 AM": { period: "Period 2", time: "9:15 AM - 10:00 AM" },
    "10:00 AM - 10:45 AM": { period: "Period 3", time: "10:00 AM - 10:45 AM" },
    "10:45 AM - 11:00 AM": { period: "Period 4", time: "10:45 AM - 11:00 AM" },
    "11:00 AM - 11:45 AM": { period: "Period 5", time: "11:00 AM - 11:45 AM" },
    "11:45 AM - 12:15 PM": { period: "Lunch", time: "11:45 AM - 12:15 PM", isBreak: true },
    "12:15 PM - 12:45 PM": { period: "Period 6", time: "12:15 PM - 12:45 PM" },
    "12:45 PM - 1:30 PM": { period: "Period 7", time: "12:45 PM - 1:30 PM" },
    "1:30 PM - 2:15 PM": { period: "Period 8", time: "1:30 PM - 2:15 PM" }
  };

  const getSlotInfo = (timeSlot, index) => {
    if (slotInfo[timeSlot]) return slotInfo[timeSlot];
    if (timeSlot.toLowerCase().includes('lunch') || timeSlot.toLowerCase().includes('break') || timeSlot.includes('11:45')) {
      return { period: "Lunch", time: timeSlot, isBreak: true };
    }
    return { period: `Period ${index + 1}`, time: timeSlot };
  };

  const weeklySchedule = propSchedule || fallbackSchedule;

  // Helper function to render cell content
  const renderCellContent = (cellData) => {
    if (cellData.isBreak) {
      return (
        <div className="text-center py-4">
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {cellData.breakLabel}
          </span>
        </div>
      );
    }

    if (cellData.hasClass) {
      return (
        <div
          className={`p-3 rounded-lg border ${cellData.color} hover:shadow-md transition-shadow`}
        >
          <div className="font-semibold text-gray-800 text-sm">
            {cellData.className}
          </div>
          <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {cellData.subject}
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {cellData.room}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-6">
        <span className="text-gray-300 text-sm">—</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/40">
        <h2 className="text-lg font-semibold text-gray-800">
          Weekly Timetable
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Your class schedule for the current week
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-100 text-center">
                Period
              </th>
              {weeklySchedule.days.map((day) => (
                <th
                  key={day}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-45"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {weeklySchedule.timeSlots.map((timeSlot, index) => {
              const info = getSlotInfo(timeSlot, index);
              
              if (info.isBreak) {
                return (
                  <tr
                    key={timeSlot}
                    className="bg-amber-50/30 hover:bg-amber-50/40 transition-colors"
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap sticky left-0 bg-[#FEFBF2] z-10 border-r border-gray-150 text-center">
                      <div className="font-extrabold text-amber-900 text-sm">{info.period}</div>
                      <div className="text-[10px] text-amber-700 font-medium mt-0.5">{info.time}</div>
                    </td>
                    <td
                      colSpan={weeklySchedule.days.length}
                      className="px-4 py-3.5 text-center align-middle font-bold text-amber-800 text-sm bg-amber-50/20"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>Lunch (30 mins)</span>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr
                  key={timeSlot}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3.5 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-100 text-center">
                    <div className="font-extrabold text-gray-800 text-sm">{info.period}</div>
                    <div className="text-[10px] text-gray-500 font-medium mt-0.5">{info.time}</div>
                  </td>
                  {weeklySchedule.days.map((day) => {
                    const cellData = weeklySchedule.schedule[timeSlot]?.[day] || {
                      hasClass: false,
                    };
                    return (
                      <td key={day} className="px-4 py-3.5 align-top">
                        {renderCellContent(cellData)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/40">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Class Legend</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
            <span className="text-xs text-gray-600">Grade 7-A (Math)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
            <span className="text-xs text-gray-600">Grade 8-B (Math)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></div>
            <span className="text-xs text-gray-600">Grade 6-A (Algebra)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200"></div>
            <span className="text-xs text-gray-600">Grade 9-C (Calculus)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-pink-100 border border-pink-200"></div>
            <span className="text-xs text-gray-600">Grade 7-B (Math)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100"></div>
            <span className="text-xs text-gray-600">No Class (—)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTable;
