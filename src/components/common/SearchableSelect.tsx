// src/components/common/SearchableSelect.tsx
import Select, { type StylesConfig } from 'react-select';

interface Option {
  value: number | string;
  label: string;
}

interface SearchableSelectProps {
  label?: string;
  error?: string;
  options: Option[];
  value?: number | string;
  onChange?: (value: number | string) => void;
  placeholder?: string;
  disabled?: boolean;
  isClearable?: boolean;
}

export default function SearchableSelect({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  isClearable = false,
}: SearchableSelectProps) {
  const customStyles: StylesConfig<Option, false> = {
    control: (base, state) => ({
      ...base,
      borderColor: error ? '#f43f5e' : state.isFocused ? '#91C73D' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #91C73D, 0 1px 2px 0 rgb(0 0 0 / 0.05)' : '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      '&:hover': {
        borderColor: error ? '#f43f5e' : '#91C73D',
      },
      minHeight: '44px',
      backgroundColor: disabled ? '#f8fafc' : 'white',
      borderRadius: '8px',
      fontSize: '14px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#91C73D'
        : state.isFocused
        ? '#91C73D20'
        : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      fontSize: '14px',
      '&:active': {
        backgroundColor: '#91C73D',
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      zIndex: 9999,
    }),
    placeholder: (base) => ({
      ...base,
      color: '#94a3b8',
    }),
  };

  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <Select
        options={options}
        value={selectedOption}
        onChange={(newValue) => {
          if (onChange && newValue) {
            onChange(newValue.value);
          }
        }}
        placeholder={placeholder}
        styles={customStyles}
        isDisabled={disabled}
        isClearable={isClearable}
        isSearchable={true}
      />
      {error && (
        <p className="mt-2 text-sm text-rose-600">{error}</p>
      )}
    </div>
  );
}