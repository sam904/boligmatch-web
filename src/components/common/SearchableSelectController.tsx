// src/components/common/SearchableSelectController.tsx
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import Select, { type StylesConfig } from 'react-select';

interface Option {
  value: number | string;
  label: string;
}

interface SearchableSelectControllerProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  isClearable?: boolean;
  required?: boolean;
  onChange?: (value: number | string) => void; // Add this line
}

export default function SearchableSelectController<T extends FieldValues>({
  name,
  control,
  label,
  error,
  options,
  placeholder = 'Select...',
  disabled = false,
  isClearable = false,
  required = false,
  onChange, // Add this line
}: SearchableSelectControllerProps<T>) {
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
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af',
      fontSize: '0.875rem',
    }),
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
    
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          // Find the selected option based on field value
          const selectedOption = options.find(option => 
            option.value === field.value
          );

          return (
            <Select
              {...field}
              options={options}
              value={selectedOption}
              onChange={(selected) => {
                const newValue = selected?.value || 0;
                // Update the form field with the selected value
                field.onChange(newValue);
                // Call the custom onChange callback if provided
                onChange?.(newValue);
              }}
              onBlur={field.onBlur}
              placeholder={placeholder}
              styles={customStyles}
              isDisabled={disabled}
              isClearable={isClearable}
              isSearchable={true}
              noOptionsMessage={({ inputValue }) =>
                inputValue ? 'No options found' : 'No options available'
              }
              // Add this to ensure proper handling of empty value
              isOptionSelected={(option) => option.value === field.value}
            />
          );
        }}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}