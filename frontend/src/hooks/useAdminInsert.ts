import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import {
  createIdiom,
  updateIdiom,
  fetchIdiomById,
} from "@/services/api/idiomService";
import { toast } from "@/libs/Toast";
import { queryKeys } from "@/services/queryKeys";

export type AnalysisItem = {
  character: string;
  pinyin: string;
  meaning: string;
};

export type ExampleItem = {
  chinese: string;
  pinyin: string;
  vietnamese: string;
};

export type IdiomFormInputs = {
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

export const useAdminInsert = (idiomId?: string) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const queryClient = useQueryClient();
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

  const {
    fields: exampleFields,
    append: appendExample,
    remove: removeExample,
  } = useFieldArray({
    control,
    name: "examples",
  });

  const imageUrlValue = watch("imageUrl");

  useEffect(() => {
    if (idiomId) {
      loadIdiomData(idiomId);
    } else {
      const hanziParam = searchParams.get("hanzi");
      if (hanziParam) {
        reset({ ...getValues(), hanzi: hanziParam });
      }
    }
  }, [idiomId, searchParams]);

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
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.idioms.stored.all });
      scrollToTop();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetching,
    register,
    handleSubmit,
    control,
    errors,
    analysisFields,
    appendAnalysis,
    removeAnalysis,
    exampleFields,
    appendExample,
    removeExample,
    imageUrlValue,
    setValue,
    onSubmit,
    topRef,
  };
};
