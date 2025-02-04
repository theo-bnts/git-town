// app/components/ui/Text.jsx
import React from 'react';

import { textStyles } from '../../styles/tailwindStyles';

const Text = ({ variant, children }) => {
  return <p className={textStyles[variant]}>{children}</p>;
};

export default Text;
