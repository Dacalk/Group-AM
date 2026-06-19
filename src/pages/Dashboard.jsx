import { Icon, icons } from '../components/Icons'
import { Badge, StatCard, PageHeader } from '../components/UI'

export default function Dashboard() {
  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Welcome back, John! Here's an overview of the school system."
      />

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Children"
          value="3"
          iconBg="bg-purple-100"
          icon={<Icon path={icons.users} size={20} color="#7c3aed" />}
        />
        <StatCard
          title="Pending Fees"
          value="$420"
          sub="Due in 5 days"
          subColor="text-orange-500"
          iconBg="bg-orange-100"
          icon={<Icon path="M3 10h18M3 6h18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" size={20} color="#f97316" />}
        />
        <StatCard
          title="Avg Attendance"
          value="91%"
          sub="+2% this month"
          subColor="text-green-600"
          iconBg="bg-green-100"
          icon={<Icon path={icons.calendar} size={20} color="#16a34a" />}
        />
        <StatCard
          title="Total Subjects"
          value="12"
          iconBg="bg-indigo-100"
          icon={<Icon path={icons.book} size={20} color="#4f46e5" />}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Children Overview</h2>
          <table className="w-full">
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
              {[
                { name: 'Emma Doe', cls: 'Grade 7', sec: 'A', roll: '07-A-12', att: '92%', attC: 'green' },
                { name: 'Liam Doe', cls: 'Grade 5', sec: 'B', roll: '05-B-08', att: '87%', attC: 'yellow' },
                { name: 'Sophia Doe', cls: 'Grade 3', sec: 'A', roll: '03-A-21', att: '95%', attC: 'green' },
              ].map((s, i) => (
                <tr key={i} className="border-t border-gray-50">
                  <td className="py-3 text-sm font-medium text-gray-800">{s.name}</td>
                  <td className="py-3 text-sm text-gray-600">{s.cls}</td>
                  <td className="py-3 text-sm text-gray-600">{s.sec}</td>
                  <td className="py-3 text-sm text-gray-600">{s.roll}</td>
                  <td className="py-3"><Badge color={s.attC}>{s.att}</Badge></td>
                  <td className="py-3"><Badge color="green">Active</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Notices</h2>
          {[
            { title: 'Annual Sports Day', date: 'June 20', color: '#5b5fc7' },
            { title: 'Parent-Teacher Meeting', date: 'June 15', color: '#f97316' },
            { title: 'Fee Due Reminder', date: 'June 10', color: '#ef4444' },
            { title: 'Science Exhibition', date: 'June 25', color: '#22c55e' },
          ].map((n, i) => (
            <div key={i} className="flex items-start gap-3 mb-4">
              <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.color }} />
              <div>
                <p className="text-sm font-medium text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-400">{n.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
