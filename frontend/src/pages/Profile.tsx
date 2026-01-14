import React from "react";
import { useProfile } from "@/hooks/useProfile";
import ProfileInfoForm from "@/components/profile/ProfileInfoForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";

const Profile: React.FC = () => {
  const {
    user,
    isUpdatingProfile,
    isChangingPass,
    registerProfile,
    handleSubmitProfile,
    profileErrors,
    onUpdateProfile,
    registerPass,
    handleSubmitPass,
    passErrors,
    onChangePassword,
    newPassValue,
  } = useProfile();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
          Cài đặt tài khoản
        </h1>
        <p className="text-slate-500">Quản lý thông tin cá nhân và bảo mật</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <ProfileInfoForm
            username={user?.username || ""}
            isUpdating={isUpdatingProfile}
            register={registerProfile}
            errors={profileErrors}
            onSubmit={handleSubmitProfile(onUpdateProfile)}
          />
          <ChangePasswordForm
            isChanging={isChangingPass}
            register={registerPass}
            errors={passErrors}
            onSubmit={handleSubmitPass(onChangePassword)}
            newPassValue={newPassValue}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-linear-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-xs font-black uppercase tracking-widest opacity-70">
                Cấp độ cá nhân
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <h2 className="text-6xl font-black">{user?.level || 1}</h2>
                <span className="text-xl font-bold opacity-80 uppercase">
                  Level
                </span>
              </div>

              <div className="mt-8 space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold opacity-80">
                    Kinh nghiệm (XP)
                  </span>
                  <span className="text-xs font-bold">{user?.xp || 0} XP</span>
                </div>
                <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000"
                    style={{
                      width: `${Math.min(((user?.xp || 0) % 1000) / 10, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] opacity-60 font-medium">
                  Nhận XP khi lưu từ vựng hoặc ôn tập flashcard thành công.
                </p>
              </div>
            </div>

            {/* Decorative element */}
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">
              Thành tích học tập
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                    {Math.floor((user?.xp || 0) / 100)}
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    Huy hiệu đạt được
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
