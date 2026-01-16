import React, { useState } from "react";
import LoginView from "@/components/auth/LoginView";
import RegisterView from "@/components/auth/RegisterView";
import { toast } from "@/libs/Toast";
import { SEO } from "@/components/common/SEO";

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
      <SEO
        title={type === "login" ? "Đăng nhập" : "Đăng ký"}
        description="Đăng nhập hoặc đăng ký tài khoản để lưu từ vựng và theo dõi tiến độ học tập."
      />
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
