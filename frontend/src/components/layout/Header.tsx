import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeftIcon, MenuIcon } from "@/components/common/icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface HeaderProps {
  onMenuClick: () => void;
  onBack?: () => void;
  backLabel?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onBack, backLabel }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const mainContainer = document.querySelector("main");
    if (!mainContainer) return;

    const handleScroll = () => {
      setIsScrolled(mainContainer.scrollTop > 10);
    };

    mainContainer.addEventListener("scroll", handleScroll);
    return () => mainContainer.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome =
    location.pathname === "/" ||
    location.pathname === "/index.html" ||
    location.pathname === "";

  const displayName = user?.displayName || user?.username || "";
  const avatarChar = displayName ? displayName.charAt(0).toUpperCase() : "?";

  const getAvatarColor = (name: string) => {
    if (!name) return "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)";
    const charCode = name.charCodeAt(0);
    const hue = Math.floor(((charCode - 65) / 26) * 360);
    return `linear-gradient(135deg, hsl(${hue}, 70%, 50%) 0%, hsl(${hue}, 80%, 30%) 100%)`;
  };

  const avatarBg = getAvatarColor(displayName);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 md:h-20 flex items-center transition-all duration-300 ${
        isScrolled || !isHome
          ? "bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto w-full px-4 md:px-10 flex justify-between items-center">
        {/* Left Section: Back or Logo */}
        <div className="flex items-center gap-4">
          {onBack ? (
            <button
              onClick={onBack}
              className="group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-red-600 transition-colors">
                <ArrowLeftIcon className="w-4 h-4" />
              </div>
              {backLabel && (
                <span className="text-sm font-black text-slate-600 group-hover:text-slate-900 hidden sm:block">
                  {backLabel}
                </span>
              )}
            </button>
          ) : (
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-white rounded-xl shadow-md border border-slate-50 flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                <img
                  src="/assets/app_icon.png"
                  alt={__APP_NAME__}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <h1 className="text-lg font-black text-slate-800 font-hanzi tracking-tight hidden sm:block">
                {__APP_NAME__}
              </h1>
            </Link>
          )}
        </div>

        {/* Right Section: User Menu / Burger */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <button
              onClick={onMenuClick}
              className="flex items-center gap-3 p-1 pr-3 bg-white hover:bg-slate-50 rounded-full border border-slate-100 shadow-sm transition-all group active:scale-95 ml-2"
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
