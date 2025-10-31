// src/components/common/CustomCheckbox.tsx
import { IconCheckboxEmpty, IconCheckboxChecked } from "./Icons/Index";

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  labelClassName?: string;
}

export const CustomCheckbox = ({ 
  checked, 
  onChange, 
  label, 
  className = "",
  labelClassName = ""
}: CustomCheckboxProps) => {
  return (
    <label className={`flex items-center cursor-pointer group ${className}`}>
      <input 
        type="checkbox" 
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="hidden"
      />
      <div className="flex items-center justify-center">
        {checked ? (
          <IconCheckboxChecked className="w-4 h-4" />
        ) : (
          <IconCheckboxEmpty className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
        )}
      </div>
      {label && (
        <span className={`ml-2 text-sm text-gray-700 ${labelClassName}`}>
          {label}
        </span>
      )}
    </label>
  );
};