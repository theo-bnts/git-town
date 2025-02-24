// app/components/ui/Button.jsx

'use client';

import React from 'react';

import { buttonStyles, spinnerStyles } from '@/app/styles/tailwindStyles';

export default function Button({ variant, loading, children, ...props }) {
  const appliedStyle = loading
    ? `${buttonStyles[variant]} opacity-70 cursor-not-allowed relative`
    : buttonStyles[variant];

  return (
    <button className={appliedStyle} disabled={loading || props.disabled} {...props}>
      {children}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={spinnerStyles.default}/>
        </div>
      )}
    </button>
  );
};
