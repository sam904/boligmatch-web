import Select, { type StylesConfig } from 'react-select';

interface Option {
  value: number | string;
  label: string;
}

interface SearchableSelectWithCallbackProps {
  label?: string;
  error?: string;
  options: Option[];
  value?: number | string;
  onChange: (value: number | string) => void;
  placeholder?: string;
  disabled?: boolean;
  isClearable?: boolean;
}

export default function SearchableSelectWithCallback({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  isClearable = false,
}: SearchableSelectWithCallbackProps) {
  const customStyles: StylesConfig<Option, false> = {
    control: (base, state) => ({
      ...base,
      borderColor: error ? '#ef4444' : state.isFocused ? '#043428' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #043428' : 'none',
      '&:hover': {
        borderColor: error ? '#ef4444' : '#043428',
      },
      minHeight: '38px',
      backgroundColor: disabled ? '#f3f4f6' : 'white',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#043428'
        : state.isFocused
        ? '#91C73D20'
        : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      '&:active': {
        backgroundColor: '#043428',
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <Select
        options={options}
        value={selectedOption}
        onChange={(newValue) => {
          if (newValue) {
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
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
