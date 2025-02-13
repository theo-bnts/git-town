// app/components/ui/LoadingSpinner.jsx
import React from 'react';

import { spinnerStyles } from '../../styles/tailwindStyles';

export default function LoadingSpinner() {
  return (
    <div className={spinnerStyles.default}></div>
  );
}
