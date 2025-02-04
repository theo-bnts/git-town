'use client'
// app/components/ui/Input.jsx
import React, { useState } from 'react';

import { inputStyles } from '../../styles/tailwindStyles';

const Input = ({ variant, placeholder }) => {
  const [value, setValue] = useState('');

  return (
    <div className="relative">
      <input
        className={inputStyles[variant] + " w-full"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {!value && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default Input;
