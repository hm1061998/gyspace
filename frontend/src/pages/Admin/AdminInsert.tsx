import React, { useState, useRef, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  SpinnerIcon,
  ArrowLeftIcon,
  PhotoIcon,
  SettingsIcon,
  BrainIcon,
  VideoIcon,
} from "@/components/common/icons";
import { mediaPickerService } from "@/libs/MediaPicker";
import {
  createIdiom,
  updateIdiom,
  fetchIdiomById,
} from "@/services/api/idiomService";
import { toast } from "@/libs/Toast";
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
    setValue,
    watch,
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

  const imageUrlValue = watch("imageUrl");

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

  const handleOpenMediaPicker = async () => {
    toast.warning("Chức năng này đang được phát triển");
    return;
    const selectedUrl = await mediaPickerService.open();
    if (selectedUrl) {
      setValue("imageUrl", selectedUrl, {
        shouldValidate: true,
        shouldDirty: true,
      });
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
          className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar bg-slate-50/50"
        >
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT COLUMN: Main Content */}
              <div className="lg:col-span-8 space-y-5">
                {/* Section 1: Dữ liệu chính */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-5 md:p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                          <PlusIcon className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">
                          Thông tin cốt lõi
                        </h3>
                      </div>
                      <span className="text-[10px] font-black text-red-400 uppercase tracking-widest bg-red-50/50 px-2 py-1 rounded-md">
                        Bắt buộc
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      <div className="md:col-span-5">
                        <Input
                          label="HÁN TỰ"
                          {...register("hanzi", { required: "Bắt buộc" })}
                          className="font-hanzi text-sm !py-2.5 bg-slate-50/50 border-slate-100 focus:bg-white transition-all"
                          placeholder="做生意"
                          error={errors.hanzi?.message}
                        />
                      </div>
                      <div className="md:col-span-7">
                        <Input
                          label="PINYIN"
                          {...register("pinyin")}
                          className="text-sm !py-2.5 bg-slate-50/50 border-slate-100 focus:bg-white transition-all"
                          placeholder="zuò shēngyi"
                        />
                      </div>
                      <div className="md:col-span-12">
                        <Input
                          label="NGHĨA TIẾNG VIỆT"
                          {...register("vietnameseMeaning")}
                          className="text-sm bg-slate-50/50 border-slate-100 focus:bg-white !py-2.5"
                          placeholder="Giải nghĩa chính..."
                        />
                      </div>
                      <div className="md:col-span-6">
                        <Input
                          label="NGHĨA ĐEN"
                          {...register("literalMeaning")}
                          className="text-sm bg-slate-50/50 border-slate-100 !py-2"
                        />
                      </div>
                      <div className="md:col-span-6">
                        <Input
                          label="NGHĨA BÓNG"
                          {...register("figurativeMeaning")}
                          className="text-sm bg-slate-50/50 border-slate-100 !py-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Giải thích & Chi tiết */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-5 md:p-6 space-y-5">
                    <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                      <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
                        <SettingsIcon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">
                        Giải thích & Ngữ pháp
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <Textarea
                        label="ĐỊNH NGHĨA TIẾNG TRUNG"
                        {...register("chineseDefinition")}
                        className="h-20 bg-slate-50/50 border-slate-100 focus:bg-white text-sm font-hanzi"
                      />
                      <Textarea
                        label="NGỮ CẢNH"
                        {...register("usageContext")}
                        className="h-20 bg-slate-50/50 border-slate-100 focus:bg-white text-sm"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Textarea
                          label="NGUỒN GỐC"
                          {...register("origin")}
                          className="h-24 bg-slate-50/50 border-slate-100 text-sm"
                        />
                        <Textarea
                          label="NGỮ PHÁP"
                          {...register("grammar")}
                          className="h-24 bg-slate-50/50 border-slate-100 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Phân tích Hán tự */}
                <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold text-sm">
                        字
                      </span>
                      <h3 className="text-base font-bold text-slate-800">
                        Phân tích Hán tự
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        appendAnalysis({
                          character: "",
                          pinyin: "",
                          meaning: "",
                        })
                      }
                      className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg font-bold text-[10px] uppercase hover:bg-amber-100 transition-all flex items-center gap-1.5 border border-amber-100"
                    >
                      <PlusIcon className="w-3.5 h-3.5" /> Thêm chữ
                    </button>
                  </div>

                  <div className="space-y-2">
                    {analysisFields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="flex gap-3 items-center bg-slate-50/30 p-2 rounded-xl border border-slate-100 group transition-all hover:bg-white hover:shadow-sm"
                      >
                        <div className="w-20">
                          <Input
                            {...register(`analysis.${idx}.character`)}
                            className="font-hanzi text-sm text-center !py-1.5 bg-white border-slate-100"
                            placeholder="Chữ"
                          />
                        </div>
                        <div className="w-32">
                          <Input
                            {...register(`analysis.${idx}.pinyin`)}
                            className="text-sm text-center !py-1.5 bg-white border-slate-100"
                            placeholder="Pinyin"
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            {...register(`analysis.${idx}.meaning`)}
                            className="text-sm !py-1.5 bg-white border-slate-100"
                            placeholder="Nghĩa của chữ này..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAnalysis(idx)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Ví dụ minh họa */}
                <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-sm">
                        例
                      </span>
                      <h3 className="text-base font-bold text-slate-800">
                        Ví dụ minh họa
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        appendExample({
                          chinese: "",
                          pinyin: "",
                          vietnamese: "",
                        })
                      }
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-[10px] uppercase hover:bg-emerald-100 transition-all flex items-center gap-1.5 border border-emerald-200"
                    >
                      <PlusIcon className="w-3.5 h-3.5" /> Thêm ví dụ
                    </button>
                  </div>

                  <div className="space-y-3">
                    {exampleFields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="relative bg-slate-50/30 p-4 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-sm transition-all"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                          <Textarea
                            {...register(`examples.${idx}.chinese`)}
                            className="font-hanzi h-[78px] text-base bg-white !py-1.5"
                            placeholder="Câu tiếng Trung..."
                          />
                          <Textarea
                            {...register(`examples.${idx}.pinyin`)}
                            className="h-[78px] text-base bg-white !py-1.5"
                            placeholder="Pinyin phiên âm..."
                          />
                          <Textarea
                            {...register(`examples.${idx}.vietnamese`)}
                            className="h-[78px] bg-white text-base !py-2"
                            placeholder="Nghĩa tiếng Việt..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExample(idx)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-white text-slate-300 hover:text-red-500 rounded-full shadow-sm border border-slate-100 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Sidebar Settings */}
              <div className="lg:col-span-4 space-y-5">
                {/* Meta Settings */}
                <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200 sticky top-6">
                  <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                    <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
                      <SettingsIcon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      Thiết lập
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <FormSelect
                      label="PHÂN LOẠI"
                      {...register("type")}
                      options={[
                        { value: "Quán dụng ngữ", label: "Quán dụng ngữ" },
                        {
                          value: "Thành ngữ (Chengyu)",
                          label: "Thành ngữ (Chengyu)",
                        },
                        { value: "Tiếng lóng", label: "Tiếng lóng" },
                        { value: "Ngôn ngữ mạng", label: "Ngôn ngữ mạng" },
                      ]}
                      className="bg-slate-50 border-slate-100 !py-2.5 rounded-xl text-sm text-slate-700"
                    />

                    <FormSelect
                      label="CẤP ĐỘ"
                      {...register("level")}
                      options={[
                        { value: "Sơ cấp", label: "Sơ cấp" },
                        { value: "Trung cấp", label: "Trung cấp" },
                        { value: "Cao cấp", label: "Cao cấp" },
                      ]}
                      className="bg-slate-50 border-slate-100 !py-2.5 rounded-xl text-sm text-slate-700"
                    />

                    <Input
                      label="NGUỒN / GIÁO TRÌNH"
                      {...register("source")}
                      className="bg-slate-50 border-slate-100 !py-2.5 rounded-xl text-sm text-slate-700"
                      placeholder="VD: Qiaoliang"
                    />

                    <div className="pt-2 border-t border-slate-50 space-y-3">
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-bold text-slate-700 ml-1">
                            {" "}
                            MEDIA & HÌNH ẢNH{" "}
                          </label>
                          <div className="flex gap-2">
                            <Input
                              {...register("imageUrl")}
                              className="bg-slate-50 border-slate-100 !py-2 text-sm flex-1 h-10 text-slate-700"
                              containerClassName="flex-1"
                              placeholder="URL Ảnh (VD: https://example.com/image.jpg)..."
                            />
                            <button
                              type="button"
                              onClick={handleOpenMediaPicker}
                              className="w-10 h-10 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-all flex items-center justify-center shrink-0 active:scale-95 shadow-lg shadow-red-100"
                              title="Chọn từ thư viện"
                            >
                              <PhotoIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {imageUrlValue && !errors.imageUrl && (
                          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 group/img bg-slate-50">
                            <img
                              src={imageUrlValue}
                              className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 transition-all duration-300"
                              alt="Preview"
                            />
                            <button
                              type="button"
                              onClick={() => setValue("imageUrl", "")}
                              className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-red-500 hover:text-white text-slate-400 rounded-lg flex items-center justify-center shadow-sm backdrop-blur-md transition-all opacity-0 group-hover/img:opacity-100"
                              title="Xóa ảnh"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-bold text-slate-700 ml-1">
                            VIDEO
                          </label>
                          <div className="flex gap-2">
                            <Input
                              {...register("videoUrl")}
                              className="bg-slate-50 border-slate-100 !py-2 text-sm flex-1 h-10 text-slate-700"
                              containerClassName="flex-1"
                              placeholder="URL Video (VD: https://example.com/video.mp4)..."
                            />
                            <button
                              type="button"
                              disabled={true}
                              className="w-10 h-10 rounded-xl transition-all flex items-center justify-center bg-slate-50 text-slate-300 cursor-not-allowed"
                              title="Chọn từ thư viện"
                            >
                              <VideoIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 rounded-3xl p-5 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <BrainIcon className="w-4 h-4 text-blue-500" />
                    <h4 className="text-sm font-bold text-blue-800">
                      Mẹo nhanh
                    </h4>
                  </div>
                  <p className="text-xs text-blue-600/80 leading-relaxed font-medium">
                    Nhập Hán tự trước để tự động gợi ý Pinyin và ý nghĩa (nếu
                    có).
                  </p>
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
