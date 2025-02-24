// app/components/ui/Input.jsx

'use client';

import React, { useState } from 'react';

import { inputStyles } from '@/app/styles/tailwindStyles';

export default function Input({ variant, placeholder, value: propValue, onChange, disabled, ...props }) {
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
    <input
      className={`${inputStyles[variant]} w-full`}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      {...props}
    />
  );
};
