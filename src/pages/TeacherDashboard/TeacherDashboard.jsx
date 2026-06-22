import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";


import DashboardStats from "../../components/DashboardStats";
import ScheduleTable from "../../components/ScheduleTable";
import AttendanceProgress from "../../components/AttendanceProgress";


function TeacherDashboard() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />

      <div className="flex-1 p-8">
        <Header />

        <div className="mt-6">
          <DashboardStats />
        </div>

        <div className="mt-6">
          <ScheduleTable />
        </div>

        <div className="mt-6">
          <AttendanceProgress />
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;