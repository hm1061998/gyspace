import React from "react";
import {
  CloseIcon,
  GoogleIcon,
  BookmarkIcon,
  CardIcon,
  LogoutIcon,
  ChevronRightIcon,
  FacebookIcon,
  TikTokIcon,
  InstagramIcon,
  PlusIcon,
  ListBulletIcon,
  UserIcon,
  PuzzlePieceIcon,
  HistoryIcon,
} from "./icons";
import { getCurrentUser } from "@/services/authService";

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onViewChange: (
    view: "home" | "flashcards" | "saved" | "insert" | "list"
  ) => void;
  isPremium: boolean;
  onTogglePremium: () => void;
}

const UserSidebar: React.FC<UserSidebarProps> = ({
  isOpen,
  onClose,
  isLoggedIn,
  onLogin,
  onLogout,
  onViewChange,
  isPremium,
  onTogglePremium,
  isAdmin,
}) => {
  const getAvatarColor = (name: string) => {
    if (!name) return "hsl(0, 70%, 60%)"; // Default Red
    const firstChar = name.charAt(0).toUpperCase();
    const charCode = firstChar.charCodeAt(0);
    // Map A-Z (65-90) to 0-360 hue
    const hue = Math.floor(((charCode - 65) / 26) * 360);
    return `hsl(${hue}, 70%, 40%)`; // Darker Pastel for text readability or use with white text
  };

  const username = getCurrentUser().username || "";
  const avatarChar = username.charAt(0).toUpperCase();
  const avatarBg = getAvatarColor(username);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="font-hanzi text-xl font-bold text-slate-800">
            Cá nhân
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {!isLoggedIn ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-1">
                Tài khoản
              </p>
              <button
                onClick={onLogin}
                className="w-full flex items-center justify-center space-x-3 py-4 bg-slate-800 text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-[0.98]"
              >
                <UserIcon className="w-5 h-5" />
                <span className="font-bold">Đăng nhập / Đăng ký</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: avatarBg }}
              >
                {avatarChar}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">
                  {getCurrentUser().username}
                </h3>
                <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight">
                  {isAdmin ? "Quản trị viên" : "Người dùng"}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-3 mb-2">
              Học tập & Lưu trữ
            </p>
            <button
              onClick={() => {
                onViewChange("home");
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition-all group"
            >
              <div className="flex items-center space-x-3 text-slate-600 group-hover:text-red-600">
                <ListBulletIcon className="w-5 h-5" />{" "}
                <span className="font-medium">Trang chủ</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-300" />
            </button>
            <button
              onClick={() => {
                onViewChange("history");
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition-colors group"
            >
              <div className="flex items-center space-x-3 text-slate-600 group-hover:text-red-700 transition-colors">
                <HistoryIcon className="w-5 h-5" />
                <span className="font-medium">Lịch sử tra cứu</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-red-300" />
            </button>
            <button
              onClick={() => {
                onViewChange("flashcards");
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition-all group"
            >
              <div className="flex items-center space-x-3 text-slate-600 group-hover:text-red-600">
                <CardIcon className="w-5 h-5" />{" "}
                <span className="font-medium">Thẻ từ học tập</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-300" />
            </button>
            <button
              onClick={() => {
                onViewChange("saved");
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition-all group"
            >
              <div className="flex items-center space-x-3 text-slate-600 group-hover:text-red-600">
                <BookmarkIcon className="w-5 h-5" />{" "}
                <span className="font-medium">Từ vựng đã lưu</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-300" />
            </button>
            <button
              onClick={() => {
                onViewChange("word_search");
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition-colors group"
            >
              <div className="flex items-center space-x-3 text-slate-600 group-hover:text-red-700 transition-colors">
                <PuzzlePieceIcon className="w-5 h-5" />
                <span className="font-medium">Game Tìm Chữ</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-red-300" />
            </button>
          </div>

          {isLoggedIn && isAdmin && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-3 mb-2">
                Quản trị hệ thống (Admin)
              </p>
              <button
                onClick={() => {
                  onViewChange("list");
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-3 text-slate-600 group-hover:text-red-600">
                  <ListBulletIcon className="w-5 h-5" />{" "}
                  <span className="font-medium">Trang quản trị</span>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-slate-300" />
              </button>
            </div>
          )}

          {/* <div className="pt-8 border-t flex justify-center space-x-6">
            <button className="text-slate-300 hover:text-[#1877F2] transition-colors">
              <FacebookIcon className="w-6 h-6" />
            </button>
            <button className="text-slate-300 hover:text-black transition-colors">
              <TikTokIcon className="w-6 h-6" />
            </button>
            <button className="text-slate-300 hover:text-[#E4405F] transition-colors">
              <InstagramIcon className="w-6 h-6" />
            </button>
          </div> */}
        </div>

        {isLoggedIn && (
          <div className="p-6 border-t bg-slate-50">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 text-slate-500 font-bold hover:text-red-600 transition-all py-2"
            >
              <LogoutIcon className="w-5 h-5" />
              <span className="font-medium">Đăng xuất khỏi hệ thống</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default UserSidebar;
