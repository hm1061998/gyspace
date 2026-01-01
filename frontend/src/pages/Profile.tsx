import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { RootState, AppDispatch } from "@/redux/store";
import { updateUser } from "@/redux/authSlice";
import {
  updateProfile,
  changePassword,
  UpdateProfileData,
  ChangePasswordData,
} from "@/services/api/userDataService";
import { toast } from "@/services/ui/toastService";
import { UserIcon, LockIcon, SaveIcon } from "@/components/common/icons";

interface PasswordFormData extends ChangePasswordData {
  confirmPass: string;
}

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileData>({
    defaultValues: {
      displayName: user?.displayName || "",
    },
  });

  // Sync default values when user data changes
  useEffect(() => {
    if (user?.displayName) {
      setProfileValue("displayName", user.displayName);
    }
  }, [user, setProfileValue]);

  // Password Form
  const {
    register: registerPass,
    handleSubmit: handleSubmitPass,
    reset: resetPass,
    watch: watchPass,
    formState: { errors: passErrors },
  } = useForm<PasswordFormData>();

  const newPassValue = watchPass("newPass");

  const onUpdateProfile = async (data: UpdateProfileData) => {
    setIsUpdatingProfile(true);
    try {
      const updatedUser = await updateProfile(data);
      dispatch(updateUser({ displayName: updatedUser.displayName }));
      toast.success("Cập nhật thông tin thành công");
    } catch (error: any) {
      toast.error(error.message || "Không thể cập nhật thông tin");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data: PasswordFormData) => {
    setIsChangingPass(true);
    try {
      await changePassword({ oldPass: data.oldPass, newPass: data.newPass });
      toast.success("Đổi mật khẩu thành công");
      resetPass();
    } catch (error: any) {
      toast.error(error.message || "Không thể đổi mật khẩu");
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
          Cài đặt tài khoản
        </h1>
        <p className="text-slate-500">Quản lý thông tin cá nhân và bảo mật</p>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50" />

          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
              <UserIcon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Thông tin cá nhân
            </h2>
          </div>

          <form
            onSubmit={handleSubmitProfile(onUpdateProfile)}
            className="space-y-6 relative z-10"
          >
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={user?.username || ""}
                disabled
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                Tên hiển thị
              </label>
              <input
                type="text"
                {...registerProfile("displayName", {
                  required: "Tên hiển thị không được để trống",
                  minLength: {
                    value: 1,
                    message: "Tên hiển thị không được để trống",
                  },
                  maxLength: {
                    value: 50,
                    message: "Tên hiển thị không quá 50 ký tự",
                  },
                })}
                placeholder="Nhập tên hiển thị của bạn"
                className={`w-full px-5 py-4 bg-white border ${
                  profileErrors.displayName
                    ? "border-red-500 ring-4 ring-red-50"
                    : "border-slate-200"
                } rounded-2xl focus:ring-4 focus:ring-red-50 focus:border-red-500 transition-all outline-none font-medium text-slate-700`}
              />
              {profileErrors.displayName && (
                <p className="mt-2 ml-2 text-xs font-bold text-red-500">
                  {profileErrors.displayName.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
            >
              <SaveIcon className="w-5 h-5" />
              {isUpdatingProfile ? "Đang cập nhật..." : "Lưu thay đổi"}
            </button>
          </form>
        </section>

        {/* Password Section */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 opacity-50" />

          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <LockIcon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Đổi mật khẩu</h2>
          </div>

          <form
            onSubmit={handleSubmitPass(onChangePassword)}
            className="space-y-6 relative z-10"
          >
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                {...registerPass("oldPass", {
                  required: "Vui lòng nhập mật khẩu hiện tại",
                })}
                placeholder="••••••••"
                className={`w-full px-5 py-4 bg-white border ${
                  passErrors.oldPass
                    ? "border-red-500 ring-4 ring-red-50"
                    : "border-slate-200"
                } rounded-2xl focus:ring-4 focus:ring-amber-50 focus:border-amber-500 transition-all outline-none font-medium text-slate-700`}
              />
              {passErrors.oldPass && (
                <p className="mt-2 ml-2 text-xs font-bold text-red-500">
                  {passErrors.oldPass.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                {...registerPass("newPass", {
                  required: "Vui lòng nhập mật khẩu mới",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu mới phải có ít nhất 6 ký tự",
                  },
                  maxLength: {
                    value: 100,
                    message: "Mật khẩu mới không được quá 100 ký tự",
                  },
                })}
                placeholder="••••••••"
                className={`w-full px-5 py-4 bg-white border ${
                  passErrors.newPass
                    ? "border-red-500 ring-4 ring-red-50"
                    : "border-slate-200"
                } rounded-2xl focus:ring-4 focus:ring-amber-50 focus:border-amber-500 transition-all outline-none font-medium text-slate-700`}
              />
              {passErrors.newPass && (
                <p className="mt-2 ml-2 text-xs font-bold text-red-500">
                  {passErrors.newPass.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                {...registerPass("confirmPass", {
                  required: "Vui lòng xác nhận mật khẩu mới",
                  validate: (value) =>
                    value === newPassValue || "Mật khẩu xác nhận không khớp",
                })}
                placeholder="••••••••"
                className={`w-full px-5 py-4 bg-white border ${
                  passErrors.confirmPass
                    ? "border-red-500 ring-4 ring-red-50"
                    : "border-slate-200"
                } rounded-2xl focus:ring-4 focus:ring-amber-50 focus:border-amber-500 transition-all outline-none font-medium text-slate-700`}
              />
              {passErrors.confirmPass && (
                <p className="mt-2 ml-2 text-xs font-bold text-red-500">
                  {passErrors.confirmPass.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold hover:bg-amber-700 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70"
            >
              {isChangingPass ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Profile;
