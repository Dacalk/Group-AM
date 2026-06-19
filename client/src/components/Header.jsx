import { Icon, icons } from './Icons'
import { NotificationBell } from './NotificationSystem'

export default function Header({ onMenuClick, portalTitle, currentUser, onNavigateMessages }) {
  return (
    <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30 shadow-sm">
      {/* Left section: Hamburger button, Logo, Portal Title */}
      <div className="flex items-center gap-4">
        {/* Hamburger button (Mobile only) */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 md:hidden cursor-pointer border-0 bg-transparent outline-none flex items-center justify-center"
        >
          <Icon path={icons.list} size={20} />
        </button>

        {/* Logo Icon and App Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#5b5fc7' }}>
            <Icon path={icons.graduation} size={18} color="white" />
          </div>
          <div>
            <span className="text-gray-800 font-bold text-base tracking-tight leading-none block">EduManage</span>
            <span className="text-[10px] text-gray-400 font-semibold leading-none block mt-0.5">School System</span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-gray-200 mx-2" />

        {/* Portal Title */}
        <span className="font-bold text-gray-700 text-sm sm:text-base tracking-tight">{portalTitle}</span>
      </div>

      {/* Right section: Notification Bell */}
      <div className="flex items-center gap-3">
        <NotificationBell currentUser={currentUser} onNavigateMessages={onNavigateMessages} />
      </div>
    </header>
  )
}

