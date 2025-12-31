import React, { ReactNode } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ListBulletIcon,
  PlusIcon,
  LogoutIcon,
  UserIcon,
} from "../components/icons";

interface NavItemProps {
  to: string;
  end?: boolean;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, end, icon, label }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${
          isActive
            ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      <div className="w-5 h-5">{icon}</div>
      <span>{label}</span>
    </NavLink>
  );
};

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === "/admin") return "Tổng quan";
    if (location.pathname.startsWith("/admin/idiom/list")) return "Kho từ vựng";
    if (location.pathname.startsWith("/admin/idiom/insert"))
      return "Thêm từ mới";
    if (location.pathname.startsWith("/admin/idiom/detail"))
      return "Chi tiết từ vựng";
    return "Admin Portal";
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar - Fixed Left */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-hanzi font-bold shadow-lg shadow-red-900/50">
              GY
            </div>
            <div>
              <h1 className="text-lg font-bold font-hanzi text-white tracking-wide">
                GYSpace
              </h1>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">
                Admin Portal
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-2">
            Menu
          </p>
          <nav className="space-y-1">
            <NavItem
              to="/admin"
              end
              icon={<HomeIcon />}
              label="Bảng điều khiển"
            />
            <NavItem
              to="/admin/idiom/list"
              icon={<ListBulletIcon />}
              label="Kho từ vựng"
            />
            <NavItem
              to="/admin/idiom/insert"
              icon={<PlusIcon />}
              label="Thêm từ mới"
            />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <LogoutIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Về trang chủ Web</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {getPageTitle()}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                <UserIcon className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-600 pr-2">
                Administrator
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
