// app/components/ui/Input.jsx

'use client';

import React, { useState } from 'react';
import { inputStyles } from '@/app/styles/tailwindStyles';

export default function Input({ 
  variant = 'default',
  placeholder, 
  value: propValue, 
  onChange, 
  disabled = false,
  leftIcon,
  ...props 
}) {
  const [localValue, setLocalValue] = useState('');
  const value = propValue !== undefined ? propValue : localValue;

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    } else {
      setLocalValue(e.target.value);
    }
  };

  return (
    <div className="relative w-full">
      {leftIcon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {leftIcon}
        </span>
      )}

      <input
        className={`
          ${inputStyles[variant]} 
          w-full
          ${leftIcon ? 'pl-10' : ''}
        `}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
}
