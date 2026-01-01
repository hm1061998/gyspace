import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-bold text-slate-700 ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2 rounded-xl border bg-white
            ${
              error
                ? "border-red-500"
                : "border-slate-200 hover:border-slate-300"
            }
            focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500
            disabled:bg-slate-50 disabled:text-slate-400
            transition-all duration-200
            placeholder:text-slate-400 text-slate-700
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-[10px] font-bold ml-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
