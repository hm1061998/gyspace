import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { RootState, AppDispatch } from "@/redux/store";
import { updateUser } from "@/redux/authSlice";
import {
  updateProfile,
  changePassword,
  fetchUserProfile,
  UpdateProfileData,
  ChangePasswordData,
} from "@/services/api/userDataService";
import { setUser } from "@/redux/authSlice";
import { toast } from "@/libs/Toast";

interface PasswordFormData extends ChangePasswordData {
  confirmPass: string;
}

export const useProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const fullProfile = await fetchUserProfile();
        dispatch(setUser(fullProfile));
      } catch (e) {
        console.error("Failed to load full profile", e);
      }
    };
    loadProfile();
  }, [dispatch]);

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

  return {
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
  };
};
