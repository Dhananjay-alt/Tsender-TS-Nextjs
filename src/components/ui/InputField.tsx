import React from 'react';

interface InputFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  type?: string;
  large?: boolean;
  onChange: (value: string) => void;
}

export default function InputField({
  label,
  placeholder = '',
  value,
  type = 'text',
  large = false,
  onChange,
}: InputFieldProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange(e.target.value);
  };

  const baseClasses =
    'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {large ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          className={`${baseClasses} min-h-32 resize-y`}
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          className={baseClasses}
        />
      )}
    </div>
  );
}