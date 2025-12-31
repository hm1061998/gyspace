import React, { useState, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Header from "@/components/Header";
import UserSidebar from "@/components/UserSidebar";
import ToastContainer from "@/components/ToastContainer";
import { logoutAdmin } from "@/services/api/authService";
import { RootState } from "@/redux/store";
import { logout as reduxLogout } from "@/redux/authSlice";

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logoutAdmin();
    dispatch(reduxLogout());
    setIsSidebarOpen(false);
    navigate("/");
  }, [navigate, dispatch]);

  return (
    <div className="h-screen flex flex-col relative font-sans overflow-hidden bg-slate-50">
      <ToastContainer />
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <main className="flex-1 overflow-y-auto w-full p-3 md:p-4 relative">
        <Outlet context={{ isLoggedIn: isAuthenticated, user }} />
      </main>

      <UserSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isLoggedIn={isAuthenticated}
        isAdmin={user?.isAdmin || false}
        isPremium={true}
        onViewChange={(view) => {
          if (view === "saved") navigate("/saved");
          else if (view === "flashcards") navigate("/flashcards");
          else if (view === "word_search") navigate("/word_search");
          else if (view === "history") navigate("/history");
          else if (view === "admin" || view === "list") navigate("/admin");
          else navigate("/");
          setIsSidebarOpen(false); // Auto close sidebar on navigate
        }}
        onLogin={() => {
          setIsSidebarOpen(false);
          navigate("/auth");
        }}
        onLogout={handleLogout}
        onTogglePremium={() => {}}
      />
    </div>
  );
};

export default MainLayout;
