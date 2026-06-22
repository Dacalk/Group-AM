import { FaBars } from "react-icons/fa";
import { NotificationBell } from "../UI";

function Header({ onMenuClick }) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-gray-100 md:border-b-0 md:pb-0">
      <button 
        onClick={onMenuClick}
        className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 md:hidden cursor-pointer border-0 bg-transparent outline-none"
      >
        <FaBars size={20} />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <NotificationBell />
      </div>
    </div>
  );
}

export default Header;