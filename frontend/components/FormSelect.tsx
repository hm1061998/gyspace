import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "./icons";

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  label?: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

const FormSelectCustom: React.FC<FormSelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = "Chọn...",
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
      )}

      <div className="relative" ref={wrapperRef}>
        {/* Trigger */}
        <button
          type="button"
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between
            px-4 py-2 rounded-xl border bg-white
            ${
              error
                ? "border-red-500"
                : "border-slate-200 hover:border-slate-300"
            }
            focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            transition-all duration-200
          `}
        >
          <span className={selected ? "text-slate-700" : "text-slate-400"}>
            {selected?.label || placeholder}
          </span>
          <ChevronDownIcon
            className={`w-5 h-5 transition-transform ml-2 ${
              open ? "rotate-180" : ""
            } ${disabled ? "text-slate-300" : ""}`}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <ul
            className="
          absolute z-50 mt-2 w-full
          max-h-60 overflow-auto
          rounded-xl border border-slate-200
          bg-white shadow-lg
        "
          >
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange?.(opt.value);
                  setOpen(false);
                }}
                className="
              px-4 py-2 text-sm cursor-pointer
              hover:bg-red-50 hover:text-red-600
            "
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-[10px] font-bold ml-1">{error}</p>
      )}
    </div>
  );
};

export default FormSelectCustom;
