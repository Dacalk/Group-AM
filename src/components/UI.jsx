import { Icon, icons } from './Icons'

export function Badge({ children, color = 'green' }) {
  const colors = {
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-gray-100 text-gray-600',
    orange: 'bg-orange-100 text-orange-700',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  )
}

export function StatCard({ title, value, sub, subColor = 'text-gray-500', icon, iconBg }) {
  return (
    <div className="bg-white rounded-2xl p-5 flex-1 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {sub && <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        {action}
        <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
          <Icon path={icons.bell} size={18} />
        </button>
      </div>
    </div>
  )
}

export function Input({ label, placeholder, type = 'text', value, onChange }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
    </div>
  )
}

export function Select({ label, placeholder, options = [] }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      )}
      <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 focus:outline-none bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none">
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

export function Btn({ children, onClick, variant = 'primary', icon }) {
  const styles = {
    primary: 'text-white hover:opacity-90 bg-primary',
    outline: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',
  }
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${styles[variant]}`}
    >
      {icon && <Icon path={icons[icon]} size={14} />}
      {children}
    </button>
  )
}
