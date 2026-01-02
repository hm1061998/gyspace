import React, { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  SpinnerIcon,
  ListBulletIcon,
  PlusIcon,
  BrainIcon,
  HistoryIcon,
  ChevronRightIcon,
} from "@/components/common/icons";
import { fetchAdminStats } from "@/services/api/idiomService";
import { useNavigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onNavigate = (key: string) => {
    navigate(`/admin/idiom/${key}`);
  };

  const onSelectRecent = (idiom: any) => {
    navigate(`/admin/idiom/detail/${idiom.id}`);
  };

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center">
        <SpinnerIcon className="w-10 h-10 text-red-600" />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto w-full animate-pop">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-hanzi font-bold text-slate-800">
          Bảng điều khiển Admin
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate("insert")}
            className="flex items-center gap-2 bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-red-100 hover:bg-red-800 transition-all"
          >
            <PlusIcon className="w-4 h-4" /> Thêm từ mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 text-red-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4">
            <ListBulletIcon className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
              Tổng từ vựng
            </p>
            <h2 className="text-3xl font-bold text-slate-800">
              {stats?.totalIdioms || 0}
            </h2>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4">
            <BrainIcon className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
              Cấp độ: Cao cấp
            </p>
            <h2 className="text-3xl font-bold text-slate-800">
              {stats?.levelStats?.find((s: any) => s.name === "Cao cấp")
                ?.count || 0}
            </h2>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4">
            <HistoryIcon className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
              Tỷ lệ hoàn thành
            </p>
            <h2 className="text-3xl font-bold text-slate-800">100%</h2>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 text-amber-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4">
            <PlusIcon className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
              Thành ngữ
            </p>
            <h2 className="text-3xl font-bold text-slate-800">
              {stats?.typeStats?.find(
                (s: any) => s.name === "Thành ngữ (Chengyu)"
              )?.count || 0}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="bg-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-hanzi font-bold mb-2">
                Quản lý kho dữ liệu
              </h3>
              <p className="text-slate-400 mb-8 max-w-sm">
                Dễ dàng thêm mới, chỉnh sửa hoặc import dữ liệu hàng loạt từ
                file Excel.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate("list")}
                  className="px-6 py-3 bg-white text-slate-800 rounded-xl font-bold hover:bg-red-50 transition-all flex items-center gap-2"
                >
                  <ListBulletIcon className="w-5 h-5" /> Xem danh sách
                </button>
                <button
                  onClick={() => onNavigate("insert")}
                  className="px-6 py-3 bg-red-700 text-white rounded-xl font-bold hover:bg-red-800 transition-all"
                >
                  Thêm từ mới
                </button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <ListBulletIcon className="w-64 h-64" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 md:p-7 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center justify-between">
              Phân bố Cấp độ
              <span className="text-[10px] text-slate-400 font-normal uppercase tracking-widest">
                Dữ liệu thực tế
              </span>
            </h3>
            <div className="space-y-6">
              {stats?.levelStats?.map((level: any) => {
                const percentage =
                  stats.totalIdioms > 0
                    ? (level.count / stats.totalIdioms) * 100
                    : 0;
                return (
                  <div key={level.name}>
                    <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                      <span>{level.name}</span>
                      <span>
                        {level.count} từ ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          level.name === "Cao cấp"
                            ? "bg-red-600"
                            : level.name === "Trung cấp"
                            ? "bg-blue-600"
                            : "bg-emerald-600"
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="h-full">
          <div className="bg-white rounded-2xl p-6 md:p-7 border border-slate-100 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-5">
              Mới cập nhật
            </h3>
            <div className="space-y-4">
              {stats?.recentIdioms?.map((idiom: any) => (
                <div
                  key={idiom.id}
                  onClick={() => onSelectRecent(idiom)}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center font-hanzi font-bold text-slate-400 group-hover:text-red-600 group-hover:bg-red-50 transition-all">
                      {idiom.hanzi.charAt(0)}
                    </div>
                    <div>
                      <p className="font-hanzi font-bold text-slate-800">
                        {idiom.hanzi}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-tighter">
                        {idiom.pinyin}
                      </p>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-slate-200 group-hover:text-red-300" />
                </div>
              ))}
              {(!stats?.recentIdioms || stats.recentIdioms.length === 0) && (
                <p className="text-slate-400 text-sm italic text-center py-10">
                  Chưa có dữ liệu gần đây.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
