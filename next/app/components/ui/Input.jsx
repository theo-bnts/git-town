'use client';
// app/components/ui/Input.jsx
import React, { useState } from "react";
import { inputStyles } from "../../styles/tailwindStyles";

const Input = ({ variant, placeholder, value: propValue, onChange, disabled, ...props }) => {
  const [localValue, setLocalValue] = useState("");
  const value = propValue !== undefined ? propValue : localValue;

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    } else {
      setLocalValue(e.target.value);
    }
  };

  return (
    <div className="relative">
      <input
        className={`${inputStyles[variant]} w-full`}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        {...props}
      />
      {!value && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none select-none whitespace-nowrap">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default Input;
