import React from "react";
import {
  Routes,
  Route,
  useNavigate,
  useParams,
  useOutletContext,
} from "react-router-dom";
import Home from "./src/Home";
import AdminInsert from "./src/Admin/AdminInsert";
import VocabularyList from "./src/Admin/VocabularyList";
import SavedVocabulary from "./src/SavedVocabulary";
import FlashcardReview from "./src/FlashcardReview";
import WordSearchGame from "./src/WordSearchGame";
import HistoryList from "./src/HistoryList";
import Dashboard from "./src/Admin/Dashboard";
import { addToHistory } from "./services/idiomService";
import { isAdmin, isAuthenticated } from "./services/authService";
import Auth from "./src/Auth";
import RequireAuth from "./context/RequireAuth";
import AdminLayout from "./layouts/AdminLayout";
import MainLayout from "./layouts/MainLayout";
import ToastContainer from "./components/ToastContainer";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./redux/store";
import { fetchCurrentUser } from "./redux/authSlice";

// Wrapper component cho trang Edit để trích xuất ID từ URL params và xử lý Back
const AdminInsertWrapper: React.FC<{ navigate: (path: string) => void }> = ({
  navigate,
}) => {
  const { idiomId } = useParams<{ idiomId: string }>();
  // Trong Admin Layout mới, nút Back UI của Insert component có thể không cần thiết hoặc dẫn về list
  return (
    <AdminInsert
      onBack={() => navigate("/admin/idiom/list")}
      idiomId={idiomId}
    />
  );
};

// Wrapper để kết nối Auth component với Redux state
const AuthWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated: isAuth } = useSelector(
    (state: RootState) => state.auth
  );

  React.useEffect(() => {
    if (isAuth) {
      navigate("/", { replace: true });
    }
  }, [isAuth, navigate]);

  const handleSuccess = () => {
    navigate("/");
  };

  return <Auth onLoginSuccess={handleSuccess} onBack={() => navigate("/")} />;
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  React.useEffect(() => {
    const hasHint = localStorage.getItem("auth_hint") === "true";
    if (hasHint) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <>
      <ToastContainer />
      <Routes>
        {/* User Routes - Sử dụng MainLayout chung */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          <Route
            path="/flashcards"
            element={<FlashcardReview onBack={() => navigate("/")} />}
          />
          <Route
            path="/word_search"
            element={<WordSearchGame onBack={() => navigate("/")} />}
          />

          <Route path="/auth" element={<AuthWrapper />} />

          {/* chức năng cần login */}
          <Route element={<RequireAuth />}>
            <Route
              path="/saved"
              element={<SavedVocabulary onBack={() => navigate("/")} />}
            />
            <Route
              path="/history"
              element={
                <HistoryList
                  onBack={() => navigate("/")}
                  onSelect={(idiom) => {
                    addToHistory(idiom);
                    navigate(`/?query=${encodeURIComponent(idiom.hanzi)}`);
                  }}
                />
              }
            />
          </Route>

          {/* Fallback cho các route không khớp trong User scope */}
          <Route path="*" element={<Home />} />
        </Route>

        {/* Admin Routes - Tách biệt với AdminLayout */}
        <Route element={<RequireAuth />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route
              path="idiom/list"
              element={
                <VocabularyList
                  onBack={() => navigate("/admin")}
                  onSelect={(hanzi) =>
                    navigate(`/?query=${encodeURIComponent(hanzi)}`)
                  }
                  onEdit={(id) => navigate(`/admin/idiom/detail/${id}`)}
                />
              }
            />
            <Route
              path="idiom/detail/:idiomId"
              element={<AdminInsertWrapper navigate={navigate} />}
            />
            <Route
              path="idiom/insert"
              element={
                <AdminInsert onBack={() => navigate("/admin/idiom/list")} />
              }
            />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default App;
