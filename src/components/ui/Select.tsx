import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value?: string;
  name?: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function Select({
  label,
  value,
  name,
  options,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  onChange
}: SelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        required={required}
        disabled={disabled}
        onChange={onChange}
        className="input w-full px-4 py-3 rounded-xl"
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}