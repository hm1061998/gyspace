import React, { ReactNode, useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ListBulletIcon,
  PlusIcon,
  LogoutIcon,
  UserIcon,
  ArrowLeftIcon,
  MenuIcon,
  CloseIcon,
} from "@/components/common/icons";
interface NavItemProps {
  to: string;
  end?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, end, icon, label, onClick }) => {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
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

export type AdminOutletContext = {
  setPageHeader: (
    title: string | null,
    onBack?: () => void,
    data?: any
  ) => void;
};

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [headerState, setHeaderState] = useState<{
    title: string | null;
    onBack?: () => void;
    data?: any;
  }>({ title: null });

  // Reset header state and close sidebar on location change
  useEffect(() => {
    setHeaderState({ title: null, onBack: undefined });
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const setPageHeader = (
    title: string | null,
    onBack?: () => void,
    data?: any
  ) => {
    setHeaderState({ title, onBack, data });
  };

  const getPageTitle = () => {
    if (headerState.title) return headerState.title;

    if (location.pathname === "/admin") return "Tổng quan";
    if (location.pathname.startsWith("/admin/idiom/list")) return "Kho từ vựng";
    if (location.pathname.startsWith("/admin/idiom/insert"))
      return "Thêm từ mới";
    if (location.pathname.startsWith("/admin/idiom/detail"))
      return `Chi tiết từ vựng ${headerState.data?.hanzi}`;
    return "Admin Portal";
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={"/assets/app_icon.png"}
              alt={__APP_NAME__}
              className="w-8 h-8 rounded-lg shadow-lg shadow-red-900/50"
            />
            <div>
              <h1 className="text-lg font-bold font-hanzi text-white tracking-wide">
                {__APP_NAME__}
              </h1>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">
                Admin Portal
              </span>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white transition-colors"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
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
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-10 transition-all">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button - Show only on mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MenuIcon className="w-6 h-6" />
            </button>

            {headerState.onBack && (
              <button
                onClick={headerState.onBack}
                className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 hover:text-red-700 rounded-full transition-colors"
                title="Quay lại"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg md:text-xl font-bold text-slate-800 animate-in fade-in slide-in-from-left-2 duration-300 truncate max-w-[200px] md:max-w-none">
              {getPageTitle()}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                <UserIcon className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-600 pr-2 hidden md:block">
                Administrator
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <Outlet context={{ setPageHeader } satisfies AdminOutletContext} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
