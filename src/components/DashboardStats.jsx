// import React from "react";
// import {
//   Users,
//   Calendar,
//   TrendingUp,
//   Clock,
//   Bell,
//   BarChart3,
//   CheckCircle,
//   UsersRound,
//   FileText,
// } from "lucide-react";

// const DashboardStats = ({ stats, scheduleData }) => {
//   const statCards = [
//     {
//       title: "Total Students",
//       value: stats.totalStudents,
//       icon: Users,
//       bgColor: "bg-blue-50",
//       textColor: "text-blue-600",
//       borderColor: "border-blue-100",
//     },
//     {
//       title: "Today's Classes",
//       value: stats.todayClasses,
//       icon: Calendar,
//       bgColor: "bg-emerald-50",
//       textColor: "text-emerald-600",
//       borderColor: "border-emerald-100",
//     },
//     {
//       title: "Avg Attendance",
//       value: `${stats.avgAttendance}%`,
//       icon: TrendingUp,
//       bgColor: "bg-amber-50",
//       textColor: "text-amber-600",
//       borderColor: "border-amber-100",
//     },
//     {
//       title: "Pending Marks",
//       value: stats.pendingMarks,
//       icon: Clock,
//       bgColor: "bg-rose-50",
//       textColor: "text-rose-600",
//       borderColor: "border-rose-100",
//     },
//   ];

//   // Quick Stats data - Individual grade attendance
//   const quickStats = [
//     {
//       title: "Grade 7-A Attendance",
//       value: "92%",
//       color: "text-green-600",
//       bgColor: "bg-green-100",
//     },
//     {
//       title: "Grade 8-B Attendance",
//       value: "85%",
//       color: "text-blue-600",
//       bgColor: "bg-blue-100",
//     },
//     {
//       title: "Grade 6-A Attendance",
//       value: "78%",
//       color: "text-yellow-600",
//       bgColor: "bg-yellow-100",
//     },
//     {
//       title: "Grade 9-C Attendance",
//       value: "95%",
//       color: "text-purple-600",
//       bgColor: "bg-purple-100",
//     },
//   ];

//   // Default schedule data if not provided
//   const defaultSchedule = [
//     {
//       time: "8:00 AM",
//       class: "Grade 7-A",
//       subject: "Mathematics",
//       room: "Room 101",
//       students: 32,
//       status: "Completed",
//     },
//     {
//       time: "9:30 AM",
//       class: "Grade 8-B",
//       subject: "Mathematics",
//       room: "Room 105",
//       students: 28,
//       status: "In Progress",
//     },
//     {
//       time: "11:00 AM",
//       class: "Grade 6-A",
//       subject: "Algebra",
//       room: "Room 101",
//       students: 30,
//       status: "Upcoming",
//     },
//     {
//       time: "1:00 PM",
//       class: "Grade 9-C",
//       subject: "Calculus",
//       room: "Room 203",
//       students: 25,
//       status: "Upcoming",
//     },
//     {
//       time: "2:30 PM",
//       class: "Grade 7-B",
//       subject: "Mathematics",
//       room: "Room 101",
//       students: 29,
//       status: "Upcoming",
//     },
//   ];

//   const schedule = scheduleData || defaultSchedule;

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Completed":
//         return "bg-green-100 text-green-700";
//       case "In Progress":
//         return "bg-blue-100 text-blue-700";
//       case "Upcoming":
//         return "bg-gray-100 text-gray-600";
//       default:
//         return "bg-gray-100 text-gray-600";
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header with Teacher Dashboard and Bell Icon */}
//       <div className="flex items-center justify-between mb-2">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
//             Teacher Dashboard
//           </h1>
//           <p className="text-gray-500 text-sm mt-1">
//             {stats.greeting} Here's your overview for today.
//           </p>
//         </div>
//         <div className="relative">
//           <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200">
//             <Bell className="w-5 h-5" />
//             <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//           </button>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//         {statCards.map((card, index) => {
//           const Icon = card.icon;
//           return (
//             <div
//               key={index}
//               className={`bg-white rounded-xl border ${card.borderColor} p-5 shadow-sm hover:shadow-md transition-shadow duration-200`}
//             >
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
//                     {card.title}
//                   </p>
//                   <p className={`text-3xl font-bold mt-2 ${card.textColor}`}>
//                     {card.value}
//                   </p>
//                 </div>
//                 <div className={`${card.bgColor} p-3 rounded-full`}>
//                   <Icon className={`w-6 h-6 ${card.textColor}`} />
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Today's Schedule and Quick Stats Section - Side by Side */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
//         {/* Today's Schedule Table - Takes 2/3 of the space */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-200">
//               <h2 className="text-lg font-semibold text-gray-800">
//                 Today's Schedule
//               </h2>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       TIME
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       CLASS
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       SUBJECT
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       ROOM
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       STUDENTS
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       STATUS
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {schedule.map((item, index) => (
//                     <tr
//                       key={index}
//                       className="hover:bg-gray-50 transition-colors"
//                     >
//                       <td className="px-6 py-4 text-sm text-gray-900 font-medium">
//                         {item.time}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-600">
//                         {item.class}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-600">
//                         {item.subject}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-600">
//                         {item.room}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-600">
//                         {item.students}
//                       </td>
//                       <td className="px-6 py-4">
//                         <span
//                           className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}
//                         >
//                           {item.status}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         {/* Quick Stats - Takes 1/3 of the space */}
//         <div>
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
//             <div className="px-5 py-4 border-b border-gray-200">
//               <h2 className="text-lg font-semibold text-gray-800">
//                 Quick Stats
//               </h2>
//             </div>
//             <div className="divide-y divide-gray-100">
//               {quickStats.map((stat, index) => (
//                 <div
//                   key={index}
//                   className="px-5 py-4 hover:bg-gray-50 transition-colors"
//                 >
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-sm font-medium text-gray-600">
//                       {stat.title}
//                     </p>
//                     <p className={`text-xl font-bold ${stat.color}`}>
//                       {stat.value}
//                     </p>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div
//                       className={`rounded-full h-2 transition-all duration-500 ${
//                         stat.value === "92%"
//                           ? "bg-green-500 w-[92%]"
//                           : stat.value === "85%"
//                             ? "bg-blue-500 w-[85%]"
//                             : stat.value === "78%"
//                               ? "bg-yellow-500 w-[78%]"
//                               : "bg-purple-500 w-[95%]"
//                       }`}
//                     ></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardStats;

import React from "react";
import { Users, Calendar, TrendingUp, Clock, Bell } from "lucide-react";

const DashboardStats = () => {
  // Dummy Stats Data
  const dummyStats = {
    greeting: "Good morning, Ms. Johnson!",
    totalStudents: 142,
    todayClasses: 5,
    avgAttendance: 88,
    pendingMarks: 3,
  };

  const statCards = [
    {
      title: "Total Students",
      value: dummyStats.totalStudents,
      icon: Users,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-100",
    },
    {
      title: "Today's Classes",
      value: dummyStats.todayClasses,
      icon: Calendar,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-100",
    },
    {
      title: "Avg Attendance",
      value: `${dummyStats.avgAttendance}%`,
      icon: TrendingUp,
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      borderColor: "border-amber-100",
    },
    {
      title: "Pending Marks",
      value: dummyStats.pendingMarks,
      icon: Clock,
      bgColor: "bg-rose-50",
      textColor: "text-rose-600",
      borderColor: "border-rose-100",
    },
  ];

  // Quick Stats data - Individual grade attendance
  const quickStats = [
    {
      title: "Grade 7-A Attendance",
      value: "92%",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Grade 8-B Attendance",
      value: "85%",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Grade 6-A Attendance",
      value: "78%",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Grade 9-C Attendance",
      value: "95%",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  // Default schedule data
  const defaultSchedule = [
    {
      time: "8:00 AM",
      class: "Grade 7-A",
      subject: "Mathematics",
      room: "Room 101",
      students: 32,
      status: "Completed",
    },
    {
      time: "9:30 AM",
      class: "Grade 8-B",
      subject: "Mathematics",
      room: "Room 105",
      students: 28,
      status: "In Progress",
    },
    {
      time: "11:00 AM",
      class: "Grade 6-A",
      subject: "Algebra",
      room: "Room 101",
      students: 30,
      status: "Upcoming",
    },
    {
      time: "1:00 PM",
      class: "Grade 9-C",
      subject: "Calculus",
      room: "Room 203",
      students: 25,
      status: "Upcoming",
    },
    {
      time: "2:30 PM",
      class: "Grade 7-B",
      subject: "Mathematics",
      room: "Room 101",
      students: 29,
      status: "Upcoming",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Upcoming":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Teacher Dashboard and Bell Icon */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Teacher Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {dummyStats.greeting} Here's your overview for today.
          </p>
        </div>
        <div className="relative">
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-white rounded-xl border ${card.borderColor} p-5 shadow-sm hover:shadow-md transition-shadow duration-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {card.title}
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${card.textColor}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`${card.bgColor} p-3 rounded-full`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Schedule and Quick Stats Section - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Today's Schedule Table - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Today's Schedule
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TIME
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CLASS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SUBJECT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ROOM
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STUDENTS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {defaultSchedule.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {item.time}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.class}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.subject}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.room}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.students}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Stats - Takes 1/3 of the space */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Quick Stats
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {quickStats.map((stat, index) => (
                <div
                  key={index}
                  className="px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className={`text-xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`rounded-full h-2 transition-all duration-500 ${
                        stat.value === "92%"
                          ? "bg-green-500 w-[92%]"
                          : stat.value === "85%"
                            ? "bg-blue-500 w-[85%]"
                            : stat.value === "78%"
                              ? "bg-yellow-500 w-[78%]"
                              : "bg-purple-500 w-[95%]"
                      }`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
