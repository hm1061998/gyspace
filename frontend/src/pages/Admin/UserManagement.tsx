import React, { useState, useEffect } from "react";
import {
  UserIcon,
  PlusIcon,
  SearchIcon,
  RefreshIcon,
  TrashIcon,
  ShieldCheckIcon,
  KeyIcon,
  LogoutIcon,
  CloseIcon,
} from "@/components/common/icons";
import {
  listUsers,
  adminCreateUser,
  resetUserPassword,
  revokeUserSession,
  deleteUser,
} from "@/services/api";
import { toast } from "@/libs/Toast";
import { modalService } from "@/libs/Modal";
import { loadingService } from "@/libs/Loading";

import Pagination from "@/components/common/Pagination";
import Tooltip from "@/components/common/Tooltip";

interface User {
  id: string;
  username: string;
  displayName: string | null;
  isAdmin: boolean;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    pass: "",
    displayName: "",
    isAdmin: false,
  });
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = async (searchParam = searchTerm, pageParam = page) => {
    try {
      setLoading(true);
      const response = await listUsers({
        page: pageParam,
        limit: 10,
        search: searchParam.trim() || undefined,
      });
      setUsers(response.data);
      setLastPage(response.meta.lastPage);
    } catch (error) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and pagination
  useEffect(() => {
    fetchUsers(searchTerm, page);
  }, [page]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (page === 1) {
        fetchUsers(searchTerm, 1);
      } else {
        setPage(1); // This will trigger the first useEffect
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      loadingService.show("Đang tạo người dùng...");
      await adminCreateUser(formData);
      toast.success("Đã tạo người dùng mới");
      setIsModalOpen(false);
      setFormData({ username: "", pass: "", displayName: "", isAdmin: false });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi tạo người dùng");
    } finally {
      loadingService.hide();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      loadingService.show("Đang đặt lại mật khẩu...");
      await resetUserPassword(selectedUser.id, newPassword);
      toast.success(`Đã reset mật khẩu cho ${selectedUser.username}`);
      setIsResetModalOpen(false);
      setNewPassword("");
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi reset mật khẩu");
    } finally {
      loadingService.hide();
    }
  };

  const handleRevokeSession = async (id: string, username: string) => {
    const confirmed = await modalService.danger(
      `Bạn có chắc muốn xóa phiên đăng nhập của ${username}? Tài khoản này sẽ bị đăng xuất khỏi mọi thiết bị.`,
      "Xác nhận xóa phiên"
    );
    if (!confirmed) return;

    try {
      loadingService.show("Đang đăng xuất người dùng...");
      await revokeUserSession(id);
      toast.success(`Đã đăng xuất ${username} khỏi tất cả thiết bị`);
    } catch (error: any) {
      toast.error(error.message || "Không thể xóa phiên đăng nhập");
    } finally {
      loadingService.hide();
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    const confirmed = await modalService.danger(
      `XÁC NHẬN XÓA người dùng ${username}? Hành động này không thể hoàn tác.`,
      "Xác nhận xóa người dùng"
    );
    if (!confirmed) return;

    try {
      loadingService.show("Đang xóa người dùng...");
      await deleteUser(id);
      toast.success(`Đã xóa người dùng ${username}`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Không thể xóa người dùng");
    } finally {
      loadingService.hide();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <UserIcon className="w-8 h-8 text-red-600" />
            Quản lý người dùng
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">
            Danh sách và quyền hạn người dùng hệ thống
          </p>
        </div>
        <Tooltip content="Thêm tài khoản mới" position="left">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-slate-900/10 active:scale-95 group"
          >
            <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Thêm người dùng
          </button>
        </Tooltip>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-xs border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tài khoản hoặc tên hiển thị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500/20 transition-all font-medium"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {loading && !!searchTerm && (
              <RefreshIcon className="w-4 h-4 text-slate-300 animate-spin" />
            )}
            {!!searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setPage(1);
                }}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                title="Xóa tìm kiếm"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
        <div className="flex items-center gap-2">
          <Tooltip content="Làm mới dữ liệu">
            <button
              onClick={fetchUsers}
              className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-colors"
            >
              <RefreshIcon
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Ngày tham gia
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-8">
                      <div className="h-10 bg-slate-100 rounded-xl" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 grayscale opacity-30">
                      <UserIcon className="w-16 h-16" />
                      <p className="font-bold text-slate-500">
                        Không tìm thấy người dùng nào
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-bold group-hover:from-red-500 group-hover:to-red-600 group-hover:text-white transition-all">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 leading-none mb-1">
                            {user.username}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            {user.displayName || "Chưa đặt tên hiển thị"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.isAdmin ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wide border border-red-100">
                          <ShieldCheckIcon className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wide border border-slate-200">
                          Thành viên
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip content="Xóa phiên đăng nhập" position="top">
                          <button
                            onClick={() =>
                              handleRevokeSession(user.id, user.username)
                            }
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                          >
                            <LogoutIcon className="w-5 h-5" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Đặt lại mật khẩu" position="top">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsResetModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          >
                            <KeyIcon className="w-5 h-5" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Xóa tài khoản" position="top">
                          <button
                            onClick={() =>
                              handleDeleteUser(user.id, user.username)
                            }
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination component */}
      {!loading && lastPage > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={page}
            totalPages={lastPage}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <PlusIcon className="w-6 h-6 text-red-600" />
                Thêm người dùng mới
              </h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    Tên đăng nhập *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all font-bold"
                    placeholder="Ví dụ: admin_new"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    Mật khẩu *
                  </label>
                  <input
                    required
                    type="password"
                    value={formData.pass}
                    onChange={(e) =>
                      setFormData({ ...formData, pass: e.target.value })
                    }
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all font-bold"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    Tên hiển thị
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all font-bold"
                    placeholder="Ví dụ: Quản trị viên 1"
                  />
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-2">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    checked={formData.isAdmin}
                    onChange={(e) =>
                      setFormData({ ...formData, isAdmin: e.target.checked })
                    }
                    className="w-5 h-5 rounded-md border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <label
                    htmlFor="isAdmin"
                    className="text-sm font-bold text-slate-600 cursor-pointer select-none"
                  >
                    Cấp quyền Quản trị viên (Admin)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] px-6 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-red-600 transition-all shadow-lg active:scale-95"
                  >
                    Tạo tài khoản
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsResetModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                <KeyIcon className="w-6 h-6 text-amber-500" />
                Reset mật khẩu
              </h2>
              <p className="text-slate-500 text-sm font-medium mb-6">
                Đổi lại mật khẩu cho{" "}
                <span className="text-red-600 font-bold">
                  {selectedUser?.username}
                </span>
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    Mật khẩu mới *
                  </label>
                  <input
                    required
                    autoFocus
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all font-bold"
                    placeholder="Mật khẩu mới..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="flex-1 px-4 py-3.5 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] px-4 py-3.5 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 transition-all shadow-lg active:scale-95"
                  >
                    Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
