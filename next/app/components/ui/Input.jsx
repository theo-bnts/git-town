// app/components/ui/Input.jsx
import React, { useState } from 'react';
import { inputStyles } from '../../styles/tailwindStyles';

const Input = ({ variant, placeholder, value: propValue, onChange, disabled, ...props }) => {
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

export default Input;