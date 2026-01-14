import React from "react";
import {
  Routes,
  Route,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";
// Lazy loaded pages
const Home = React.lazy(() => import("@/pages/Home"));
const AdminInsert = React.lazy(() => import("@/pages/Admin/AdminInsert"));
const VocabularyList = React.lazy(() => import("@/pages/Admin/VocabularyList"));
const SavedVocabulary = React.lazy(() => import("@/pages/SavedVocabulary"));
const FlashcardReview = React.lazy(() => import("@/pages/FlashcardReview"));
const WordSearchGame = React.lazy(() => import("@/pages/WordSearchGame"));
const HistoryList = React.lazy(() => import("@/pages/HistoryList"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const UserReportList = React.lazy(() => import("@/pages/UserReportList"));
const Dashboard = React.lazy(() => import("@/pages/Admin/Dashboard"));
const AdminComments = React.lazy(() => import("@/pages/Admin/AdminComments"));
const SearchLogs = React.lazy(() => import("@/pages/Admin/SearchLogs"));
const AdminReports = React.lazy(() => import("@/pages/Admin/AdminReports"));
const UserManagement = React.lazy(() => import("@/pages/Admin/UserManagement"));
const Auth = React.lazy(() => import("@/pages/Auth"));
const ExamPaperManagement = React.lazy(
  () => import("@/pages/Admin/ExamPaperManagement")
);
const ExamDetail = React.lazy(() => import("@/pages/Admin/ExamDetail"));
const ExamQuestionForm = React.lazy(
  () => import("@/pages/Admin/ExamQuestionForm")
);
const ExamPlay = React.lazy(() => import("@/pages/ExamPlay"));

import RequireAuth from "@/context/RequireAuth";
import AdminLayout from "@/layouts/AdminLayout";
import MainLayout from "@/layouts/MainLayout";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchCurrentUser } from "@/redux/authSlice";
import SplashScreen from "@/components/common/SplashScreen";

// Wrapper component cho trang Edit để trích xuất ID từ URL params và xử lý Back
const AdminInsertWrapper: React.FC<{ navigate: (path: string) => void }> = ({
  navigate,
}) => {
  const { idiomId } = useParams<{ idiomId: string }>();
  // Trong Admin Layout mới, nút Back UI của Insert component có thể không cần thiết hoặc dẫn về list
  return (
    <AdminInsert onBack={() => navigate("/admin/idiom")} idiomId={idiomId} />
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

const FallbackWrapper: React.FC = () => {
  return <Navigate to="/" replace />;
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  React.useEffect(() => {
    document.title = `${__APP_NAME__} - Từ điển Tra cứu & Học tập Quán dụng ngữ`;
    const hasHint = localStorage.getItem("auth_hint") === "true";
    if (hasHint) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <>
      <React.Suspense fallback={<SplashScreen />}>
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
            <Route path="/exams" element={<ExamPlay />} />
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
                      navigate(`/?query=${encodeURIComponent(idiom.hanzi)}`);
                    }}
                  />
                }
              />
              <Route
                path="/reports"
                element={
                  <UserReportList
                    onBack={() => navigate("/")}
                    onSelect={(idiom) => {
                      navigate(
                        `/?query=${encodeURIComponent(idiom.idiom?.hanzi)}`
                      );
                    }}
                  />
                }
              />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Fallback cho các route không khớp trong User scope */}
            <Route path="*" element={<FallbackWrapper />} />
          </Route>

          {/* Admin Routes - Tách biệt với AdminLayout */}
          <Route element={<RequireAuth needAdmin={true} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route
                path="idiom"
                element={
                  <VocabularyList
                    onBack={() => navigate("/admin")}
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
                  <AdminInsert onBack={() => navigate("/admin/idiom")} />
                }
              />
              <Route
                path="comments"
                element={<AdminComments onBack={() => navigate("/admin")} />}
              />
              <Route
                path="search-logs"
                element={<SearchLogs onBack={() => navigate("/admin")} />}
              />
              <Route
                path="reports"
                element={<AdminReports onBack={() => navigate("/admin")} />}
              />
              <Route path="users" element={<UserManagement />} />
              <Route path="exams" element={<ExamPaperManagement />} />
              <Route path="exams/:id" element={<ExamDetail />} />
              <Route
                path="exams/:id/questions/new"
                element={<ExamQuestionForm />}
              />
              <Route
                path="exams/:id/questions/:questionId"
                element={<ExamQuestionForm />}
              />
            </Route>
          </Route>
        </Routes>
      </React.Suspense>
    </>
  );
};

export default App;
