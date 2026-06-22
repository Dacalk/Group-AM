import {
  LayoutDashboard,
  BookOpen,
  Users,
  BookMarked,
  RotateCcw,
  History,
  Settings,
  LogOut,
  MessageSquare
} from "lucide-react";
import React from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function LibrarySidebar({ activePage, setActivePage, onRoleChange, currentUser, isOpen, onClose }) {
  const menu = [
    { name: "Dashboard", key: "dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Books", key: "books", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Transactions", key: "transactions", icon: <History className="w-5 h-5" /> },
    { name: "Messages", key: "messages", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "My Profile", key: "profile", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className={cn(
      "w-64 h-screen bg-[#1f1b4d] text-white fixed flex flex-col z-[100] transition-transform duration-300",
      isOpen ? "translate-x-0" : "-translate-x-full",
      "md:translate-x-0"
    )}>

      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold">EduLib</h1>
        <p className="text-sm text-gray-300">Library System</p>
      </div>

      <div className="flex-1 p-4 space-y-2">
        <p className="text-[10px] font-semibold text-indigo-300/50 px-2 pb-2 uppercase tracking-widest">
          Librarian Portal
        </p>
        {menu.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setActivePage(item.key);
              if (onClose) onClose();
            }}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg border-0 outline-none text-left cursor-pointer transition-all",
              activePage === item.key
                ? "bg-indigo-600 text-white font-semibold"
                : "bg-transparent text-indigo-100 hover:bg-white/10 hover:text-white"
            )}
          >
            {item.icon}
            <span className="text-sm">{item.name}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm", currentUser?.avatarClass || "bg-indigo-500")}>
            {currentUser?.initials || 'LB'}
          </div>
          <div>
            <p className="font-semibold text-sm">{currentUser?.name || 'Librarian'}</p>
            <p className="text-xs text-gray-300">Staff</p>
          </div>
        </div>
        <button
          onClick={() => onRoleChange(null)}
          className="w-full mt-2 text-center text-xs py-1.5 rounded-md text-red-300 hover:text-white bg-red-900/30 hover:bg-red-800/50 transition border-0 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>

    </div>
  );
}