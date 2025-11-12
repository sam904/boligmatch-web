// src/components/common/Input.tsx
import React from "react";
import clsx from "clsx";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: React.ReactNode;
  error?: string;
};

export default function Input({ label, error, className, ...props }: Props) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={clsx(
          "w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900",
          "placeholder:text-gray-400",
          "focus:border-[#91C73D] focus:ring-2 focus:ring-[#91C73D]/20 focus:outline-none",
          "transition-colors duration-200",
          error &&
            "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
