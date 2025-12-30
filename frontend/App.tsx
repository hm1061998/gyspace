import React, { useState } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import Header from "./components/Header";
import Home from "./src/Home";
import AdminInsert from "./src/AdminInsert";
import VocabularyList from "./components/VocabularyList";
import UserSidebar from "./components/UserSidebar";

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

  return (
    <div className="h-full flex flex-col relative">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <main className="flex-1 overflow-auto p-4 md:p-8 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/admin/insert"
            element={<AdminInsert onBack={() => navigate("/admin")} />}
          />
          <Route
            path="/admin/edit/:idiomId"
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
                onEdit={(id) => navigate(`/admin/edit/${id}`)}
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
        isLoggedIn={true}
        isPremium={true}
        onViewChange={(view) => {
          if (view === "insert") navigate("/admin/insert");
          else if (view === "list") navigate("/admin");
          else navigate("/");
        }}
        onLogin={() => {}}
        onLogout={() => {}}
        onTogglePremium={() => {}}
      />
    </div>
  );
};

export default App;
