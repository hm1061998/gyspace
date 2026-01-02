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
import { getAdminStats, getCommentStats } from "@/redux/adminSlice";
import { toast } from "@/services/ui/toastService";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading, error, commentStats } = useSelector(
    (state: RootState) => state.admin
  );

  useEffect(() => {
    dispatch(getAdminStats(false));
    dispatch(getCommentStats(false));
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(getAdminStats(true));
    dispatch(getCommentStats(true));
  };

  const onNavigate = (path: string) => {
    navigate(path);
  };

  if (loading && !stats)
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <SpinnerIcon className="w-12 h-12 text-red-600" />
          <p className="text-slate-400 font-medium animate-pulse">
            Đang nạp dữ liệu hệ thống...
          </p>
        </div>
      </div>
    );

  if (error && !stats) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <div className="bg-red-50 text-red-600 p-8 rounded-[2rem] border border-red-100 shadow-xl shadow-red-50">
          <FlagIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="font-bold text-xl mb-2 text-red-700">Lỗi kết nối</p>
          <p className="text-sm opacity-80 mb-6">{error}</p>
          <button
            onClick={onRefresh}
            className="px-10 py-3 bg-red-600 text-white rounded-2xl font-bold"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Mini Top Row: Totals & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Hệ thống đang hoạt động ổn định
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 bg-white text-slate-600 px-5 py-2.5 rounded-2xl font-bold border border-slate-200 hover:border-slate-300 transition-all active:scale-95 text-sm"
          >
            <HistoryIcon
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Làm mới
          </button>
          <button
            onClick={() => onNavigate("/admin/idiom/insert")}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-black transition-all active:scale-95 text-sm shadow-xl shadow-slate-200"
          >
            <PlusIcon className="w-4 h-4" /> Thêm từ mới
          </button>
        </div>
      </div>

      {/* Main Grid Layout - Compact Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Row 1, Col 1-4: Welcome & Strategy - Reduced Height */}
        <div className="lg:col-span-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl min-h-[300px] flex flex-col justify-center">
          <div className="relative z-10 space-y-5">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Phát triển kho từ vựng.
            </h2>
            <p className="text-slate-400 text-lg max-w-lg leading-relaxed">
              Theo dõi sức khỏe nội dung và các từ khóa người dùng quan tâm để
              cập nhật dữ liệu.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onNavigate("/admin/idiom/list")}
                className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black hover:bg-red-50 transition-all active:scale-95 text-sm"
              >
                Xem kho từ điển
              </button>
            </div>
          </div>
          <div className="absolute -right-16 -bottom-16 opacity-5 pointer-events-none">
            <ListBulletIcon className="w-96 h-96" />
          </div>
        </div>

        {/* Row 1, Col 9-12: Primary KPI Cluster */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <CompactStatCard
            icon={<ListBulletIcon className="w-6 h-6" />}
            label="Tổng từ vựng"
            value={stats?.totalIdioms || 0}
            color="red"
            onClick={() => onNavigate("/admin/idiom/list")}
          />
          <CompactStatCard
            icon={<ChatBubbleIcon className="w-6 h-6" />}
            label="Chờ duyệt"
            value={commentStats?.pending || 0}
            color="amber"
            onClick={() => onNavigate("/admin/comments")}
          />
        </div>

        {/* --- Masonry-style Grid for Content Health, Tracking, etc. --- */}

        {/* --- Masonry-style Grid for Content Health, Tracking, etc. --- */}

        {/* Moderation Stats - Replaces Content Health */}
        <div className="lg:col-span-4">
          <Section
            title="Tỉ lệ duyệt"
            icon={<CheckCircleIcon className="w-4 h-4 text-emerald-600" />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-600">
                    {commentStats?.approved || 0}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Đã duyệt
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-100 mx-2" />
                <div className="text-center">
                  <div className="text-2xl font-black text-red-600">
                    {commentStats?.rejected || 0}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Từ chối
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-100 mx-2" />
                <div className="text-center">
                  <div className="text-2xl font-black text-amber-500">
                    {commentStats?.pending || 0}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Chờ xử lý
                  </div>
                </div>
              </div>

              {/* Mini visual bar */}
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden flex">
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
        <div className="lg:col-span-4">
          <Section
            title="Phân bố cấp độ"
            icon={<BrainIcon className="w-4 h-4 text-indigo-500" />}
          >
            <div className="space-y-3">
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
                <p className="text-slate-400 text-xs italic text-center py-4">
                  Chưa có dữ liệu cấp độ
                </p>
              )}
            </div>
          </Section>
        </div>

        {/* Hot Keywords - Compact */}
        <div className="lg:col-span-4">
          <Section
            title="Tìm kiếm bị bỏ lỡ"
            icon={<FireIcon className="w-4 h-4 text-orange-500" />}
            action={
              <button
                onClick={() => onNavigate("/admin/search-logs")}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                Xem tất cả <ChevronRightIcon className="w-3 h-3" />
              </button>
            }
          >
            <div className="grid grid-cols-2 gap-2">
              {stats?.hotKeywords?.slice(0, 4).map((item: any, idx: number) => (
                <HotLink key={idx} text={item.query} count={item.count} />
              ))}
              {(!stats?.hotKeywords || stats.hotKeywords.length === 0) && (
                <p className="col-span-2 text-slate-400 text-xs italic py-2 text-center">
                  Chưa có dữ liệu.
                </p>
              )}
            </div>
          </Section>
        </div>

        {/* Row 3 - 2 Regular Columns (Expanded) */}

        {/* Recent Items */}
        <div className="lg:col-span-6">
          <Section
            title="Cập nhật gần đây"
            icon={<HistoryIcon className="w-4 h-4 text-blue-500" />}
            action={
              <button
                onClick={() =>
                  onNavigate("/admin/idiom/list?sort=createdAt&order=DESC")
                }
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Xem tất cả <ChevronRightIcon className="w-3 h-3" />
              </button>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {stats?.recentIdioms?.slice(0, 4).map((idiom: any) => (
                <RecentItem
                  key={idiom.id}
                  idiom={idiom}
                  onClick={() => onNavigate(`/admin/idiom/detail/${idiom.id}`)}
                />
              ))}
              {(!stats?.recentIdioms || stats.recentIdioms.length === 0) && (
                <p className="col-span-2 text-slate-400 text-xs italic py-4 text-center">
                  Chưa có cập nhật mới
                </p>
              )}
            </div>
          </Section>
        </div>

        {/* Reports - Compact */}
        <div className="lg:col-span-6">
          <Section
            title="Nội dung cần rà soát"
            icon={<FlagIcon className="w-4 h-4 text-red-600" />}
            action={
              <button
                onClick={() => onNavigate("/admin/comments?onlyReported=true")}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                Xem tất cả <ChevronRightIcon className="w-3 h-3" />
              </button>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {commentStats?.topReported?.slice(0, 4).map((item: any) => (
                <ReportItem
                  key={item.id}
                  item={item}
                  onClick={(item: any) =>
                    onNavigate(
                      `/admin/comments?idiomId=${item.id}&onlyReported=true`
                    )
                  }
                />
              ))}
              {(!commentStats?.topReported ||
                commentStats.topReported.length === 0) && (
                <p className="col-span-2 text-slate-400 text-xs italic py-4 text-center">
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
  const styles: any = {
    red: "bg-red-50 text-red-600 border-red-100/50",
    amber: "bg-amber-50 text-amber-600 border-amber-100/50",
  };
  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-[1.5rem] border transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-between group ${styles[color]}`}
    >
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">
          {label}
        </p>
        <h2 className="text-3xl font-black">{value}</h2>
      </div>
      <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
  );
};

const Section = ({ title, icon, action, children }: any) => (
  <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm h-full hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {action}
    </div>
    {children}
  </div>
);

const RecentItem = ({ idiom, onClick }: any) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-100 group"
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center font-hanzi font-bold text-slate-400 group-hover:text-red-600 transition-all text-sm">
        {idiom.hanzi.charAt(0)}
      </div>
      <div>
        <p className="font-hanzi font-bold text-slate-800 text-xs">
          {idiom.hanzi}
        </p>
        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
          {idiom.pinyin}
        </p>
      </div>
    </div>
    <ChevronRightIcon className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-1" />
  </div>
);

const ReportItem = ({ item, onClick }: any) => (
  <div
    onClick={() => onClick(item)}
    className="flex items-center justify-between p-2.5 bg-red-50/40 rounded-xl hover:bg-red-50 transition-all cursor-pointer group border border-transparent hover:border-red-100"
  >
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 bg-white text-red-600 rounded-full flex items-center justify-center font-hanzi font-bold text-[10px] shadow-sm">
        {item.hanzi.charAt(0)}
      </div>
      <p className="font-hanzi font-bold text-slate-800 text-[11px]">
        {item.hanzi}
      </p>
    </div>
    <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg shadow-sm border border-red-100">
      <span className="text-[11px] font-black text-red-700">
        {item.totalreports}
      </span>
      <span className="text-[8px] font-black uppercase text-red-400">
        Khiếu nại
      </span>
    </div>
  </div>
);

const ProgressBar = ({ label, value, percent }: any) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
      <div
        className={`h-full transition-all duration-1000 ease-out ${
          label.includes("Cao")
            ? "bg-red-600"
            : label.includes("Trung")
            ? "bg-blue-600"
            : "bg-emerald-600"
        }`}
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
);

const HealthSmall = ({ value, label, warning }: any) => (
  <div
    className={`p-3.5 rounded-xl border text-center transition-all ${
      warning
        ? "bg-red-50 border-red-100 ring-2 ring-red-50"
        : "bg-slate-50 border-slate-100"
    }`}
  >
    <div
      className={`text-xl font-black mb-0.5 ${
        warning ? "text-red-700" : "text-slate-900"
      }`}
    >
      {value}
    </div>
    <div className="text-[8px] font-black text-slate-400 uppercase leading-none truncate">
      {label}
    </div>
  </div>
);

const HotLink = ({ text, count }: any) => (
  <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-100">
    <span className="text-[11px] font-bold text-slate-700 truncate mr-2">
      {text}
    </span>
    <span className="text-[9px] font-black bg-white px-1.5 py-0.5 rounded shadow-sm text-red-600 border border-red-50">
      +{count}
    </span>
  </div>
);

export default AdminDashboard;
