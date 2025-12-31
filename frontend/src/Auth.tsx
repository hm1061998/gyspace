import React, { useState } from "react";
import LoginView from "@/components/Auth/LoginView";
import RegisterView from "@/components/Auth/RegisterView";
import { toast } from "@/services/ui/toastService";

interface LoginViewProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const Auth: React.FC<LoginViewProps> = ({ onLoginSuccess, onBack }) => {
  const [type, setType] = useState<"login" | "register">("login");

  const onRegisterSuccess = () => {
    setType("login");
    toast.success("Đăng ký tài khoản thành công, mời bạn đăng nhập");
  };

  return (
    <React.Fragment>
      {type === "login" && (
        <LoginView
          onLoginSuccess={onLoginSuccess}
          onBack={onBack}
          onGoToRegister={() => setType("register")}
        />
      )}
      {type === "register" && (
        <RegisterView
          onRegisterSuccess={onRegisterSuccess}
          onBackToHome={onBack}
          onBackToLogin={() => setType("login")}
        />
      )}
    </React.Fragment>
  );
};

export default Auth;
