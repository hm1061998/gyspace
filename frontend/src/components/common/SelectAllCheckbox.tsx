import React, { useEffect, useRef } from "react";

interface SelectAllCheckboxProps {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
  label?: string;
  subLabel?: string;
  className?: string;
}

const SelectAllCheckbox: React.FC<SelectAllCheckboxProps> = ({
  checked,
  indeterminate,
  onChange,
  label = "Chọn tất cả",
  subLabel,
  className = "",
}) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div
      className={`flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm ${className}`}
    >
      <input
        type="checkbox"
        ref={checkboxRef}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-100 cursor-pointer"
      />
      <label
        className="text-xs sm:text-sm font-bold text-slate-600 cursor-pointer select-none"
        onClick={onChange}
      >
        {label}{" "}
        {subLabel && (
          <span className="text-slate-400 font-normal">{subLabel}</span>
        )}
      </label>
    </div>
  );
};

export default SelectAllCheckbox;
