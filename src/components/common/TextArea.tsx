// src/components/common/TextArea.tsx
import React from "react";
import clsx from "clsx";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  error?: string;
}

export default function TextArea({
  label,
  error,
  className = "",
  ...props
}: TextAreaProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
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
      {error && <p className="text-rose-500 text-sm">{error}</p>}
    </div>
  );
}
