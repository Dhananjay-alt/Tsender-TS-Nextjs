/*import React from 'react';

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
}*/

"use client"

export interface InputFormProps {
    label: string
    placeholder: string
    value?: string
    type?: string
    large?: boolean
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function InputForm({ label, placeholder, value, type, large, onChange }: InputFormProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-zinc-600 font-medium text-sm">{label}</label>
            {large ? (
                <textarea
                    className={`bg-white py-2 px-3 border border-zinc-300 placeholder:text-zinc-500 text-zinc-900 shadow-xs rounded-lg focus:ring-[4px] focus:ring-zinc-400/15 focus:outline-none h-24 align-text-top`}
                    placeholder={placeholder}
                    value={value || ''}
                    onChange={onChange}
                    suppressHydrationWarning  // Add this line
                />
            ) : (
                <input
                    className={`bg-white py-2 px-3 border border-zinc-300 placeholder:text-zinc-500 text-zinc-900 shadow-xs rounded-lg focus:ring-[4px] focus:ring-zinc-400/15 focus:outline-none`}
                    type={type}
                    placeholder={placeholder}
                    value={value || ''}
                    onChange={onChange}
                    suppressHydrationWarning  // Add this line
                />
            )}
        </div>
    )
}