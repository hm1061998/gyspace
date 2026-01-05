import React, { useEffect } from "react";
import {
  SpinnerIcon,
  ListBulletIcon,
  PlusIcon,
  BrainIcon,
  HistoryIcon,
  ChevronRightIcon,
  FireIcon,
  PhotoIcon,
  ClockIcon,
  FlagIcon,
  ChatBubbleIcon,
  CheckCircleIcon,
} from "@/components/common/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  getAdminStats,
  getCommentStats,
  fetchReportStats,
} from "@/redux/adminSlice";
import { toast } from "@/libs/Toast";
import { LoaderIcon } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading, error, commentStats, reportStats } = useSelector(
    (state: RootState) => state.admin
  );

  useEffect(() => {
    dispatch(getAdminStats(false));
    dispatch(getCommentStats(false));
    dispatch(fetchReportStats(false));
  }, [dispatch]);
  const onRefresh = () => {
    dispatch(getAdminStats(true));
    dispatch(getCommentStats(true));
    dispatch(fetchReportStats(true));
  };

  const onNavigate = (path: string) => {
    navigate(path);
  };

  if (loading && !stats)
    return (
      <div className="loading-container">
        <div className="loading-content">
          <SpinnerIcon className="w-12 h-12 text-red-600" />
          <p className="loading-text">Đang nạp dữ liệu hệ thống...</p>
        </div>
      </div>
    );

  if (error && !stats) {
    return (
      <div className="error-container">
        <div className="error-card">
          <FlagIcon className="error-icon" />
          <p className="error-title">Lỗi kết nối</p>
          <p className="error-desc">{error}</p>
          <button onClick={onRefresh} className="error-retry-btn">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      {/* Mini Top Row: Totals & Status */}
      <div className="dashboard-header">
        <div className="space-y-0-5">
          <h1 className="dashboard-title">Dashboard</h1>
          <div className="dashboard-status">
            <div className="dashboard-status-dot" />
            Hệ thống đang hoạt động ổn định
          </div>
        </div>
        <div className="dashboard-actions">
          <button
            onClick={onRefresh}
            className={`btn-refresh ${loading ? "button-disabled" : ""}`}
          >
            {loading ? (
              <SpinnerIcon className="dashboard-action-icon" />
            ) : (
              <HistoryIcon className={`dashboard-action-icon `} />
            )}
            Làm mới
          </button>
          <button
            onClick={() => onNavigate("/admin/idiom/insert")}
            className="btn-create"
          >
            <PlusIcon className="dashboard-action-icon" /> Thêm mới
          </button>
        </div>
      </div>

      {/* Main Grid Layout - Compact Bento */}
      <div className="dashboard-grid">
        {/* Row 1, Col 1-8: Welcome & Strategy */}
        <div className="welcome-card">
          <div className="welcome-content">
            <h2 className="welcome-title">Phát triển kho từ vựng.</h2>
            <p className="welcome-desc">
              Theo dõi sức khỏe nội dung và các từ khóa người dùng quan tâm để
              cập nhật dữ liệu.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onNavigate("/admin/idiom/list")}
                className="welcome-btn"
              >
                Xem kho từ điển
              </button>
            </div>
          </div>
          <div className="welcome-bg-icon">
            <ListBulletIcon />
          </div>
        </div>

        {/* Row 1, Col 9-12: Primary KPI Cluster */}
        <div className="stats-cluster">
          <CompactStatCard
            icon={<ListBulletIcon className="stat-card-icon" />}
            label="Tổng từ vựng"
            value={stats?.totalIdioms || 0}
            color="red"
            onClick={() => onNavigate("/admin/idiom/list")}
          />
          <CompactStatCard
            icon={<ChatBubbleIcon className="stat-card-icon" />}
            label="Chờ duyệt"
            value={reportStats?.pending || 0}
            color="amber"
            onClick={() => onNavigate("/admin/reports?status=pending")}
          />
        </div>

        {/* --- Masonry-style Grid for Content Health, Tracking, etc. --- */}

        {/* Moderation Stats - Replaces Content Health */}
        <div className="dashboard-section-col-1">
          <Section
            title="Tỉ lệ duyệt"
            icon={<CheckCircleIcon className="section-header-icon emerald" />}
          >
            <div className="section-content">
              <div className="mod-stats-container">
                <div className="mod-stat-group">
                  <div className="mod-stat-large text-emerald-600">
                    {commentStats?.approved || 0}
                  </div>
                  <div className="mod-stat-sub">Đã duyệt</div>
                </div>
                <div className="mod-stat-divider" />
                <div className="mod-stat-group">
                  <div className="mod-stat-large text-red-600">
                    {commentStats?.rejected || 0}
                  </div>
                  <div className="mod-stat-sub">Từ chối</div>
                </div>
                <div className="mod-stat-divider" />
                <div className="mod-stat-group">
                  <div className="mod-stat-large text-amber-500">
                    {commentStats?.pending || 0}
                  </div>
                  <div className="mod-stat-sub">Chờ xử lý</div>
                </div>
              </div>

              {/* Mini visual bar */}
              <div className="visual-bar">
                <div
                  style={{
                    width: `${
                      (commentStats?.approved / (commentStats?.total || 1)) *
                      100
                    }%`,
                  }}
                  className="h-full bg-emerald-500"
                />
                <div
                  style={{
                    width: `${
                      (commentStats?.rejected / (commentStats?.total || 1)) *
                      100
                    }%`,
                  }}
                  className="h-full bg-red-500"
                />
                <div
                  style={{
                    width: `${
                      (commentStats?.pending / (commentStats?.total || 1)) * 100
                    }%`,
                  }}
                  className="h-full bg-amber-500"
                />
              </div>
            </div>
          </Section>
        </div>

        {/* Level Distribution - Replaces Processing Speed */}
        <div className="dashboard-section-col-1">
          <Section
            title="Phân bố cấp độ"
            icon={<BrainIcon className="section-header-icon text-indigo-500" />}
          >
            <div className="space-y-2-5">
              {stats?.levelStats?.slice(0, 3).map((level: any) => {
                const percentage =
                  stats.totalIdioms > 0
                    ? (level.count / stats.totalIdioms) * 100
                    : 0;
                return (
                  <ProgressBar
                    key={level.name}
                    label={level.name}
                    value={level.count}
                    percent={percentage}
                  />
                );
              })}
              {(!stats?.levelStats || stats.levelStats.length === 0) && (
                <p className="dashboard-empty-state">Chưa có dữ liệu cấp độ</p>
              )}
            </div>
          </Section>
        </div>

        {/* Hot Keywords - Compact */}
        <div className="dashboard-section-col-2">
          <Section
            title="Tìm kiếm bị bỏ lỡ"
            icon={<FireIcon className="section-header-icon text-orange-500" />}
            action={
              <button
                onClick={() => onNavigate("/admin/search-logs")}
                className="section-action-btn text-orange-500"
              >
                Tất cả <ChevronRightIcon className="section-action-icon" />
              </button>
            }
          >
            <div className="dashboard-subsection-grid hot-keywords">
              {stats?.hotKeywords?.slice(0, 4).map((item: any, idx: number) => (
                <HotLink key={idx} text={item.query} count={item.count} />
              ))}
              {(!stats?.hotKeywords || stats.hotKeywords.length === 0) && (
                <p className="dashboard-empty-state">Chưa có dữ liệu.</p>
              )}
            </div>
          </Section>
        </div>

        {/* Row 3 - 2 Regular Columns (Expanded) */}

        {/* Recent Items */}
        <div className="dashboard-section-half">
          <Section
            title="Cập nhật gần đây"
            icon={<HistoryIcon className="section-header-icon blue" />}
            action={
              <button
                onClick={() =>
                  onNavigate("/admin/idiom/list?sort=createdAt&order=DESC")
                }
                className="section-action-btn blue"
              >
                Xem tất cả <ChevronRightIcon className="section-action-icon" />
              </button>
            }
          >
            <div className="dashboard-subsection-grid">
              {stats?.recentIdioms?.slice(0, 4).map((idiom: any) => (
                <RecentItem
                  key={idiom.id}
                  idiom={idiom}
                  onClick={() => onNavigate(`/admin/idiom/detail/${idiom.id}`)}
                />
              ))}
              {(!stats?.recentIdioms || stats.recentIdioms.length === 0) && (
                <p className="dashboard-empty-state">Chưa có cập nhật mới</p>
              )}
            </div>
          </Section>
        </div>

        {/* Reports - Compact */}
        <div className="dashboard-section-half">
          <Section
            title="Nội dung cần rà soát"
            icon={<FlagIcon className="section-header-icon red" />}
            action={
              <button
                onClick={() => onNavigate("/admin/reports")}
                className="section-action-btn red"
              >
                Xem tất cả <ChevronRightIcon className="section-action-icon" />
              </button>
            }
          >
            <div className="dashboard-subsection-grid">
              {reportStats?.topReported?.slice(0, 4).map((item: any) => (
                <ReportItem key={item.id} item={item} />
              ))}
              {(!reportStats?.topReported ||
                reportStats.topReported.length === 0) && (
                <p className="dashboard-empty-state">
                  Không có nội dung rà soát.
                </p>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

// --- Sub Components Adjusted for Compactness ---

const CompactStatCard = ({ icon, label, value, color, onClick }: any) => {
  return (
    <div onClick={onClick} className={`stat-card group ${color}`}>
      <div>
        <p className="stat-label">{label}</p>
        <h2 className="stat-value">{value}</h2>
      </div>
      <div className="stat-icon-wrapper">{icon}</div>
    </div>
  );
};

const Section = ({ title, icon, action, children }: any) => (
  <div className="dashboard-card">
    <div className="dashboard-card-header">
      <div className="dashboard-card-title">
        {icon}
        <h3 className="dashboard-card-label">{title}</h3>
      </div>
      {action}
    </div>
    {children}
  </div>
);

const RecentItem = ({ idiom, onClick }: any) => (
  <div onClick={onClick} className="recent-item group">
    <div className="recent-item-content">
      <div className="recent-avatar">{idiom.hanzi.charAt(0)}</div>
      <div className="recent-text-group">
        <p className="recent-text-main">{idiom.hanzi}</p>
        <p className="recent-text-sub">{idiom.pinyin}</p>
      </div>
    </div>
    <ChevronRightIcon className="recent-icon" />
  </div>
);

const ReportItem = ({ item, onClick }: any) => (
  <div onClick={() => onClick(item)} className="report-item group">
    <div className="flex items-center gap-2.5">
      <div className="report-item-avatar">{item.hanzi.charAt(0)}</div>
      <p className="report-item-text">{item.hanzi}</p>
    </div>
    <div className="report-badge">
      <span className="report-count">{item.totalreports}</span>
      <span className="report-label">Khiếu nại</span>
    </div>
  </div>
);

const ProgressBar = ({ label, value, percent }: any) => {
  const getColorClass = (label: string) => {
    if (label.includes("Cao")) return "red";
    if (label.includes("Trung")) return "blue";
    return "green";
  };

  return (
    <div className="progress-group">
      <div className="progress-container">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-900">{value}</span>
      </div>
      <div className="progress-track">
        <div
          className={`progress-fill ${getColorClass(label)}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const HotLink = ({ text, count }: any) => (
  <div className="hot-link">
    <span className="hot-text">{text}</span>
    <span className="hot-count">+{count}</span>
  </div>
);

export default AdminDashboard;
