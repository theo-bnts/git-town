'use client';

import React, { useState } from 'react';
import { inputStyles } from '@/app/styles/tailwindStyles';

export default function TextArea({
  variant = 'default',
  placeholder,
  value: propValue,
  onChange,
  disabled = false,
  rows = 4,
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
    <textarea
      className={`${inputStyles[variant]} w-full resize-none`}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      rows={rows}
      {...props}
    />
  );
}
