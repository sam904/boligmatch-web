import { forwardRef, useState } from 'react';
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

const SearchableSelect = forwardRef<any, SearchableSelectProps>(
  ({ label, error, options, value, onChange, placeholder = 'Select...', disabled = false, isClearable = false }, ref) => {
    const [selectedOption, setSelectedOption] = useState<Option | null>(
      options.find(opt => opt.value === value) || null
    );

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

    const handleChange = (newValue: Option | null) => {
      setSelectedOption(newValue);
      if (onChange && newValue) {
        onChange(newValue.value);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <Select
          ref={ref}
          options={options}
          value={selectedOption}
          onChange={handleChange}
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
);

SearchableSelect.displayName = 'SearchableSelect';

export default SearchableSelect;
