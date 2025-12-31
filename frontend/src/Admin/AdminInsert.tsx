import React, { useState, useRef, useEffect } from "react";
import { PlusIcon, TrashIcon, SpinnerIcon } from "@/components/icons";
import {
  createIdiom,
  updateIdiom,
  fetchIdiomById,
} from "@/services/api/idiomService";
import { toast } from "@/services/ui/toastService";
import { useOutletContext } from "react-router";
import { AdminOutletContext } from "@/layouts/AdminLayout";

interface AdminInsertProps {
  onBack: () => void;
  idiomId?: string;
}

const AdminInsert: React.FC<AdminInsertProps> = ({ onBack, idiomId }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const topRef = useRef<HTMLDivElement>(null); // Ref để cuộn lên đầu trang
  const { setPageHeader } = useOutletContext<AdminOutletContext>();

  const [form, setForm] = useState({
    hanzi: "",
    pinyin: "",
    type: "Quán dụng ngữ",
    level: "Trung cấp",
    source: "",
    vietnameseMeaning: "",
    literalMeaning: "",
    figurativeMeaning: "",
    chineseDefinition: "",
    origin: "",
    grammar: "",
    imageUrl: "",
    usageContext: "",
  });

  const [analysis, setAnalysis] = useState([
    { character: "", pinyin: "", meaning: "" },
  ]);
  const [examples, setExamples] = useState([
    { chinese: "", pinyin: "", vietnamese: "" },
  ]);

  useEffect(() => {
    if (idiomId) {
      loadIdiomData(idiomId);
    }
  }, [idiomId]);

  const loadIdiomData = async (id: string) => {
    setFetching(true);
    try {
      const data = await fetchIdiomById(id);
      setForm({
        hanzi: data.hanzi || "",
        pinyin: data.pinyin || "",
        type: data.type || "Quán dụng ngữ",
        level: data.level || "Trung cấp",
        source: data.source || "",
        vietnameseMeaning: data.vietnameseMeaning || "",
        literalMeaning: data.literalMeaning || "",
        figurativeMeaning: data.figurativeMeaning || "",
        chineseDefinition: data.chineseDefinition || "",
        origin: data.origin || "",
        grammar: data.grammar || "",
        imageUrl: data.imageUrl || "",
        usageContext: data.usageContext || "",
      });

      setPageHeader(null, undefined, data);
      if (data.analysis && data.analysis.length > 0) setAnalysis(data.analysis);
      else setAnalysis([{ character: "", pinyin: "", meaning: "" }]);

      if (data.examples && data.examples.length > 0) setExamples(data.examples);
      else setExamples([{ chinese: "", pinyin: "", vietnamese: "" }]);
    } catch (err: any) {
      toast.error("Không thể tải dữ liệu để sửa.");
    } finally {
      setFetching(false);
    }
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        analysis: analysis.filter((a) => a.character.trim()),
        examples: examples.filter((ex) => ex.chinese.trim()),
      };

      if (idiomId) {
        await updateIdiom(idiomId, payload);
        toast.success("Đã cập nhật từ vựng thành công!");
      } else {
        await createIdiom(payload);
        toast.success("Đã thêm từ mới thành công!");
        setForm({
          hanzi: "",
          pinyin: "",
          type: "Quán dụng ngữ",
          level: "Trung cấp",
          source: "",
          vietnameseMeaning: "",
          literalMeaning: "",
          figurativeMeaning: "",
          chineseDefinition: "",
          usageContext: "",
          origin: "",
          grammar: "",
          imageUrl: "",
        });
        setAnalysis([{ character: "", pinyin: "", meaning: "" }]);
        setExamples([{ chinese: "", pinyin: "", vietnamese: "" }]);
      }

      scrollToTop();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const addAnalysisRow = () =>
    setAnalysis([...analysis, { character: "", pinyin: "", meaning: "" }]);
  const removeAnalysisRow = (index: number) =>
    setAnalysis(analysis.filter((_, i) => i !== index));

  const addExampleRow = () =>
    setExamples([...examples, { chinese: "", pinyin: "", vietnamese: "" }]);
  const removeExampleRow = (index: number) =>
    setExamples(examples.filter((_, i) => i !== index));

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <SpinnerIcon className="w-10 h-10 text-red-600" />
      </div>
    );
  }

  return (
    <div ref={topRef} className="max-w-4xl w-full mx-auto animate-pop">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 relative">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Section 1: Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">
              1. Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Hán tự *
                </label>
                <input
                  required
                  value={form.hanzi}
                  onChange={(e) => setForm({ ...form, hanzi: e.target.value })}
                  className="w-full border rounded-lg p-2 font-hanzi text-lg"
                  placeholder="VD: 做生意"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Pinyin *
                </label>
                <input
                  required
                  value={form.pinyin}
                  onChange={(e) => setForm({ ...form, pinyin: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  placeholder="VD: zuò shēngyi"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Nghĩa tiếng Việt *
              </label>
              <input
                required
                value={form.vietnameseMeaning}
                onChange={(e) =>
                  setForm({ ...form, vietnameseMeaning: e.target.value })
                }
                className="w-full border rounded-lg p-2"
                placeholder="VD: Làm ăn"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Phân loại
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border rounded-lg p-2"
                >
                  <option>Quán dụng ngữ</option>
                  <option>Thành ngữ (Chengyu)</option>
                  <option>Tiếng lóng</option>
                  <option>Ngôn ngữ mạng</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Cấp độ
                </label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="w-full border rounded-lg p-2"
                >
                  <option>Sơ cấp</option>
                  <option>Trung cấp</option>
                  <option>Cao cấp</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Nguồn (Giáo trình)
                </label>
                <input
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  placeholder="VD: Qiaoliang"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Giải nghĩa chi tiết */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">
              2. Giải nghĩa & Ngữ pháp
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Nghĩa đen
                </label>
                <input
                  value={form.literalMeaning}
                  onChange={(e) =>
                    setForm({ ...form, literalMeaning: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Nghĩa bóng
                </label>
                <input
                  value={form.figurativeMeaning}
                  onChange={(e) =>
                    setForm({ ...form, figurativeMeaning: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Ảnh minh họa
              </label>
              <input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full border rounded-lg p-2"
                placeholder="Nhập đường dẫn ảnh, VD: https://anh.png"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Giải thích tiếng Trung (Sách/Từ điển)
              </label>
              <textarea
                value={form.chineseDefinition}
                onChange={(e) =>
                  setForm({ ...form, chineseDefinition: e.target.value })
                }
                className="w-full border rounded-lg p-2 h-20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Ngữ cảnh
              </label>
              <textarea
                value={form.usageContext}
                onChange={(e) =>
                  setForm({ ...form, usageContext: e.target.value })
                }
                className="w-full border rounded-lg p-2 h-20"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Nguồn gốc
                </label>
                <textarea
                  value={form.origin}
                  onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  className="w-full border rounded-lg p-2 h-20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Cách dùng/Ngữ pháp
                </label>
                <textarea
                  value={form.grammar}
                  onChange={(e) =>
                    setForm({ ...form, grammar: e.target.value })
                  }
                  className="w-full border rounded-lg p-2 h-20"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Phân tích Hán tự */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-bold text-slate-800">
                3. Phân tích Hán tự
              </h3>
              <button
                type="button"
                onClick={addAnalysisRow}
                className="text-xs bg-slate-800 text-white px-3 py-1 rounded-full font-bold hover:bg-black transition-all flex items-center gap-1"
              >
                <PlusIcon className="w-3 h-3" /> Thêm chữ
              </button>
            </div>
            {analysis.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-3 items-end bg-slate-50 p-3 rounded-lg border border-slate-100 relative group"
              >
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Chữ
                    </label>
                    <input
                      value={item.character}
                      onChange={(e) => {
                        const newArr = [...analysis];
                        newArr[idx].character = e.target.value;
                        setAnalysis(newArr);
                      }}
                      className="w-full border rounded p-1.5 font-hanzi"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Pinyin
                    </label>
                    <input
                      value={item.pinyin}
                      onChange={(e) => {
                        const newArr = [...analysis];
                        newArr[idx].pinyin = e.target.value;
                        setAnalysis(newArr);
                      }}
                      className="w-full border rounded p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Nghĩa
                    </label>
                    <input
                      value={item.meaning}
                      onChange={(e) => {
                        const newArr = [...analysis];
                        newArr[idx].meaning = e.target.value;
                        setAnalysis(newArr);
                      }}
                      className="w-full border rounded p-1.5"
                    />
                  </div>
                </div>
                {analysis.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAnalysisRow(idx)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Section 4: Ví dụ minh họa */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-bold text-slate-800">
                4. Ví dụ minh họa
              </h3>
              <button
                type="button"
                onClick={addExampleRow}
                className="text-xs bg-slate-800 text-white px-3 py-1 rounded-full font-bold hover:bg-black transition-all flex items-center gap-1"
              >
                <PlusIcon className="w-3 h-3" /> Thêm ví dụ
              </button>
            </div>
            {examples.map((item, idx) => (
              <div
                key={idx}
                className="space-y-2 bg-red-50/30 p-4 rounded-xl border border-red-100/50 relative group"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-red-400 uppercase mb-1">
                      Tiếng Trung
                    </label>
                    <input
                      value={item.chinese}
                      onChange={(e) => {
                        const newArr = [...examples];
                        newArr[idx].chinese = e.target.value;
                        setExamples(newArr);
                      }}
                      className="w-full border rounded p-2 font-hanzi"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-red-400 uppercase mb-1">
                      Pinyin
                    </label>
                    <input
                      value={item.pinyin}
                      onChange={(e) => {
                        const newArr = [...examples];
                        newArr[idx].pinyin = e.target.value;
                        setExamples(newArr);
                      }}
                      className="w-full border rounded p-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-red-400 uppercase mb-1">
                    Nghĩa tiếng Việt
                  </label>
                  <input
                    value={item.vietnamese}
                    onChange={(e) => {
                      const newArr = [...examples];
                      newArr[idx].vietnamese = e.target.value;
                      setExamples(newArr);
                    }}
                    className="w-full border rounded p-2"
                  />
                </div>
                {examples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExampleRow(idx)}
                    className="absolute top-2 right-2 p-1 text-red-200 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="sticky bottom-0 z-10 bg-white border-t border-slate-100 p-4 -mx-6 -mb-6 md:-mx-8 md:-mb-8 flex justify-end rounded-b-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-red-700 text-white rounded-xl font-bold shadow-lg hover:bg-red-800 transition-all flex items-center gap-2"
            >
              {loading && <SpinnerIcon className="w-5 h-5" />}{" "}
              {idiomId ? "Cập nhật thay đổi" : "Lưu dữ liệu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminInsert;
