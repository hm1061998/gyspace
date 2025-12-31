import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeftIcon, MenuIcon } from "./icons";
interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra xem có đang ở trang chủ hay không
  // Hỗ trợ "/", rỗng, hoặc "/index.html" (thường gặp trong môi trường web tĩnh)
  const isHome =
    location.pathname === "/" ||
    location.pathname === "/index.html" ||
    location.pathname === "";

  const handleBack = () => {
    // Luôn quay về Trang chủ cho User Flow
    navigate("/");
  };

  // Header này chỉ dùng cho User Layout, không còn dùng cho Admin
  const shouldShowBackButton = !isHome;

  return (
    <header
      className={`py-4 px-6 sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b transition-all ${
        isHome ? "border-transparent bg-transparent" : "border-slate-200"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Ẩn nút quay lại ở Home và Admin Dashboard */}
          {shouldShowBackButton && (
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-slate-500 hover:text-red-600 transition-colors mr-2"
              aria-label="Quay lại"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="hidden md:inline text-sm font-bold">
                Quay lại
              </span>
            </button>
          )}

          <Link to="/" className="flex items-center space-x-2 group">
            <img
              src={"/assets/app_icon.png"}
              alt="GYSpace"
              className="w-8 h-8 rounded-lg shadow-md group-hover:scale-110 transition-transform"
            />
            <h1 className="text-xl font-bold text-slate-800 font-hanzi tracking-tight">
              GYSpace
            </h1>
          </Link>
        </div>

        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Mở menu"
        >
          <MenuIcon className="w-6 h-6 text-slate-600" />
        </button>
      </div>
    </header>
  );
};

export default Header;
