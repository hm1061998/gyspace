import React, { useState, useCallback } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import Header from "./components/Header";
import Home from "./src/Home";
import AdminInsert from "./src/Admin/AdminInsert";
import VocabularyList from "./src/Admin/VocabularyList";
import UserSidebar from "./components/UserSidebar";
import SavedVocabulary from "./src/SavedVocabulary";
import FlashcardReview from "./src/FlashcardReview";
import { isAdmin, isAuthenticated, logoutAdmin } from "./services/authService";
import WordSearchGame from "./src/WordSearchGame";
import HistoryList from "./src/HistoryList";
import Dashboard from "./src/Admin/Dashboard";
import { addToHistory } from "./services/idiomService";
import Auth from "./src/Auth";
import ToastContainer from "./components/ToastContainer";
import RequireAuth from "./context/RequireAuth";

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
  const [isUserAdmin, setIsUserAdmin] = useState(() => isAdmin());

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsUserAdmin(isAdmin());
    navigate("/");
  };

  // Xử lý đăng xuất
  const handleLogout = useCallback(() => {
    // 1. Xóa token khỏi localStorage
    logoutAdmin();
    // 2. Cập nhật state để UI ẩn các tính năng Admin
    setIsLoggedIn(false);
    setIsUserAdmin(false);
    // 3. Reset về trang chủ để đảm bảo an toàn
    setIsSidebarOpen(false);
    navigate("/");
  }, []);

  return (
    <div className="h-full relative">
      <ToastContainer />
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <main className="p-3 md:p-4 h-auto w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/saved"
            element={<SavedVocabulary onBack={() => navigate("/")} />}
          />
          <Route
            path="/flashcards"
            element={<FlashcardReview onBack={() => navigate("/")} />}
          />
          <Route
            path="/word_search"
            element={<WordSearchGame onBack={() => navigate("/")} />}
          />
          <Route
            path="/history"
            element={
              <HistoryList
                onBack={() => navigate("/")}
                onSelect={(idiom) => {
                  // Khi chọn từ lịch sử, ta update lại vị trí của nó lên đầu
                  addToHistory(idiom);
                  navigate(`/?query=${encodeURIComponent(idiom.hanzi)}`);
                }}
              />
            }
          />
          {!isLoggedIn && (
            <Route
              path="/auth"
              element={
                <Auth
                  onLoginSuccess={handleLoginSuccess}
                  onBack={() => navigate(-1)}
                />
              }
            />
          )}

          <Route path="admin" element={<RequireAuth />}>
            <Route index element={<Dashboard />} />{" "}
            {/* Index route for the parent URL (/dashboard) */}
            <Route
              path="idiom/list"
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
              path="idiom/detail/:idiomId"
              element={<AdminInsertWrapper navigate={navigate} />}
            />
            <Route
              path="idiom/insert"
              element={<AdminInsert onBack={() => navigate("/admin")} />}
            />
          </Route>
          {/* Mặc định quay về Home nếu không khớp route */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <UserSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isLoggedIn={isLoggedIn}
        isAdmin={isUserAdmin}
        isPremium={true}
        onViewChange={(view) => {
          if (view === "list") navigate("/admin", { replace: true });
          else if (view === "saved") navigate("/saved", { replace: true });
          else if (view === "flashcards")
            navigate("/flashcards", { replace: true });
          else if (view === "word_search")
            navigate("/word_search", { replace: true });
          else if (view === "history") navigate("/history", { replace: true });
          else navigate("/", { replace: true });
        }}
        onLogin={() => {
          setIsSidebarOpen(false);
          navigate("/auth", { replace: true });
        }}
        onLogout={handleLogout}
        onTogglePremium={() => {}}
      />
    </div>
  );
};

export default App;
