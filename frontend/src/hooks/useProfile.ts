import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { RootState, AppDispatch } from "@/redux/store";
import { updateUser, setUser } from "@/redux/authSlice";
import {
  UpdateProfileData,
  ChangePasswordData,
} from "@/services/api/userDataService";
import {
  useUserProfile,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from "@/hooks/queries/useUserData";

interface PasswordFormData extends ChangePasswordData {
  confirmPass: string;
}

export const useProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch Profile and sync to Redux
  const { data: userProfile } = useUserProfile();

  useEffect(() => {
    if (userProfile) {
      dispatch(setUser(userProfile));
    }
  }, [userProfile, dispatch]);

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useUpdateProfileMutation();

  const { mutateAsync: changePassword, isPending: isChangingPass } =
    useChangePasswordMutation();

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
    try {
      const updatedUser = await updateProfile(data);
      dispatch(updateUser({ displayName: updatedUser.displayName }));
    } catch (error: any) {
      // Toast handled in mutation
    }
  };

  const onChangePassword = async (data: PasswordFormData) => {
    try {
      await changePassword({ oldPass: data.oldPass, newPass: data.newPass });
      resetPass();
    } catch (error: any) {
      // Toast handled in mutation
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
