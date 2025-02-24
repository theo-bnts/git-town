// app/components/ui/LoadingSpinner.jsx
import React from 'react';

import { spinnerStyles } from '@/app/styles/tailwindStyles';

export default function LoadingSpinner() {
  return (
    <div className={spinnerStyles.default}></div>
  );
}
