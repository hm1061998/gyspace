import React, { useState } from "react";
import { CalendarIcon, CloseIcon } from "./icons";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear?: () => void;
  className?: string;
  height?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  className = "",
  height = "h-10",
}) => {
  const hasValue = startDate || endDate;

  const handleClear = () => {
    onStartDateChange("");
    onEndDateChange("");
    onClear?.();
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex items-center gap-2 ${height} px-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-all group`}
      >
        <CalendarIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Start Date */}
          <div className="relative flex-1">
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              max={endDate || undefined}
              className={`w-full bg-transparent border-none outline-none text-sm font-medium cursor-pointer
                ${startDate ? "text-slate-700" : "text-transparent"}
                [&::-webkit-calendar-picker-indicator]:cursor-pointer
                [&::-webkit-calendar-picker-indicator]:opacity-0
                [&::-webkit-calendar-picker-indicator]:absolute
                [&::-webkit-calendar-picker-indicator]:inset-0
                [&::-webkit-calendar-picker-indicator]:w-full
                [&::-webkit-calendar-picker-indicator]:h-full
              `}
            />
            {!startDate && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
                Từ ngày
              </span>
            )}
          </div>

          {/* Separator */}
          <span className="text-slate-400 flex-shrink-0">→</span>

          {/* End Date */}
          <div className="relative flex-1">
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              min={startDate || undefined}
              className={`w-full bg-transparent border-none outline-none text-sm font-medium cursor-pointer
                ${endDate ? "text-slate-700" : "text-transparent"}
                [&::-webkit-calendar-picker-indicator]:cursor-pointer
                [&::-webkit-calendar-picker-indicator]:opacity-0
                [&::-webkit-calendar-picker-indicator]:absolute
                [&::-webkit-calendar-picker-indicator]:inset-0
                [&::-webkit-calendar-picker-indicator]:w-full
                [&::-webkit-calendar-picker-indicator]:h-full
              `}
            />
            {!endDate && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
                Đến ngày
              </span>
            )}
          </div>
        </div>

        {/* Clear Button */}
        {hasValue && (
          <button
            onClick={handleClear}
            className="flex-shrink-0 p-1 hover:bg-slate-100 rounded-lg transition-colors"
            type="button"
            title="Xóa bộ lọc ngày"
          >
            <CloseIcon className="w-4 h-4 text-slate-400 hover:text-slate-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;
