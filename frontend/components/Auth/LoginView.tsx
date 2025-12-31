import React, { useState } from "react";
import { ArrowLeftIcon, SpinnerIcon } from "../icons";
import { loginAdmin } from "@/services/authService";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/authSlice";

interface LoginViewProps {
  onLoginSuccess: () => void;
  onBack: () => void;
  onGoToRegister: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onBack,
  onGoToRegister,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 4 || password.length < 6) {
      setError("Tên đăng nhập (≥4) và mật khẩu (≥6) không hợp lệ.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await loginAdmin(username, password);
      dispatch(setUser(data.user));
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || "Tên đăng nhập hoặc mật khẩu không đúng.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-pop">
        <div className="bg-red-700 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl font-hanzi font-bold shadow-inner mx-auto mb-4 backdrop-blur-md">
            GY
          </div>
          <h2 className="text-2xl font-bold text-white">Đăng nhập GYSpace</h2>
          <p className="text-red-100/80 text-sm mt-1">
            Học tập hiệu quả với hệ thống thông minh
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
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
                placeholder="Nhập tên đăng nhập"
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
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? <SpinnerIcon className="w-5 h-5" /> : "Đăng nhập"}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onGoToRegister}
              className="text-slate-500 text-sm hover:text-red-600 font-medium transition-colors"
            >
              Chưa có tài khoản? Đăng ký tại đây
            </button>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="w-full py-2 text-slate-400 text-sm hover:text-slate-600 transition-colors"
          >
            Quay lại trang chủ
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
