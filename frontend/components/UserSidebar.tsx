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
} from "./icons";

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
}) => {
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
            <button
              onClick={onLogin}
              className="w-full flex items-center justify-center space-x-3 py-4 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all font-bold"
            >
              <GoogleIcon className="w-5 h-5" />
              <span>Tiếp tục với Google</span>
            </button>
          ) : (
            <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-14 h-14 bg-red-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner shadow-black/10">
                U
              </div>
              <div>
                <h3 className="font-bold text-slate-800">VIP User</h3>
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1 ${
                    isPremium
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isPremium ? "Gói Premium ✨" : "Gói Miễn phí"}
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
              <div className="flex items-center space-x-3 text-slate-600 font-bold group-hover:text-red-600">
                <ListBulletIcon className="w-5 h-5" /> <span>Trang chủ</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-300" />
            </button>
            <button
              onClick={() => {
                onViewChange("flashcards");
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition-all group"
            >
              <div className="flex items-center space-x-3 text-slate-600 font-bold group-hover:text-red-600">
                <CardIcon className="w-5 h-5" /> <span>Thẻ từ học tập</span>
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
              <div className="flex items-center space-x-3 text-slate-600 font-bold group-hover:text-red-600">
                <BookmarkIcon className="w-5 h-5" /> <span>Từ vựng đã lưu</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-300" />
            </button>
          </div>

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
              <div className="flex items-center space-x-3 text-slate-600 font-bold group-hover:text-red-600">
                <ListBulletIcon className="w-5 h-5" />{" "}
                <span>Kho dữ liệu gốc</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-300" />
            </button>
            <button
              onClick={() => {
                onViewChange("insert");
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 bg-red-50 hover:bg-red-100 rounded-xl transition-all group border border-red-100"
            >
              <div className="flex items-center space-x-3 text-red-700 font-bold">
                <PlusIcon className="w-5 h-5" /> <span>Thêm dữ liệu mới</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-red-300" />
            </button>
          </div>

          <div className="pt-8 border-t flex justify-center space-x-6">
            <button className="text-slate-300 hover:text-[#1877F2] transition-colors">
              <FacebookIcon className="w-6 h-6" />
            </button>
            <button className="text-slate-300 hover:text-black transition-colors">
              <TikTokIcon className="w-6 h-6" />
            </button>
            <button className="text-slate-300 hover:text-[#E4405F] transition-colors">
              <InstagramIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {isLoggedIn && (
          <div className="p-6 border-t bg-slate-50">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 text-slate-500 font-bold hover:text-red-600 transition-all py-2"
            >
              <LogoutIcon className="w-5 h-5" />
              <span>Đăng xuất khỏi hệ thống</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default UserSidebar;
