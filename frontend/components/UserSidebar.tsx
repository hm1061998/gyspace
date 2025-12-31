import React from "react";
import {
  CloseIcon,
  BookmarkIcon,
  CardIcon,
  LogoutIcon,
  ChevronRightIcon,
  ListBulletIcon,
  UserIcon,
  PuzzlePieceIcon,
  HistoryIcon,
  HomeIcon,
  BrainIcon,
} from "./icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "@/services/ui/toastService";
import { useLocation } from "react-router-dom";

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onViewChange: (
    view:
      | "home"
      | "flashcards"
      | "saved"
      | "insert"
      | "list"
      | "history"
      | "word_search"
  ) => void;
  onLogin: () => void;
  onLogout: () => void;
  isPremium: boolean;
  onTogglePremium: () => void;
}

const UserSidebar: React.FC<UserSidebarProps> = ({
  isOpen,
  onClose,
  isLoggedIn,
  isAdmin,
  onViewChange,
  onLogin,
  onLogout,
}) => {
  const { user: reduxUser } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  const isPathActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const getAvatarColor = (name: string) => {
    if (!name) return "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)";
    const charCode = name.charCodeAt(0);
    const hue = Math.floor(((charCode - 65) / 26) * 360);
    return `linear-gradient(135deg, hsl(${hue}, 70%, 50%) 0%, hsl(${hue}, 80%, 30%) 100%)`;
  };

  const username = reduxUser?.username || "Người dùng";
  const avatarChar = username.charAt(0).toUpperCase();
  const avatarBg = getAvatarColor(username);

  const MenuButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: "default" | "danger" | "premium";
    badge?: string;
    isActive?: boolean;
  }> = ({ icon, label, onClick, variant = "default", badge, isActive }) => {
    const baseStyles =
      "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden";
    const variants = {
      default: isActive
        ? "bg-red-600 text-white shadow-lg shadow-red-200"
        : "hover:bg-slate-50 text-slate-600 hover:text-red-600",
      danger: "hover:bg-red-50 text-slate-500 hover:text-red-700",
      premium:
        "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-100",
    };

    return (
      <button
        onClick={onClick}
        className={`${baseStyles} ${variants[variant]}`}
      >
        <div className="flex items-center space-x-4 relative z-10">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300 transform ${
              isActive
                ? "bg-white/20 text-white border border-white/30"
                : "bg-white text-slate-600 border border-slate-100"
            }`}
          >
            {icon}
          </div>
          <div className="flex flex-col items-start">
            <span className="font-bold text-sm tracking-tight">{label}</span>
            {badge && (
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-red-10" : "opacity-70"
                }`}
              >
                {badge}
              </span>
            )}
          </div>
        </div>
        <ChevronRightIcon
          className={`w-4 h-4 transition-all transform ${
            isActive
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
          }`}
        />
      </button>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div
        className={`fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] z-[101] transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header Section */}
        <div className="p-6 pb-4 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-12 -mt-12 opacity-50 blur-3xl animate-pulse" />
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              Menu{" "}
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
            </h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
              GYSpace Navigation
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-all duration-300 active:scale-90 border border-slate-100"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
          {/* Profile Card Section */}
          <div className="relative group">
            {!isLoggedIn ? (
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]">
                <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                  <BrainIcon className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">Xin chào!</h3>
                  <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                    {" "}
                    Đăng nhập để đồng bộ hóa lịch sử và lộ trình học tập của
                    bạn.
                  </p>
                  <button
                    onClick={onLogin}
                    className="w-full flex items-center justify-center space-x-3 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 active:scale-[0.98] font-bold"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>Bắt đầu ngay</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center space-x-5 group transition-all hover:border-red-100">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 border border-white/20"
                  style={{ background: avatarBg }}
                >
                  {avatarChar}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-slate-800 text-base truncate group-hover:text-red-600 transition-colors">
                    {username}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        isAdmin
                          ? "bg-red-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {isAdmin ? "Admin" : "Learner"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links Group */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-4 mb-3">
              {" "}
              Khám phá học tập{" "}
            </h4>
            <div className="grid grid-cols-1 gap-1">
              <MenuButton
                icon={<HomeIcon className="w-5 h-5" />}
                label="Trang chủ"
                isActive={isPathActive("/")}
                onClick={() => {
                  onViewChange("home");
                  onClose();
                }}
              />
              <MenuButton
                icon={<CardIcon className="w-5 h-5" />}
                label="Thẻ từ học tập"
                badge="Luyện ghi nhớ SRS"
                isActive={isPathActive("/flashcards")}
                onClick={() => {
                  onViewChange("flashcards");
                  onClose();
                }}
              />
              <MenuButton
                icon={<PuzzlePieceIcon className="w-5 h-5" />}
                label="Trò chơi tìm chữ"
                badge="Giải trí & Học tập"
                isActive={isPathActive("/word_search")}
                onClick={() => {
                  onViewChange("word_search");
                  onClose();
                }}
              />
            </div>
          </div>

          {/* User Data Group */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-4 mb-3">
              {" "}
              Cá nhân của bạn{" "}
            </h4>
            <div className="grid grid-cols-1 gap-1">
              <MenuButton
                icon={<BookmarkIcon className="w-5 h-5" />}
                label="Từ vựng đã lưu"
                isActive={isPathActive("/saved")}
                onClick={() => {
                  if (!isLoggedIn) {
                    toast.error("Vui lòng đăng nhập");
                    return;
                  }
                  onViewChange("saved");
                  onClose();
                }}
              />
              <MenuButton
                icon={<HistoryIcon className="w-5 h-5" />}
                label="Lịch sử tra cứu"
                isActive={isPathActive("/history")}
                onClick={() => {
                  if (!isLoggedIn) {
                    toast.error("Vui lòng đăng nhập");
                    return;
                  }
                  onViewChange("history");
                  onClose();
                }}
              />
            </div>
          </div>

          {/* Admin Controls */}
          {isLoggedIn && isAdmin && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-red-400 uppercase tracking-[0.25em] ml-4 mb-3">
                {" "}
                Hệ thống Admin{" "}
              </h4>
              <MenuButton
                icon={<ListBulletIcon className="w-5 h-5" />}
                label="Bảng quản trị"
                badge="Quản lý dữ liệu"
                isActive={isPathActive("/admin")}
                onClick={() => {
                  onViewChange("list");
                  onClose();
                }}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {isLoggedIn && (
          <div className="p-6 pt-2">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-3 py-3.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 group border border-transparent hover:border-red-100"
            >
              <LogoutIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-bold text-sm">Đăng xuất hệ thống</span>
            </button>
            <p className="text-[9px] text-center text-slate-300 mt-4 font-medium uppercase tracking-widest">
              GYSpace &copy; 2025
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default UserSidebar;
