import React from "react";
import { CalendarIcon } from "./icons";

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, className = "", placeholder, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            type="date"
            ref={ref}
            placeholder={placeholder}
            className={`w-full px-4 py-2.5 pl-11 bg-white border rounded-xl outline-none transition-all cursor-pointer text-slate-700 font-medium text-sm
              hover:border-indigo-300 hover:shadow-sm
              ${
                error
                  ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              }
              ${className}
            `}
            {...props}
          />
          <CalendarIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />

          {/* Placeholder text when no date is selected */}
          {!props.value && placeholder && (
            <span className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
              {placeholder}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
            <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
