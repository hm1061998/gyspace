import React, { useState, useRef, useEffect } from "react";
import { PlusIcon, TrashIcon, SpinnerIcon } from "@/components/common/icons";
import {
  createIdiom,
  updateIdiom,
  fetchIdiomById,
} from "@/services/api/idiomService";
import { toast } from "@/services/ui/toastService";
import FormSelect from "@/components/common/FormSelect";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { AdminOutletContext } from "@/layouts/AdminLayout";
import { useForm, useFieldArray } from "react-hook-form";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { getAdminStats } from "@/redux/adminSlice";

interface AdminInsertProps {
  onBack: () => void;
  idiomId?: string;
}

type AnalysisItem = {
  character: string;
  pinyin: string;
  meaning: string;
};

type ExampleItem = {
  chinese: string;
  pinyin: string;
  vietnamese: string;
};

type IdiomFormInputs = {
  hanzi: string;
  pinyin: string;
  type: string;
  level: string;
  source: string;
  vietnameseMeaning: string;
  literalMeaning: string;
  figurativeMeaning: string;
  chineseDefinition: string;
  origin: string;
  grammar: string;
  imageUrl: string;
  videoUrl: string;
  usageContext: string;
  analysis: AnalysisItem[];
  examples: ExampleItem[];
};

const AdminInsert: React.FC<AdminInsertProps> = ({ onBack, idiomId }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const topRef = useRef<HTMLDivElement>(null);
  const { setPageHeader } = useOutletContext<AdminOutletContext>();
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    formState: { errors },
  } = useForm<IdiomFormInputs>({
    defaultValues: {
      type: "Quán dụng ngữ",
      level: "Trung cấp",
      analysis: [{ character: "", pinyin: "", meaning: "" }],
      examples: [{ chinese: "", pinyin: "", vietnamese: "" }],
    },
  });

  const {
    fields: analysisFields,
    append: appendAnalysis,
    remove: removeAnalysis,
  } = useFieldArray({
    control,
    name: "analysis",
  });

  const {
    fields: exampleFields,
    append: appendExample,
    remove: removeExample,
  } = useFieldArray({
    control,
    name: "examples",
  });

  useEffect(() => {
    if (idiomId) {
      loadIdiomData(idiomId);
    } else {
      // Check for 'hanzi' param for pre-filling
      const hanziParam = searchParams.get("hanzi");
      if (hanziParam) {
        reset({ ...getValues(), hanzi: hanziParam });
      }
    }
  }, [idiomId, searchParams, reset, getValues]);

  const loadIdiomData = async (id: string) => {
    setFetching(true);
    try {
      const data = await fetchIdiomById(id);
      reset({
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
        videoUrl: data.videoUrl || "",
        usageContext: data.usageContext || "",
        analysis: data.analysis?.length
          ? data.analysis
          : [{ character: "", pinyin: "", meaning: "" }],
        examples: data.examples?.length
          ? data.examples
          : [{ chinese: "", pinyin: "", vietnamese: "" }],
      });
      setPageHeader(null, undefined, data);
    } catch (err: any) {
      toast.error("Không thể tải dữ liệu để sửa.");
    } finally {
      setFetching(false);
    }
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = async (data: IdiomFormInputs) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        analysis: data.analysis.filter((a) => a.character.trim()),
        examples: data.examples.filter((ex) => ex.chinese.trim()),
      };

      if (idiomId) {
        await updateIdiom(idiomId, payload);
        toast.success("Đã cập nhật từ vựng thành công!");
      } else {
        await createIdiom(payload);
        toast.success("Đã thêm từ mới thành công!");
        reset();
      }
      dispatch(getAdminStats(true));
      scrollToTop();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <SpinnerIcon className="w-10 h-10 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div ref={topRef} className="max-w-4xl w-full mx-auto animate-pop pb-10">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 relative">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
          <div className="p-6 md:p-8 space-y-8">
            {/* Section 1: Thông tin cơ bản */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-slate-800 text-white rounded text-xs flex items-center justify-center">
                  1
                </span>
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="HÁN TỰ *"
                  {...register("hanzi", {
                    required: "Vui lòng nhập Hán tự",
                    maxLength: {
                      value: 100,
                      message: "Hán tự tối đa 100 ký tự",
                    },
                  })}
                  className="font-hanzi text-lg bg-slate-50/50"
                  placeholder="VD: 做生意"
                  error={errors.hanzi?.message}
                />
                <Input
                  label="PINYIN *"
                  {...register("pinyin", {
                    maxLength: {
                      value: 200,
                      message: "Pinyin tối đa 200 ký tự",
                    },
                  })}
                  className="bg-slate-50/50"
                  placeholder="VD: zuò shēngyi"
                  error={errors.pinyin?.message}
                />
              </div>
              <Input
                label="NGHĨA TIẾNG VIỆT *"
                {...register("vietnameseMeaning", {
                  maxLength: {
                    value: 2000,
                    message: "Nghĩa tối đa 2000 ký tự",
                  },
                })}
                className="bg-slate-50/50"
                placeholder="VD: Làm ăn"
                error={errors.vietnameseMeaning?.message}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Phân loại
                  </label>
                  <FormSelect
                    {...register("type", {
                      maxLength: { value: 50, message: "Tối đa 50 ký tự" },
                    })}
                    options={[
                      { value: "Quán dụng ngữ", label: "Quán dụng ngữ" },
                      {
                        value: "Thành ngữ (Chengyu)",
                        label: "Thành ngữ (Chengyu)",
                      },
                      { value: "Tiếng lóng", label: "Tiếng lóng" },
                      { value: "Ngôn ngữ mạng", label: "Ngôn ngữ mạng" },
                    ]}
                    className="!bg-slate-50/50 !p-3"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Cấp độ
                  </label>
                  <FormSelect
                    {...register("level", {
                      maxLength: { value: 20, message: "Tối đa 20 ký tự" },
                    })}
                    options={[
                      { value: "Sơ cấp", label: "Sơ cấp" },
                      { value: "Trung cấp", label: "Trung cấp" },
                      { value: "Cao cấp", label: "Cao cấp" },
                    ]}
                    className="!bg-slate-50/50 !p-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 ml-1">
                    NGUỒN (GIÁO TRÌNH)
                  </label>
                  <Input
                    {...register("source", {
                      maxLength: { value: 100, message: "Tối đa 100 ký tự" },
                    })}
                    className="bg-slate-50/50"
                    placeholder="VD: Qiaoliang"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Giải nghĩa chi tiết */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-slate-800 text-white rounded text-xs flex items-center justify-center">
                  2
                </span>
                Giải nghĩa & Ngữ pháp
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="NGHĨA ĐEN"
                  {...register("literalMeaning")}
                  className="bg-slate-50/50"
                  error={errors.literalMeaning?.message}
                />
                <Input
                  label="NGHĨA BÓNG"
                  {...register("figurativeMeaning")}
                  className="bg-slate-50/50"
                  error={errors.figurativeMeaning?.message}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="ẢNH MINH HỌA"
                  {...register("imageUrl", {
                    maxLength: {
                      value: 1000,
                      message: "URL tối đa 1000 ký tự",
                    },
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Phải là URL hợp lệ (http/https)",
                    },
                  })}
                  className="bg-slate-50/50"
                  placeholder="https://anh.png"
                  error={errors.imageUrl?.message}
                />
                <Input
                  label="VIDEO (URL)"
                  {...register("videoUrl", {
                    maxLength: {
                      value: 1000,
                      message: "URL tối đa 1000 ký tự",
                    },
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Phải là URL hợp lệ (http/https)",
                    },
                  })}
                  className="bg-slate-50/50"
                  placeholder="https://video.mp4"
                  error={errors.videoUrl?.message}
                />
              </div>
              <Textarea
                label="GIẢI THÍCH TIẾNG TRUNG"
                {...register("chineseDefinition")}
                className="h-20 bg-slate-50/50"
              />
              <Textarea
                label="NGỮ CẢNH"
                {...register("usageContext")}
                className="h-20 bg-slate-50/50"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea
                  label="NGUỒN GỐC"
                  {...register("origin", {
                    maxLength: { value: 2000, message: "Tối đa 2000 ký tự" },
                  })}
                  className="h-24 bg-slate-50/50"
                  error={errors.origin?.message}
                />
                <Textarea
                  label="CÁCH DÙNG/NGỮ PHÁP"
                  {...register("grammar", {
                    maxLength: { value: 2000, message: "Tối đa 2000 ký tự" },
                  })}
                  className="h-24 bg-slate-50/50"
                  error={errors.grammar?.message}
                />
              </div>
            </div>

            {/* Section 3: Phân tích Hán tự */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 bg-slate-800 text-white rounded text-xs flex items-center justify-center">
                    3
                  </span>
                  Phân tích Hán tự
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    appendAnalysis({ character: "", pinyin: "", meaning: "" })
                  }
                  className="text-[10px] bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-bold hover:border-slate-400 transition-all flex items-center gap-1 shadow-sm"
                >
                  <PlusIcon className="w-3 h-3" /> THÊM CHỮ
                </button>
              </div>
              <div className="space-y-3">
                {analysisFields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="flex gap-3 items-start bg-slate-50/30 p-4 rounded-xl border border-slate-100/50 group"
                  >
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <div>
                        <Input
                          {...register(`analysis.${idx}.character`, {
                            maxLength: {
                              value: 10,
                              message: "Tối đa 10 ký tự",
                            },
                          })}
                          className="font-hanzi"
                          placeholder="Chữ"
                        />
                      </div>
                      <div>
                        <Input
                          {...register(`analysis.${idx}.pinyin`, {
                            maxLength: {
                              value: 100,
                              message: "Tối đa 100 ký tự",
                            },
                          })}
                          placeholder="Pinyin"
                        />
                      </div>
                      <div>
                        <Input
                          {...register(`analysis.${idx}.meaning`, {
                            maxLength: {
                              value: 500,
                              message: "Tối đa 500 ký tự",
                            },
                          })}
                          placeholder="Nghĩa"
                        />
                      </div>
                    </div>
                    {analysisFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAnalysis(idx)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors bg-white rounded-lg border border-slate-100 shadow-sm"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Ví dụ minh họa */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-red-50/50 p-3 rounded-xl border border-red-100/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 bg-red-700 text-white rounded text-xs flex items-center justify-center">
                    4
                  </span>
                  Ví dụ minh họa
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    appendExample({ chinese: "", pinyin: "", vietnamese: "" })
                  }
                  className="text-[10px] bg-white border border-red-100 text-red-600 px-3 py-1.5 rounded-lg font-bold hover:bg-red-50 transition-all flex items-center gap-1 shadow-sm"
                >
                  <PlusIcon className="w-3 h-3" /> THÊM VÍ DỤ
                </button>
              </div>
              <div className="space-y-4">
                {exampleFields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="space-y-2 bg-white p-5 rounded-2xl border border-slate-100 relative group shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Input
                          label="TIẾNG TRUNG"
                          {...register(`examples.${idx}.chinese`, {
                            maxLength: {
                              value: 1000,
                              message: "Tối đa 1000 ký tự",
                            },
                          })}
                          className="font-hanzi bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <Input
                          label="PINYIN"
                          {...register(`examples.${idx}.pinyin`, {
                            maxLength: {
                              value: 1000,
                              message: "Tối đa 1000 ký tự",
                            },
                          })}
                          className="bg-slate-50/50"
                        />
                      </div>
                    </div>
                    <div>
                      <Input
                        label="NGHĨA TIẾNG VIỆT"
                        {...register(`examples.${idx}.vietnamese`, {
                          maxLength: {
                            value: 1000,
                            message: "Tối đa 1000 ký tự",
                          },
                        })}
                        className="bg-slate-50/50"
                      />
                    </div>
                    {exampleFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExample(idx)}
                        className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 transition-colors bg-white rounded-lg border border-slate-100"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-100 p-5 md:p-7 flex justify-end items-center gap-4 rounded-b-2xl shadow-[0_-12px_20px_-5px_rgba(0,0,0,0.05)]">
            {idiomId && (
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Hủy bỏ
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3.5 bg-red-700 text-white rounded-2xl font-bold shadow-xl shadow-red-200 hover:bg-red-800 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <SpinnerIcon className="w-5 h-5 animate-spin" />
              ) : idiomId ? (
                "Cập nhật từ vựng"
              ) : (
                "Lưu từ vựng mới"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminInsert;
