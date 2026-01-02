import React, { useState, useRef, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  SpinnerIcon,
  ArrowLeftIcon,
} from "@/components/common/icons";
import {
  createIdiom,
  updateIdiom,
  fetchIdiomById,
} from "@/services/api/idiomService";
import { toast } from "@/services/ui/toastService";
import FormSelect from "@/components/common/FormSelect";
import { useOutletContext, useSearchParams } from "react-router-dom";
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
    <div className="h-full flex flex-col overflow-hidden bg-slate-50">
      {/* Fixed Header */}
      <div className="flex-none bg-white border-b border-slate-200 shadow-sm z-10 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2 -ml-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                title="Quay lại"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {idiomId ? "Chỉnh sửa từ vựng" : "Thêm từ vựng mới"}
            </h1>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {/* Scrollable Form Content */}
        <div
          ref={topRef}
          className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar"
        >
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-3">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
              <div className="p-6 md:p-10 space-y-12">
                {/* Section 1: Thông tin cơ bản */}
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white rounded-xl text-sm flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                      1
                    </span>
                    Thông tin từ vựng
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="HÁN TỰ *"
                      {...register("hanzi", {
                        required: "Vui lòng nhập Hán tự",
                        maxLength: {
                          value: 100,
                          message: "Hán tự tối đa 100 ký tự",
                        },
                      })}
                      className="font-hanzi text-2xl !py-3 bg-slate-50/50 focus:bg-white transition-all"
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
                      className="text-lg !py-3 bg-slate-50/50 focus:bg-white transition-all"
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
                    className="text-lg bg-slate-50/50 focus:bg-white transition-all"
                    placeholder="VD: Làm ăn"
                    error={errors.vietnameseMeaning?.message}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
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
                        className="!bg-slate-50/50 hover:!bg-white !p-3.5 rounded-xl border-slate-200 transition-all font-bold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
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
                        className="!bg-slate-50/50 hover:!bg-white !p-3.5 rounded-xl border-slate-200 transition-all font-bold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                        Nguồn (Giáo trình)
                      </label>
                      <Input
                        {...register("source", {
                          maxLength: {
                            value: 100,
                            message: "Tối đa 100 ký tự",
                          },
                        })}
                        className="bg-slate-50/50 !py-3"
                        placeholder="VD: Qiaoliang"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Giải nghĩa chi tiết */}
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white rounded-xl text-sm flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                      2
                    </span>
                    Giải thích & Ngữ pháp
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="NGHĨA ĐEN"
                      {...register("literalMeaning")}
                      className="bg-slate-50/50"
                      placeholder="Giải thích nghĩa từng chữ"
                      error={errors.literalMeaning?.message}
                    />
                    <Input
                      label="NGHĨA BÓNG"
                      {...register("figurativeMeaning")}
                      className="bg-slate-50/50"
                      placeholder="Giải thích nghĩa ẩn dụ"
                      error={errors.figurativeMeaning?.message}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                      placeholder="https://example.com/image.png"
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
                      placeholder="https://youtube.com/..."
                      error={errors.videoUrl?.message}
                    />
                  </div>
                  <Textarea
                    label="GIẢI THÍCH TIẾNG TRUNG"
                    {...register("chineseDefinition")}
                    className="h-24 bg-slate-50/50 focus:bg-white transition-all font-hanzi text-lg"
                    placeholder="Định nghĩa bằng tiếng Trung..."
                  />
                  <Textarea
                    label="NGỮ CẢNH"
                    {...register("usageContext")}
                    className="h-24 bg-slate-50/50 focus:bg-white transition-all"
                    placeholder="Cách dùng trong đời sống..."
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Textarea
                      label="NGUỒN GỐC"
                      {...register("origin", {
                        maxLength: {
                          value: 2000,
                          message: "Tối đa 2000 ký tự",
                        },
                      })}
                      className="h-32 bg-slate-50/50 focus:bg-white transition-all"
                      placeholder="Sự tích hoặc lịch sử từ..."
                      error={errors.origin?.message}
                    />
                    <Textarea
                      label="CÁCH DÙNG/NGỮ PHÁP"
                      {...register("grammar", {
                        maxLength: {
                          value: 2000,
                          message: "Tối đa 2000 ký tự",
                        },
                      })}
                      className="h-32 bg-slate-50/50 focus:bg-white transition-all"
                      placeholder="Cấu trúc ngữ pháp liên quan..."
                      error={errors.grammar?.message}
                    />
                  </div>
                </div>

                {/* Section 3: Phân tích Hán tự */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-slate-100/50 p-4 rounded-2xl border border-slate-200">
                    <h3 className="font-black text-slate-900 flex items-center gap-3">
                      <span className="w-8 h-8 bg-slate-900 text-white rounded-xl text-sm flex items-center justify-center shadow-lg shadow-slate-200">
                        3
                      </span>
                      Phân tích Hán tự
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        appendAnalysis({
                          character: "",
                          pinyin: "",
                          meaning: "",
                        })
                      }
                      className="text-[10px] bg-white border border-slate-200 text-slate-900 px-4 py-2 rounded-xl font-black hover:border-slate-400 hover:shadow-md transition-all flex items-center gap-2 uppercase tracking-wider"
                    >
                      <PlusIcon className="w-4 h-4" /> THÊM CHỮ
                    </button>
                  </div>
                  <div className="space-y-4">
                    {analysisFields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="flex gap-4 items-start bg-slate-50/30 p-5 rounded-2xl border border-slate-100 shadow-sm"
                      >
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <Input
                            {...register(`analysis.${idx}.character`, {
                              maxLength: {
                                value: 10,
                                message: "Tối đa 10 ký tự",
                              },
                            })}
                            className="font-hanzi text-xl text-center"
                            placeholder="Chữ"
                          />
                          <Input
                            {...register(`analysis.${idx}.pinyin`, {
                              maxLength: {
                                value: 100,
                                message: "Tối đa 100 ký tự",
                              },
                            })}
                            placeholder="Pinyin"
                          />
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
                        {analysisFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAnalysis(idx)}
                            className="p-2 sm:p-3 text-slate-400 hover:text-red-600 transition-all bg-white rounded-xl border border-slate-200 hover:border-red-200 shadow-sm"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Ví dụ minh họa */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-red-50/50 p-4 rounded-2xl border border-red-100">
                    <h3 className="font-black text-slate-900 flex items-center gap-3">
                      <span className="w-8 h-8 bg-red-700 text-white rounded-xl text-sm flex items-center justify-center shadow-lg shadow-red-100">
                        4
                      </span>
                      Ví dụ minh họa
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        appendExample({
                          chinese: "",
                          pinyin: "",
                          vietnamese: "",
                        })
                      }
                      className="text-[10px] bg-white border border-red-200 text-red-700 px-4 py-2 rounded-xl font-black hover:bg-red-50 hover:shadow-md transition-all flex items-center gap-2 uppercase tracking-wider"
                    >
                      <PlusIcon className="w-4 h-4" /> THÊM VÍ DỤ
                    </button>
                  </div>
                  <div className="space-y-6">
                    {exampleFields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="space-y-4 bg-white p-6 rounded-3xl border border-slate-100 relative group shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="TIẾNG TRUNG"
                            {...register(`examples.${idx}.chinese`, {
                              maxLength: {
                                value: 1000,
                                message: "Tối đa 1000 ký tự",
                              },
                            })}
                            className="font-hanzi bg-slate-50/50 text-lg sm:text-xl"
                          />
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
                        <Input
                          label="NGHĨA TIẾNG VIỆT"
                          {...register(`examples.${idx}.vietnamese`, {
                            maxLength: {
                              value: 1000,
                              message: "Tối đa 1000 ký tự",
                            },
                          })}
                          className="bg-slate-50/50 font-medium"
                        />
                        {exampleFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExample(idx)}
                            className="absolute -top-3 -right-3 p-2 text-slate-400 hover:text-red-600 transition-all bg-white rounded-xl border border-slate-200 hover:border-red-200 shadow-md opacity-0 group-hover:opacity-100"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-none bg-white border-t border-slate-200 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 transition-all">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-wrap-reverse sm:flex-nowrap justify-end items-center gap-3 sm:gap-4">
            {idiomId && (
              <button
                type="button"
                onClick={onBack}
                className="flex-1 sm:flex-none px-8 py-3.5 font-black text-slate-400 hover:text-red-600 transition-all text-[10px] sm:text-xs uppercase tracking-[0.2em] outline-none"
              >
                Hủy bỏ
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-10 py-4 bg-red-700 text-white rounded-2xl font-black shadow-2xl shadow-red-200 hover:bg-red-800 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 text-xs sm:text-sm uppercase tracking-widest"
            >
              {loading ? (
                <SpinnerIcon className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90" />
                  <span>
                    {idiomId ? "Cập nhật từ vựng" : "Lưu từ vựng mới"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminInsert;
