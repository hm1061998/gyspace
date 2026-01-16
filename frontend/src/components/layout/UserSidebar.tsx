import React from "react";
import {
  CloseIcon,
  BookmarkIcon,
  BookOpenIcon,
  CardIcon,
  LogoutIcon,
  ChevronRightIcon,
  ListBulletIcon,
  UserIcon,
  PuzzlePieceIcon,
  HistoryIcon,
  HomeIcon,
  BrainIcon,
  SettingsIcon,
  ExclamationIcon,
} from "@/components/common/icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "@/libs/Toast";
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
      | "exercises"
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

  const displayName =
    reduxUser?.displayName || reduxUser?.username || "Người dùng";
  const avatarChar = displayName.charAt(0).toUpperCase();
  const avatarBg = getAvatarColor(displayName);

  const MenuButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: "default" | "danger" | "premium" | "ghost";
    badge?: string;
    isActive?: boolean;
    compact?: boolean;
  }> = ({
    icon,
    label,
    onClick,
    variant = "default",
    badge,
    isActive,
    compact,
  }) => {
    const baseStyles =
      "w-full flex items-center justify-between transition-all duration-300 group relative overflow-hidden";

    const padding = compact ? "px-3 py-2 rounded-lg" : "px-4 py-3 rounded-xl";

    const variants = {
      default: isActive
        ? "bg-red-600 text-white shadow-lg shadow-red-200"
        : "hover:bg-slate-50 text-slate-600 hover:text-red-600",
      ghost: isActive
        ? "bg-slate-100 text-red-600"
        : "hover:bg-slate-50 text-slate-500 hover:text-slate-800",
      danger: "hover:bg-red-50 text-slate-500 hover:text-red-700",
      premium:
        "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-100",
    };

    return (
      <button
        onClick={onClick}
        className={`${baseStyles} ${padding} ${
          variants[variant === "ghost" ? "ghost" : variant]
        }`}
      >
        <div className="flex items-center space-x-3.5 relative z-10">
          <div
            className={`rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300 transform ${
              compact ? "w-8 h-8" : "w-10 h-10"
            } ${
              isActive
                ? "bg-white/20 text-white border border-white/30"
                : "bg-white text-slate-600 border border-slate-100"
            }`}
          >
            {React.cloneElement(icon as React.ReactElement, {
              className: compact ? "w-4.5 h-4.5" : "w-5 h-5",
            })}
          </div>
          <div className="flex flex-col items-start overflow-hidden">
            <span
              className={`font-bold tracking-tight truncate ${
                compact ? "text-xs" : "text-sm"
              }`}
            >
              {label}
            </span>
            {badge && !compact && (
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-red-100" : "opacity-70"
                }`}
              >
                {badge}
              </span>
            )}
          </div>
        </div>
        {!compact && (
          <ChevronRightIcon
            className={`w-4 h-4 transition-all transform ${
              isActive
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
            }`}
          />
        )}
      </button>
    );
  };

  const Section: React.FC<{
    title: string;
    children: React.ReactNode;
    color?: string;
  }> = ({ title, children, color = "text-slate-400" }) => (
    <div className="space-y-2">
      <h4
        className={`text-[10px] font-black uppercase tracking-[0.25em] ml-4 mb-2 ${color}`}
      >
        {title}
      </h4>
      <div className="grid grid-cols-1 gap-1">{children}</div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-90 transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div
        className={`fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] z-91 transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header Section */}
        <div className="p-6 pb-2 flex justify-between items-center bg-white sticky top-0 z-20">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              Menu{" "}
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-all duration-300 active:scale-90 border border-slate-100"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-hide">
          {/* Profile Card Section */}
          <div className="relative">
            {!isLoggedIn ? (
              <div
                className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl group cursor-pointer"
                onClick={onLogin}
              >
                <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                  <BrainIcon className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">Xin chào!</h3>
                  <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                    Đăng nhập để đồng bộ hóa lịch sử và lộ trình học tập của
                    bạn.
                  </p>
                  <div className="flex items-center space-x-3 text-red-400 font-bold text-sm">
                    <span>Bắt đầu ngay</span>
                    <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-4xl p-4 border border-slate-100 shadow-inner">
                <div className="flex items-center space-x-3 mb-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-slate-200 border-4 border-white"
                    style={{ background: avatarBg }}
                  >
                    {avatarChar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-slate-800 text-lg truncate">
                      {displayName}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          isAdmin
                            ? "bg-red-600 text-white"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {isAdmin ? "Quản trị viên" : "Học viên"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onViewChange("profile" as any);
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 py-2 bg-white rounded-xl text-slate-600 text-xs font-bold border border-slate-100 hover:border-red-200 hover:text-red-600 transition-all active:scale-95"
                  >
                    <SettingsIcon className="w-3.5 h-3.5" />
                    Thiết lập
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 py-2 bg-white rounded-xl text-slate-400 text-xs font-bold border border-slate-100 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                  >
                    <LogoutIcon className="w-3.5 h-3.5" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Groups */}
          <div className="space-y-6">
            <Section title="Hành trình học tập">
              <MenuButton
                icon={<HomeIcon className="w-5 h-5" />}
                label="Trang chủ"
                isActive={isPathActive("/")}
                onClick={() => {
                  onViewChange("home");
                  onClose();
                }}
              />
            </Section>

            <Section title="Bộ sưu tập">
              <MenuButton
                icon={<BookOpenIcon className="w-5 h-5" />}
                label="Sổ tay cá nhân"
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
              <MenuButton
                icon={<ExclamationIcon className="w-5 h-5 text-red-600" />}
                label="Báo cáo của tôi"
                isActive={isPathActive("/reports")}
                onClick={() => {
                  if (!isLoggedIn) {
                    toast.error("Vui lòng đăng nhập");
                    return;
                  }
                  onViewChange("reports");
                  onClose();
                }}
              />
            </Section>

            {isAdmin && (
              <Section title="Quản trị hệ thống" color="text-red-500">
                <MenuButton
                  icon={<ListBulletIcon className="w-5 h-5" />}
                  label="Bảng điều khiển Admin"
                  badge="Quản lý kho dữ liệu"
                  isActive={isPathActive("/admin")}
                  onClick={() => {
                    onViewChange("list");
                    onClose();
                  }}
                />
              </Section>
            )}
          </div>
        </div>

        {/* Footer / App Info */}
        <div className="p-6 border-t border-slate-50">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-300 font-bold uppercase tracking-widest">
              <span>Phiên bản {__APP_VERSION__}</span>
              <span>
                {__APP_NAME__} &copy; {new Date().getFullYear()}
              </span>
            </div>
            <div className="text-[8px] text-slate-200 font-medium">
              Bản dựng: {__BUILD_DATE__}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSidebar;
