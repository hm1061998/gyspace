import React, { useState, useCallback } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import Header from "./components/Header";
import Home from "./src/Home";
import AdminInsert from "./src/AdminInsert";
import VocabularyList from "./src/VocabularyList";
import UserSidebar from "./components/UserSidebar";
import SavedVocabulary from "./src/SavedVocabulary";
import FlashcardReview from "./src/FlashcardReview";
import LoginView from "./src/LoginView";
import { isAuthenticated, logoutAdmin } from "./services/authService";

// Wrapper component cho trang Edit để trích xuất ID từ URL params
const AdminInsertWrapper: React.FC<{ navigate: (path: string) => void }> = ({
  navigate,
}) => {
  const { idiomId } = useParams<{ idiomId: string }>();
  return <AdminInsert onBack={() => navigate("/admin")} idiomId={idiomId} />;
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Kiểm tra trạng thái đăng nhập thực tế từ token
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated());

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem("isLoggedIn", "true");
    navigate('/')
  };

  // Xử lý đăng xuất
  const handleLogout = useCallback(() => {
    // 1. Xóa token khỏi localStorage
    logoutAdmin();
    // 2. Cập nhật state để UI ẩn các tính năng Admin
    setIsLoggedIn(false);
    // 3. Reset về trang chủ để đảm bảo an toàn
    setIsSidebarOpen(false);
    navigate('/')
  }, []);

  return (
    <div className="h-full relative">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <main className="p-3 md:p-4 h-auto w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/admin/insert"
            element={<AdminInsert onBack={() => navigate("/admin")} />}
          />
          <Route
            path="/admin/detail/:idiomId"
            element={<AdminInsertWrapper navigate={navigate} />}
          />
          <Route
            path="/admin"
            element={
              <VocabularyList
                onBack={() => navigate("/")}
                onSelect={(hanzi) =>
                  navigate(`/?query=${encodeURIComponent(hanzi)}`)
                }
                onEdit={(id) => navigate(`/admin/detail/${id}`)}
              />
            }
          />
          <Route
            path="/saved"
            element={<SavedVocabulary onBack={() => navigate("/")} />}
          />
          <Route
            path="/flashcards"
            element={<FlashcardReview onBack={() => navigate("/")} />}
          />
          <Route
            path="/login"
            element={
              <LoginView
                onLoginSuccess={handleLoginSuccess}
                onBack={() => navigate(-1)}
              />
            }
          />
          {/* Mặc định quay về Home nếu không khớp route */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <UserSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isLoggedIn={isLoggedIn}
        isPremium={true}
        onViewChange={(view) => {
          if (view === "insert") navigate("/admin/insert");
          else if (view === "list") navigate("/admin");
          else if (view === "saved") navigate("/saved");
          else if (view === "flashcards") navigate("/flashcards");
          else navigate("/");
        }}
        onLogin={() => {
          setIsSidebarOpen(false);
          navigate("/login");
        }}
        onLogout={handleLogout}
        onTogglePremium={() => {}}
      />
    </div>
  );
};

export default App;
