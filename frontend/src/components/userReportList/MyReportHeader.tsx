import React, { useState, useEffect } from "react";
import { ExclamationIcon } from "@/components/common/icons";
import FormSelect from "@/components/common/FormSelect";
import { fetchSuggestions } from "@/services/api";
import Container from "@/components/common/Container";

interface MyReportHeaderProps {
  filter: string;
  setFilter: (val: string) => void;
}

const MyReportHeader: React.FC<MyReportHeaderProps> = ({
  filter,
  setFilter,
}) => {
  const [tempSelectedIdiom, setTempSelectedIdiom] = useState<any>(null);
  const [idiomSearchText, setIdiomSearchText] = useState("");
  const [idiomSuggestions, setIdiomSuggestions] = useState<any[]>([]);
  const [idiomSuggestionsPage, setIdiomSuggestionsPage] = useState(1);
  const [hasMoreIdioms, setHasMoreIdioms] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIdiomSuggestionsPage(1);
      void searchIdioms(idiomSearchText, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [idiomSearchText]);

  useEffect(() => {
    if (idiomSuggestionsPage > 1) {
      void searchIdioms(idiomSearchText, idiomSuggestionsPage);
    }
  }, [idiomSuggestionsPage]);

  const searchIdioms = async (query: string, page: number) => {
    setLoadingSuggestions(true);
    try {
      const { data, meta } = await fetchSuggestions({ search: query, page });

      if (page === 1) {
        setIdiomSuggestions(data);
      } else {
        setIdiomSuggestions((prev) => [...prev, ...data]);
      }
      setHasMoreIdioms(meta.hasMore);
    } catch (err) {
      console.error("Lỗi tìm kiếm thành ngữ:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleLoadMoreSuggestions = () => {
    if (hasMoreIdioms && !loadingSuggestions) {
      setIdiomSuggestionsPage((prev) => prev + 1);
    }
  };

  return (
    <div className="flex-none bg-white border-b border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] z-20 py-6 md:py-8">
      <Container>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-red-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-xl shadow-red-200">
              <ExclamationIcon className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-hanzi font-black text-slate-800 tracking-tight">
                Phản hồi & Báo lỗi
              </h1>
              <p className="text-[10px] md:text-sm text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                Góp ý xây dựng từ điển
              </p>
            </div>
          </div>

          <div className="flex w-full sm:w-auto gap-3">
            <FormSelect
              containerClassName="max-w-full w-80"
              placeholder="Lọc theo thành ngữ..."
              searchable
              value={tempSelectedIdiom?.id || ""}
              options={[
                ...(tempSelectedIdiom
                  ? [
                      {
                        value: tempSelectedIdiom.id,
                        label: tempSelectedIdiom.hanzi,
                      },
                    ]
                  : []),
                { value: "all", label: "-- Tất cả --" },
                ...idiomSuggestions
                  .filter((i) => i.id !== tempSelectedIdiom?.id)
                  .map((item) => ({
                    value: item.id,
                    label: `${item.hanzi} (${item.pinyin})`,
                  })),
              ]}
              onChange={(val) => {
                if (val === "all") {
                  setTempSelectedIdiom(null);
                  setFilter(null);
                } else {
                  const item =
                    idiomSuggestions.find((i) => i.id === val) ||
                    (tempSelectedIdiom?.id === val ? tempSelectedIdiom : null);
                  if (item) {
                    setTempSelectedIdiom(item);
                    setFilter(item.id);
                  }
                }
                setIdiomSearchText(""); // reset search text
              }}
              searchValue={idiomSearchText}
              onSearchChange={setIdiomSearchText}
              onLoadMore={handleLoadMoreSuggestions}
              loading={loadingSuggestions}
            />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default MyReportHeader;
