import React, { ReactNode, useState, useEffect, useRef } from "react";
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
  ChatBubbleIcon,
  FireIcon,
  ChevronDownIcon,
  ExclamationIcon,
  PuzzlePieceIcon,
  DocumentIcon,
} from "@/components/common/icons";
import { fetchCommentStats } from "@/services/api/commentService";
import { getReportStats } from "@/services/api/reportService";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
interface NavItemProps {
  to: string;
  end?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  end,
  icon,
  label,
  onClick,
  badge,
}) => {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center justify-between mx-2 px-2 py-3 rounded-xl transition-all font-medium relative ${
          isActive
            ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      <div className="flex items-center space-x-3">
        <div className="w-5 h-5">{icon}</div>
        <span>{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-black rounded-full shadow-lg absolute right-2 top-[50%] translate-y-[-50%]">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
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
  const { user } = useSelector((state: RootState) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [pendingCount, setPendingCount] = useState(0);
  const [reportPendingCount, setReportPendingCount] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mainElement = scrollContainerRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      setShowScrollTop(mainElement.scrollTop > 100);
    };

    mainElement.addEventListener("scroll", handleScroll);
    return () => mainElement.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const commentStats = await fetchCommentStats();
        setPendingCount(commentStats.pending);

        const reportStats = await getReportStats();
        setReportPendingCount(reportStats.pending);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };

    loadStats();
    const timer = setInterval(loadStats, 30000); // Poll every 30s
    return () => clearInterval(timer);
  }, []);

  // Close sidebar on location change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Menu Toggle - Floating */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-slate-900 text-white rounded-xl shadow-2xl active:scale-95 transition-all"
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      {/* Sidebar - Responsive */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={"/assets/app_icon.png"}
              alt={__APP_NAME__}
              className="w-10 h-10 rounded-xl shadow-lg shadow-red-900/50"
            />
            <div>
              <h1 className="text-xl font-bold font-hanzi text-white tracking-wide">
                {__APP_NAME__}
              </h1>
              <span className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em] block leading-none mt-1">
                Admin Portal
              </span>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white transition-colors p-1"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* User Info Section - New location */}
        <div className="px-6 mb-2">
          <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 flex items-center gap-3 group hover:bg-slate-800/60 transition-all cursor-default">
            <div className="w-10 h-10 bg-linear-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-900/30 shrink-0 group-hover:scale-105 transition-transform">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-white truncate">
                {user?.displayName || user?.username || "Administrator"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Online
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="py-6 flex-1 overflow-y-auto custom-scrollbar-dark">
          <p className="px-6 text-sm font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-2">
            Hệ thống
          </p>
          <nav className="space-y-1.5">
            <NavItem
              to="/admin"
              end
              icon={<HomeIcon />}
              label="Bảng điều khiển"
            />
            <NavItem
              to="/admin/idiom"
              icon={<ListBulletIcon />}
              label="Kho từ vựng"
            />
            {/* <NavItem
              to="/admin/idiom/insert"
              icon={<PlusIcon />}
              label="Thêm từ mới"
            /> */}
            <NavItem
              to="/admin/comments"
              icon={<ChatBubbleIcon />}
              label="Quản lý thảo luận"
              badge={pendingCount}
            />
            <NavItem
              to="/admin/reports"
              icon={<ExclamationIcon />}
              label="Báo lỗi từ điển"
              badge={reportPendingCount}
            />
            <NavItem
              to="/admin/search-logs"
              icon={<FireIcon />}
              label="Mọi người đã tìm"
            />
            {/* <NavItem
              to="/admin/exercises"
              icon={<PuzzlePieceIcon />}
              label="Quản lý bài tập"
            /> */}
            <NavItem
              to="/admin/exams"
              icon={<DocumentIcon />}
              label="Quản lý bài tập"
            />
            <NavItem
              to="/admin/users"
              icon={<UserIcon />}
              label="Quản lý người dùng"
            />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-600/10 hover:text-red-500 transition-all group font-bold text-sm"
          >
            <LogoutIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Về trang chủ Web</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 md:pt-0 pt-16">
        {/* Top Header - Removed based on user request */}

        {/* Scrollable Content */}
        <main
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto relative scroll-smooth"
        >
          <Outlet context={{ setIsSidebarOpen } satisfies any} />
        </main>

        {/* Scroll To Top Button */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 z-10 w-12 h-12 bg-slate-900 text-white rounded-xl shadow-xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 ${
            showScrollTop
              ? "translate-y-0 opacity-100"
              : "translate-y-20 opacity-0 pointer-events-none"
          }`}
          aria-label="Cuộn lên đầu trang"
        >
          <ChevronDownIcon className="w-6 h-6 transition-transform rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default AdminLayout;
