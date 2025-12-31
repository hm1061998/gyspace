import React, { useState } from "react";
import { ArrowLeftIcon, SpinnerIcon, UserIcon } from "@/components/icons";
import { registerUser } from "@/services/api/authService";

interface RegisterViewProps {
  onBackToLogin: () => void;
  onBackToHome: () => void;
  onRegisterSuccess: (username: string) => void;
}

const RegisterView: React.FC<RegisterViewProps> = ({
  onBackToLogin,
  onBackToHome,
  onRegisterSuccess,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 4) {
      setError("Tên đăng nhập phải có ít nhất 4 ký tự.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await registerUser(username, password);
      onRegisterSuccess(username);
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-pop">
        <div className="bg-slate-800 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl font-hanzi font-bold shadow-inner mx-auto mb-4 backdrop-blur-md">
            GY
          </div>
          <h2 className="text-2xl font-bold text-white">Tạo tài khoản mới</h2>
          <p className="text-slate-300 text-sm mt-1">
            Bắt đầu hành trình học tập cùng GYSpace
          </p>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                placeholder="Chọn tên đăng nhập"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                placeholder="Ít nhất 6 ký tự"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <SpinnerIcon className="w-5 h-5" />
            ) : (
              "Đăng ký tài khoản"
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-slate-500 text-sm hover:text-red-600 font-medium transition-colors"
            >
              Đã có tài khoản? Đăng nhập ngay
            </button>
          </div>

          <button
            type="button"
            onClick={onBackToHome}
            className="w-full py-2 text-slate-400 text-sm hover:text-slate-600 transition-colors"
          >
            Quay lại trang chủ
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterView;
