import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeftIcon, MenuIcon } from "./icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Helper for profile color
  const getAvatarColor = (name: string) => {
    if (!name) return "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)";
    const charCode = name.charCodeAt(0);
    const hue = Math.floor(((charCode - 65) / 26) * 360);
    return `linear-gradient(135deg, hsl(${hue}, 70%, 50%) 0%, hsl(${hue}, 80%, 30%) 100%)`;
  };

  const displayName = user?.displayName || user?.username || "";
  const avatarChar = displayName ? displayName.charAt(0).toUpperCase() : "?";
  const avatarBg = getAvatarColor(displayName);

  const isHome =
    location.pathname === "/" ||
    location.pathname === "/index.html" ||
    location.pathname === "";

  const handleBack = () => {
    navigate("/");
  };

  const shouldShowBackButton = !isHome;

  return (
    <header
      className={`py-3 px-4 md:px-6 sticky top-0 z-[60] transition-all duration-300 ${
        isHome
          ? "bg-transparent border-transparent"
          : "bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-4">
          {shouldShowBackButton && (
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center bg-white shadow-sm border border-slate-100 text-slate-500 hover:text-red-600 rounded-full transition-all active:scale-90"
              aria-label="Quay lại"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-xl shadow-md border border-slate-50 flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 overflow-hidden">
              <img
                src={"/assets/app_icon.png"}
                alt="GYSpace"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base md:text-lg font-black text-slate-800 font-hanzi tracking-tight leading-none group-hover:text-red-600 transition-colors">
                GYSpace
              </h1>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Cidian
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <button
              onClick={onMenuClick}
              className="flex items-center gap-3 p-1 pr-3 bg-white hover:bg-slate-50 rounded-full border border-slate-100 shadow-sm transition-all group active:scale-95"
            >
              <div
                className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md border-2 border-white"
                style={{ background: avatarBg }}
              >
                {avatarChar}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-[11px] font-black text-slate-800 truncate max-w-[80px]">
                  {displayName}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                  {user.isAdmin ? "Admin" : "Member"}
                </span>
              </div>
              <MenuIcon className="w-4 h-4 text-slate-400 group-hover:text-red-500 ml-1" />
            </button>
          ) : (
            <button
              onClick={onMenuClick}
              className="w-10 h-10 flex items-center justify-center bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-lg active:scale-90"
              aria-label="Mở menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
