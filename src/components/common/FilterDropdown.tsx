// src/components/common/FilterDropdown.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconFilter } from "./Icons/Index";

interface FilterDropdownProps {
  value: "All" | "Active" | "InActive";
  onChange: (value: "All" | "Active" | "InActive") => void;
  className?: string;
  disabled?: boolean;
}

export const FilterDropdown = ({
  value,
  onChange,
  className = "",
  disabled = false,
}: FilterDropdownProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: "All" as const, label: t("common.all") || "All" },
    { value: "Active" as const, label: t("common.active") || "Active" },
    { value: "InActive" as const, label: t("common.inactive") || "Inactive" },
  ];

  const handleOptionClick = (selectedValue: "All" | "Active" | "InActive") => {
    try {
      onChange(selectedValue);
      setIsOpen(false);
    } catch (error) {
      console.error("Error changing filter:", error);
    }
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#91C73D]/20 focus:border-[#91C73D] transition-colors duration-200 cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <IconFilter className="w-4 h-4" />
        <span>{t("common.Filters") || "Filters"}</span>
      </button>
      {isOpen && !disabled && (
        <>
          <div
            className="fixed inset-0 z-10 cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionClick(option.value)}
                className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors cursor-pointer ${
                  value === option.value
                    ? "bg-[#91C73D]/10 text-[#91C73D] font-medium"
                    : "text-gray-700"
                } first:rounded-t-lg last:rounded-b-lg`}
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
