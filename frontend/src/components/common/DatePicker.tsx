import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ChevronDownIcon,
  CloseIcon,
} from "./icons";

// --- Types ---
export type DatePickerValue = Date | null;
export type DateRangeValue = [Date | null, Date | null];

interface DatePickerProps {
  mode?: "date" | "range" | "datetime";
  value?: DatePickerValue | DateRangeValue;
  onChange?: (value: any) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  dateFormat?: string; // e.g. "DD/MM/YYYY" for DISPLAY.
  format?: string; // e.g. "YYYY-MM-DD" for OUTPUT VALUE.
  onClear?: () => void;
}

// --- Helpers ---
const MONTH_NAMES = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const SHORT_DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const formatDateTime = (date: Date, formatStr: string) => {
  if (!date || isNaN(date.getTime())) return "";

  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  const h = date.getHours();
  const min = date.getMinutes();
  const s = date.getSeconds();

  const pad = (n: number) => n.toString().padStart(2, "0");

  let str = formatStr;
  str = str.replace(/YYYY/g, y.toString());
  str = str.replace(/MM/g, pad(m));
  str = str.replace(/DD/g, pad(d));
  str = str.replace(/HH/g, pad(h));
  str = str.replace(/mm/g, pad(min));
  str = str.replace(/ss/g, pad(s));
  return str;
};

// Attempts to parse string to date using format DD/MM/YYYY or DDMMYYYY
// This is a naive implementation, robust one would use date-fns/moment
const parseDateString = (str: string): Date | null => {
  if (!str) return null;

  // 1. DD/MM/YYYY
  let parts = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (parts) {
    const d = parseInt(parts[1], 10);
    const m = parseInt(parts[2], 10) - 1;
    const y = parseInt(parts[3], 10);
    const date = new Date(y, m, d);
    if (
      date.getFullYear() === y &&
      date.getMonth() === m &&
      date.getDate() === d
    ) {
      return date;
    }
  }

  // 2. DDMMYYYY
  parts = str.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (parts) {
    const d = parseInt(parts[1], 10);
    const m = parseInt(parts[2], 10) - 1;
    const y = parseInt(parts[3], 10);
    const date = new Date(y, m, d);
    if (
      date.getFullYear() === y &&
      date.getMonth() === m &&
      date.getDate() === d
    ) {
      return date;
    }
  }

  // Try basic parse fallback
  const basic = Date.parse(str);
  if (!isNaN(basic)) return new Date(basic);

  return null;
};

const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

const isWithinRange = (date: Date, start: Date | null, end: Date | null) => {
  if (!start || !end) return false;
  const t = date.getTime();
  const s = new Date(start).setHours(0, 0, 0, 0);
  const e = new Date(end).setHours(23, 59, 59, 999);
  return t >= s && t <= e;
};

// --- Components ---

const DatePicker: React.FC<DatePickerProps> = ({
  mode = "date",
  value,
  onChange,
  label,
  placeholder,
  error,
  className = "",
  minDate,
  maxDate,
  disabled = false,
  dateFormat = "DD/MM/YYYY",
  format,
  onClear,
}) => {
  const defaultPlaceholder =
    mode === "range"
      ? "Từ ngày - Đến ngày"
      : mode === "datetime"
      ? "Chọn ngày giờ"
      : "Chọn ngày";

  const finalPlaceholder = placeholder || defaultPlaceholder;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // Parse value helper
  const parseValue = (val: any): any => {
    const toDate = (v: any) => (v instanceof Date ? v : v ? new Date(v) : null);
    if (mode === "range") {
      if (Array.isArray(val)) {
        return [toDate(val[0]), toDate(val[1])];
      }
      return [null, null];
    }
    return toDate(val);
  };

  const [internalValue, setInternalValue] = useState<any>(parseValue(value));
  const [inputText, setInputText] = useState(""); // For manual input

  // Init view date
  const getInitialViewDate = () => {
    const v = parseValue(value);
    if (mode === "range" && Array.isArray(v) && v[0]) return new Date(v[0]);
    if (!Array.isArray(v) && v) return new Date(v);
    return new Date();
  };

  const [viewDate, setViewDate] = useState<Date>(getInitialViewDate());
  const [rangeStep, setRangeStep] = useState<0 | 1>(0);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [time, setTime] = useState({ hours: 0, minutes: 0 });
  const [viewMode, setViewMode] = useState<"day" | "year">("day"); // 'day' or 'year'

  // Sync internalValue with props
  useEffect(() => {
    const newVal = parseValue(value);
    setInternalValue(newVal);
    updateInputText(newVal);
  }, [value, mode]);

  // Sync time state
  useEffect(() => {
    if (mode === "datetime" && internalValue instanceof Date) {
      setTime({
        hours: internalValue.getHours(),
        minutes: internalValue.getMinutes(),
      });
    }
  }, [internalValue, mode]);

  // Reset view mode when opening
  useEffect(() => {
    if (isOpen) {
      setViewMode("day");
    }
  }, [isOpen]);

  // Helper to update text input from value
  const updateInputText = (val: any) => {
    if (mode === "range") {
      const [start, end] = (val || []) as DateRangeValue;
      let text = "";
      if (start && end)
        text = `${formatDateTime(start, dateFormat)} - ${formatDateTime(
          end,
          dateFormat
        )}`;
      else if (start) text = `${formatDateTime(start, dateFormat)} - `;
      else text = "";
      setInputText(text);
    } else {
      const singleFormat =
        mode === "datetime"
          ? dateFormat === "DD/MM/YYYY"
            ? "DD/MM/YYYY HH:mm"
            : dateFormat
          : dateFormat;
      const text = val ? formatDateTime(val as Date, singleFormat!) : "";
      setInputText(text);
    }
  };

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
    } else {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    }
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideInput =
        containerRef.current && containerRef.current.contains(target);
      const isInsideDropdown =
        dropdownRef.current && dropdownRef.current.contains(target);

      if (!isInsideInput && !isInsideDropdown) {
        setIsOpen(false);
        setRangeStep(0);
        // On close, revert input text to match valid internal state to valid confusion
        updateInputText(internalValue);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, internalValue]);

  // --- Handlers ---

  const emitChange = (val: any) => {
    if (!onChange) return;
    if (format) {
      if (Array.isArray(val)) {
        onChange([
          val[0] ? formatDateTime(val[0], format) : null,
          val[1] ? formatDateTime(val[1], format) : null,
        ]);
      } else {
        onChange(val ? formatDateTime(val, format) : null);
      }
    } else {
      onChange(val);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === "range") {
      emitChange([null, null]);
    } else {
      emitChange(null);
    }
    onClear?.();
    setIsOpen(false);
    setInputText("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);

    if (!text) {
      // Optionally clear selection if empty?
      // For now, let's wait for blur or explicit clear
      return;
    }

    if (mode === "date") {
      const parsed = parseDateString(text);
      if (parsed) {
        // Valid date typed
        setInternalValue(parsed);
        setViewDate(parsed);
        emitChange(parsed);
      }
    }
    // Handling manual range input "date1 - date2" is complex, skipped for now to avoid bugs
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!inputText) {
        handleClear(e as any);
        setIsOpen(false);
        return;
      }

      const applyDate = (val: any) => {
        setInternalValue(val);
        // If valid date, switch view to it
        if (Array.isArray(val) && val[0]) setViewDate(val[0]);
        else if (val instanceof Date) setViewDate(val);

        emitChange(val);
        setIsOpen(false);
        // Let useEffect update the input text from the new value coming back from props usually,
        // or optimistic update here if needed.
        // But strict controlled flow relies on parent.
        // For good UX we might want to force update text to standardized format immediately to show it was accepted.
        updateInputText(val);
      };

      if (mode === "date" || mode === "datetime") {
        const parsed = parseDateString(inputText);
        if (parsed) {
          applyDate(parsed);
        }
      } else if (mode === "range") {
        // Try to split "Start - End"
        const parts = inputText.split("-").map((s) => s.trim());
        if (parts.length === 2 && parts[0] && parts[1]) {
          const d1 = parseDateString(parts[0]);
          const d2 = parseDateString(parts[1]);
          if (d1 && d2) {
            let start = d1 < d2 ? d1 : d2;
            let end = d1 < d2 ? d2 : d1;

            const s = new Date(start);
            s.setHours(0, 0, 0, 0);
            const e = new Date(end);
            e.setHours(23, 59, 59, 999);

            applyDate([s, e]);
            return;
          }
        }
        // Fallback: maybe just one date entered? Treat as start date.
        const d1 = parseDateString(inputText.trim());
        if (d1) {
          applyDate([d1, null]);
        }
      }
    }
  };

  const handleInputBlur = () => {
    // Revert to valid formatting if typed garbage
    updateInputText(internalValue);
  };

  const handleDayClick = (day: Date) => {
    if (disabled) return;
    if (minDate && day < new Date(minDate.setHours(0, 0, 0, 0))) return;
    if (maxDate && day > new Date(maxDate.setHours(23, 59, 59, 999))) return;

    if (mode === "date") {
      emitChange(day);
      setIsOpen(false);
      // updateInputText handled by useEffect on value change
    } else if (mode === "datetime") {
      const newDateTime = new Date(day);
      newDateTime.setHours(time.hours);
      newDateTime.setMinutes(time.minutes);
      emitChange(newDateTime);
    } else if (mode === "range") {
      const currentRange = (internalValue || [null, null]) as DateRangeValue; // Use current valid internal val

      // Ensure we have an array
      const safeRange: DateRangeValue = Array.isArray(currentRange)
        ? currentRange
        : [null, null];

      if (rangeStep === 0) {
        emitChange([day, null]);
        setRangeStep(1);
      } else {
        // Pick End
        let start = safeRange[0];
        let end = day;
        if (!start) {
          emitChange([day, null]);
          setRangeStep(1);
          return;
        }
        if (end < start) {
          [start, end] = [end, start];
        }

        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        const startOfDay = new Date(start);
        startOfDay.setHours(0, 0, 0, 0);

        emitChange([startOfDay, endOfDay]);
        setRangeStep(0);
        setIsOpen(false);
      }
    }
  };

  const handleTimeChange = (type: "hours" | "minutes", val: number) => {
    let newH = time.hours;
    let newM = time.minutes;
    if (type === "hours") newH = val;
    else newM = val;

    setTime({ hours: newH, minutes: newM });

    if (internalValue instanceof Date) {
      const newDate = new Date(internalValue);
      newDate.setHours(newH);
      newDate.setMinutes(newM);
      emitChange(newDate);
    }
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + offset,
      1
    );
    setViewDate(newDate);
  };

  const changeYear = (offset: number) => {
    const newDate = new Date(
      viewDate.getFullYear() + offset,
      viewDate.getMonth(),
      1
    );
    setViewDate(newDate);
  };

  const handleYearClick = (year: number) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(year);
    setViewDate(newDate);
    setViewMode("day");
  };

  // --- Render Logic ---

  // Year View Generation
  const currentYear = viewDate.getFullYear();
  // Show 12 years window centered roughly around current selection?
  // Standard is usually a decade view. Let's do 12 for a 3x4 grid.
  const startYear = currentYear - 6;
  const yearsList = Array.from({ length: 12 }, (_, i) => startYear + i);

  // Day View Generation (existing logic)
  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0
  ).getDate();
  const startDay = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1
  ).getDay();
  const prevMonthEnd = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    0
  ).getDate();
  const prevMonthDays = [];
  for (let i = startDay - 1; i >= 0; i--) {
    prevMonthDays.push(
      new Date(
        viewDate.getFullYear(),
        viewDate.getMonth() - 1,
        prevMonthEnd - i
      )
    );
  }
  const currentMonthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDays.push(
      new Date(viewDate.getFullYear(), viewDate.getMonth(), i)
    );
  }
  const remainingCells = 42 - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays = [];
  for (let i = 1; i <= remainingCells; i++) {
    nextMonthDays.push(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, i)
    );
  }
  const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  const hasValue =
    mode === "range"
      ? Array.isArray(internalValue) && (internalValue[0] || internalValue[1])
      : !!internalValue;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
          {label}
        </label>
      )}

      {/* Input Trigger */}
      <div
        ref={containerRef}
        onClick={() => {
          // If clicking container (like the icon), focus input and open
          if (!disabled) {
            setIsOpen(true);
            if (inputRef.current) inputRef.current.focus();
          }
        }}
        className={`
            w-full px-4 py-2.5 pl-11 bg-white border rounded-xl 
            flex items-center text-sm font-medium text-slate-700
            cursor-text transition-all relative group
            ${
              error
                ? "border-red-300 hover:border-red-500 focus-within:ring-red-100"
                : "border-slate-200 hover:border-indigo-300 hover:shadow-sm"
            }
            ${disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : ""}
            ${isOpen ? "border-indigo-500 ring-2 ring-indigo-100" : ""}
          `}
      >
        <CalendarIcon
          className={`w-5 h-5 absolute left-3 transition-colors ${
            isOpen ? "text-indigo-500" : "text-slate-400"
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 w-full"
          placeholder={finalPlaceholder}
          disabled={disabled}
          value={inputText}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsOpen(true);
          }}
        />

        {/* Right Icons: Clear or Chevron */}
        <div className="flex items-center gap-1 pl-2">
          {hasValue && !disabled && (
            <div
              role="button"
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all opacity-0 group-hover:opacity-100"
              title="Xóa"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </div>
          )}
          <ChevronDownIcon
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Portal Dropdown Calendar */}
      {isOpen &&
        coords &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              top: coords.top + 8,
              left: coords.left,
              position: "absolute",
            }}
            className="z-9999 bg-white border border-slate-200 rounded-2xl shadow-xl w-[320px] overflow-hidden animation-fade-in"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (viewMode === "year") changeYear(-12);
                  else changeYear(-1);
                }}
                className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-indigo-600 transition-colors"
                title={viewMode === "year" ? "12 năm trước" : "Năm trước"}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>

              {/* Month/Year Nav or Year Range if in year view */}
              {viewMode === "day" ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      changeMonth(-1);
                    }}
                    className="p-1 hover:bg-slate-200 rounded-md text-slate-500 hover:text-indigo-600 transition-all"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>

                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-slate-700">
                      {MONTH_NAMES[viewDate.getMonth()]}
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewMode("year");
                      }}
                      className="text-xs text-slate-500 font-medium cursor-pointer hover:text-indigo-600 hover:bg-slate-100 px-2 rounded transition-colors"
                    >
                      {viewDate.getFullYear()}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      changeMonth(1);
                    }}
                    className="p-1 hover:bg-slate-200 rounded-md text-slate-500 hover:text-indigo-600 transition-all"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="text-sm font-bold text-slate-700">
                  {yearsList[0]} - {yearsList[yearsList.length - 1]}
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (viewMode === "year") changeYear(12);
                  else changeYear(1);
                }}
                className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-indigo-600 transition-colors"
                title={viewMode === "year" ? "12 năm sau" : "Năm sau"}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body: Day Grid OR Year Grid */}
            {viewMode === "day" ? (
              <>
                {/* Days Header */}
                <div className="grid grid-cols-7 px-2 py-2">
                  {SHORT_DAYS.map((day) => (
                    <div
                      key={day}
                      className="text-center text-[11px] font-bold text-slate-400 uppercase"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 px-2 pb-3 gap-y-1">
                  {allDays.map((day, idx) => {
                    const isCurrentMonth =
                      day.getMonth() === viewDate.getMonth();
                    const isToday = isSameDay(day, new Date());

                    let isSelected = false;
                    let isRangeStart = false;
                    let isRangeEnd = false;
                    let isInRange = false;

                    if (mode === "range") {
                      const [start, end] = (internalValue ||
                        []) as DateRangeValue;
                      if (start && isSameDay(day, start)) isRangeStart = true;
                      if (end && isSameDay(day, end)) isRangeEnd = true;
                      if (start && end && isWithinRange(day, start, end))
                        isInRange = true;

                      if (rangeStep === 1 && start && hoverDate) {
                        if (isWithinRange(day, start, hoverDate))
                          isInRange = true;
                        if (isSameDay(day, hoverDate)) isRangeEnd = true;
                      }
                    } else {
                      if (
                        internalValue &&
                        internalValue instanceof Date &&
                        isSameDay(day, internalValue)
                      )
                        isSelected = true;
                    }

                    let isDisabled = false;
                    if (minDate && day < new Date(minDate.setHours(0, 0, 0, 0)))
                      isDisabled = true;
                    if (
                      maxDate &&
                      day > new Date(maxDate.setHours(23, 59, 59, 999))
                    )
                      isDisabled = true;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoverDate(day)}
                        onClick={() => !isDisabled && handleDayClick(day)}
                        className={`
                                    relative h-9 rounded-lg flex items-center justify-center text-sm cursor-pointer transition-all
                                    ${
                                      !isCurrentMonth
                                        ? "text-slate-300"
                                        : "text-slate-700"
                                    }
                                    ${
                                      isDisabled
                                        ? "opacity-30 cursor-not-allowed"
                                        : "hover:bg-indigo-50"
                                    }
                                    ${
                                      isToday &&
                                      !isSelected &&
                                      !isRangeStart &&
                                      !isRangeEnd
                                        ? "border border-indigo-200 font-semibold text-indigo-600"
                                        : ""
                                    }
                                    ${
                                      isSelected
                                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-200 hover:bg-indigo-600"
                                        : ""
                                    }
                                    ${
                                      isRangeStart
                                        ? "bg-indigo-500 text-white rounded-r-none shadow-none z-10"
                                        : ""
                                    }
                                    ${
                                      isRangeEnd
                                        ? "bg-indigo-500 text-white rounded-l-none shadow-none z-10"
                                        : ""
                                    }
                                    ${
                                      isInRange && !isRangeStart && !isRangeEnd
                                        ? "bg-indigo-100 rounded-none text-indigo-900"
                                        : ""
                                    }
                                    ${
                                      isRangeStart && isRangeEnd
                                        ? "rounded-lg"
                                        : ""
                                    }
                                `}
                      >
                        {day.getDate()}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              // Year Grid View
              <div className="grid grid-cols-4 gap-2 p-4">
                {yearsList.map((y) => {
                  const isCurrentYear = y === new Date().getFullYear();
                  const isSelectedYear = y === viewDate.getFullYear();
                  return (
                    <div
                      key={y}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleYearClick(y);
                      }}
                      className={`
                                    h-10 flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer transition-all
                                    ${
                                      isSelectedYear
                                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-200"
                                        : "hover:bg-indigo-50 text-slate-700"
                                    }
                                    ${
                                      isCurrentYear && !isSelectedYear
                                        ? "border border-indigo-200 text-indigo-600"
                                        : ""
                                    }
                                `}
                    >
                      {y}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Time Picker */}
            {mode === "datetime" && viewMode === "day" && (
              <div className="border-t border-slate-100 p-3 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <ClockIcon className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">Thời gian:</span>
                </div>
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    className="w-8 text-center bg-transparent outline-none font-semibold text-slate-700"
                    value={time.hours.toString().padStart(2, "0")}
                    onChange={(e) =>
                      handleTimeChange("hours", parseInt(e.target.value) || 0)
                    }
                  />
                  <span className="text-slate-400 font-bold">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    className="w-8 text-center bg-transparent outline-none font-semibold text-slate-700"
                    value={time.minutes.toString().padStart(2, "0")}
                    onChange={(e) =>
                      handleTimeChange("minutes", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            )}
          </div>,
          document.body
        )}

      {error && (
        <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
          <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
};

export default DatePicker;
