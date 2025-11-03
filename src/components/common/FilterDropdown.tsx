// src/components/common/FilterDropdown.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconFilter } from "./Icons/Index";

interface FilterDropdownProps {
  value: string;
  onChange: (value: "all" | "active" | "inactive") => void;
  className?: string;
}

export const FilterDropdown = ({
  value,
  onChange,
  className = "",
}: FilterDropdownProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: "all", label: t("common.all") || "All" },
    { value: "active", label: t("common.active") || "Active" },
    { value: "inactive", label: t("common.inactive") || "Inactive" },
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Filter Button - Shows icon + "Filters" text */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#91C73D]/20 focus:border-[#91C73D] transition-colors duration-200"
      >
        <IconFilter className="w-4 h-4" />
        <span>Filters</span>
        {/* Optional: Show current selection */}
        {/* <span className="text-gray-400">• {getCurrentLabel()}</span> */}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Options */}
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value as "all" | "active" | "inactive");
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${
                  value === option.value
                    ? "bg-[#91C73D]/10 text-[#91C73D] font-medium"
                    : "text-gray-700"
                } last:rounded-b-lg`}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {value === option.value && (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
