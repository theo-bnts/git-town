// app/components/ui/Card.jsx
import React from 'react';

import { cardStyles } from '@/app/styles/tailwindStyles';

const Card = ({ variant, children }) => {
  return <div className={cardStyles[variant]}>{children}</div>;
};

export default Card;
