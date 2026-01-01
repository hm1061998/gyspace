import React, { useState } from "react";
import { ArrowLeftIcon, SpinnerIcon } from "@/components/icons";
import { loginAdmin } from "@/services/api/authService";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";
import { useForm } from "react-hook-form";
import Input from "@/components/Input";

interface LoginViewProps {
  onLoginSuccess: () => void;
  onBack: () => void;
  onGoToRegister: () => void;
}

type LoginFormInputs = {
  username: string;
  pass: string;
};

const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onBack,
  onGoToRegister,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleLogin = async (data: LoginFormInputs) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await loginAdmin(data.username, data.pass);
      dispatch(setUser(response.user));
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
        <div className="bg-red-700 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl font-hanzi font-bold shadow-inner mx-auto mb-4 backdrop-blur-md relative z-10">
            GY
          </div>
          <h2 className="text-2xl font-bold text-white relative z-10">
            Đăng nhập {__APP_NAME__}
          </h2>
          <p className="text-red-100/80 text-sm mt-1 relative z-10">
            Học tập hiệu quả với hệ thống thông minh
          </p>
        </div>

        <form onSubmit={handleSubmit(handleLogin)} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="TÊN ĐĂNG NHẬP"
              {...register("username", {
                required: "Tên đăng nhập là bắt buộc",
                minLength: {
                  value: 4,
                  message: "Tên đăng nhập phải có ít nhất 4 ký tự",
                },
                maxLength: {
                  value: 20,
                  message: "Tên đăng nhập không được quá 20 ký tự",
                },
                pattern: {
                  value: /^[a-zA-Z0-9_-]+$/,
                  message: "Tên đăng nhập chỉ chứa chữ cái, số, - và _",
                },
              })}
              placeholder="Nhập tên đăng nhập"
              error={errors.username?.message}
              className="bg-slate-50 py-3"
            />
            <Input
              label="MẬT KHẨU"
              {...register("pass", {
                required: "Mật khẩu là bắt buộc",
                minLength: {
                  value: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự",
                },
                maxLength: {
                  value: 100,
                  message: "Mật khẩu không được quá 100 ký tự",
                },
              })}
              type="password"
              placeholder="••••••••"
              error={errors.pass?.message}
              className="bg-slate-50 py-3"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <SpinnerIcon className="w-5 h-5 animate-spin" />
            ) : (
              "Đăng nhập ngay"
            )}
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
