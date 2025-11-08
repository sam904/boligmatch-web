// src/components/common/Select.tsx
import { useState, useRef, useEffect } from "react";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Select Box - Smaller height and width */}
      <button
        type="button"
        className={`flex items-center justify-between w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-white transition-colors ${
          disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "text-gray-900 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#165933] focus:border-[#165933]"
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span
          className={`truncate ${
            selectedOption ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-3 h-3 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          } ${disabled ? "text-gray-400" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu - Smaller options */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
          <div className="py-0.5">
            {options.length > 0 ? (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full text-left px-2 py-1.5 text-xs cursor-pointer transition-colors truncate ${
                    option.value === value
                      ? "bg-[#165933] text-white"
                      : "text-gray-900 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-2 py-1.5 text-xs text-gray-500 text-center">
                No options
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
