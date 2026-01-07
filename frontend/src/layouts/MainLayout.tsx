import React, { useState, useCallback, useRef, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Header from "@/components/layout/Header";
import UserSidebar from "@/components/layout/UserSidebar";
import { logoutAdmin } from "@/services/api/authService";
import { RootState } from "@/redux/store";
import { logout as reduxLogout } from "@/redux/authSlice";
import { ChevronDownIcon } from "@/components/common/icons";

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLElement>(null);

  const handleLogout = useCallback(async () => {
    await logoutAdmin();
    dispatch(reduxLogout());
    setIsSidebarOpen(false);
    navigate("/");
  }, [navigate, dispatch]);

  useEffect(() => {
    const mainElement = scrollContainerRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      setShowScrollTop(mainElement.scrollTop > 100);
    };

    mainElement.addEventListener("scroll", handleScroll);
    return () => mainElement.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="h-screen flex flex-col relative font-sans overflow-hidden bg-slate-50">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto w-full relative scroll-smooth"
      >
        <Outlet context={{ isLoggedIn: isAuthenticated, user }} />
      </main>

      {/* Scroll To Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-10 w-14 h-14 bg-red-600 text-white rounded-2xl shadow-[0_20px_50px_rgba(239,68,68,0.3)] flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90 ${
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0 pointer-events-none"
        } group`}
        aria-label="Cuộn lên đầu trang"
      >
        <ChevronDownIcon className="w-8 h-8 transition-transform rotate-180" />
      </button>

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
          else if (view === "profile") navigate("/profile");
          else if (view === "admin" || view === "list") navigate("/admin");
          else if (view === "reports") navigate("/reports");
          else if (view === "exercises") navigate("/exercises");
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
