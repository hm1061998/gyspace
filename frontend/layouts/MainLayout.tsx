import React, { useState, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import UserSidebar from "../components/UserSidebar";
import ToastContainer from "../components/ToastContainer";
import { isAuthenticated, isAdmin, logoutAdmin } from "../services/authService";

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated());
  const [isUserAdmin, setIsUserAdmin] = useState(() => isAdmin());

  const handleLogout = useCallback(() => {
    logoutAdmin();
    setIsLoggedIn(false);
    setIsUserAdmin(false);
    setIsSidebarOpen(false);
    navigate("/");
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col relative font-sans overflow-hidden bg-slate-50">
      <ToastContainer />
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <main className="flex-1 overflow-y-auto w-full p-3 md:p-4 relative">
        <Outlet context={{ isLoggedIn, setIsLoggedIn, setIsUserAdmin }} />
      </main>

      <UserSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isLoggedIn={isLoggedIn}
        isAdmin={isUserAdmin}
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
