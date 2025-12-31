import React, { useState } from "react";
import { ArrowLeftIcon, SpinnerIcon } from "@/components/icons";
import { registerUser } from "@/services/api/authService";
import { useForm } from "react-hook-form";

interface RegisterViewProps {
  onBackToLogin: () => void;
  onBackToHome: () => void;
  onRegisterSuccess: (username: string) => void;
}

type RegisterFormInputs = {
  username: string;
  pass: string;
  confirmPass: string;
};

const RegisterView: React.FC<RegisterViewProps> = ({
  onBackToLogin,
  onBackToHome,
  onRegisterSuccess,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormInputs>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const password = watch("pass");

  const handleRegister = async (data: RegisterFormInputs) => {
    setIsLoading(true);
    setError("");

    try {
      await registerUser(data.username, data.pass);
      onRegisterSuccess(data.username);
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-pop">
        <div className="bg-slate-800 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl font-hanzi font-bold shadow-inner mx-auto mb-4 backdrop-blur-md relative z-10">
            GY
          </div>
          <h2 className="text-2xl font-bold text-white relative z-10">
            Tạo tài khoản mới
          </h2>
          <p className="text-slate-300 text-sm mt-1 relative z-10">
            Bắt đầu hành trình học tập cùng GYSpace
          </p>
        </div>

        <form onSubmit={handleSubmit(handleRegister)} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Tên đăng nhập
              </label>
              <input
                {...register("username", {
                  required: "Tên đăng nhập là bắt buộc",
                  minLength: {
                    value: 4,
                    message: "Tên đăng nhập phải có ít nhất 4 ký tự",
                  },
                })}
                type="text"
                className={`w-full px-4 py-3 bg-slate-50 border ${
                  errors.username ? "border-red-500" : "border-slate-200"
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all`}
                placeholder="Chọn tên đăng nhập"
              />
              {errors.username && (
                <p className="text-red-500 text-[10px] mt-1 font-bold ml-1">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Mật khẩu
              </label>
              <input
                {...register("pass", {
                  required: "Mật khẩu là bắt buộc",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                  },
                })}
                type="password"
                className={`w-full px-4 py-3 bg-slate-50 border ${
                  errors.pass ? "border-red-500" : "border-slate-200"
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all`}
                placeholder="Ít nhất 6 ký tự"
              />
              {errors.pass && (
                <p className="text-red-500 text-[10px] mt-1 font-bold ml-1">
                  {errors.pass.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Xác nhận mật khẩu
              </label>
              <input
                {...register("confirmPass", {
                  required: "Xác nhận mật khẩu là bắt buộc",
                  validate: (val: string) => {
                    if (watch("pass") != val) {
                      return "Mật khẩu xác nhận không khớp";
                    }
                  },
                })}
                type="password"
                className={`w-full px-4 py-3 bg-slate-50 border ${
                  errors.confirmPass ? "border-red-500" : "border-slate-200"
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all`}
                placeholder="Nhập lại mật khẩu"
              />
              {errors.confirmPass && (
                <p className="text-red-500 text-[10px] mt-1 font-bold ml-1">
                  {errors.confirmPass.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <SpinnerIcon className="w-5 h-5 animate-spin" />
            ) : (
              "Tạo tài khoản ngay"
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
