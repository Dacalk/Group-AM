import React from "react";
import {
  CheckCircle,
  PlayCircle,
  Clock,
  Users,
  MapPin,
  BookOpen,
} from "lucide-react";

const ScheduleTable = () => {
  // Weekly Schedule Data
  const weeklySchedule = {
    timeSlots: [
      "8:00 - 9:00",
      "9:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "12:00 - 1:00",
      "1:00 - 2:00",
      "2:00 - 3:00",
    ],
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    schedule: {
      "8:00 - 9:00": {
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
      "9:00 - 10:00": {
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
      "10:00 - 11:00": {
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
      "11:00 - 12:00": {
        Monday: { hasClass: false },
        Tuesday: { hasClass: false },
        Wednesday: { hasClass: false },
        Thursday: { hasClass: false },
        Friday: { hasClass: false },
      },
      "12:00 - 1:00": {
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
      "1:00 - 2:00": {
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
      "2:00 - 3:00": {
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                Period / Time
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
            {weeklySchedule.timeSlots.map((timeSlot, index) => (
              <tr
                key={timeSlot}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {timeSlot}
                  </div>
                </td>
                {weeklySchedule.days.map((day) => {
                  const cellData = weeklySchedule.schedule[timeSlot]?.[day] || {
                    hasClass: false,
                  };
                  return (
                    <td key={day} className="px-4 py-3 align-top">
                      {renderCellContent(cellData)}
                    </td>
                  );
                })}
              </tr>
            ))}
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
