'use client';

import React from 'react';

import { cardStyles } from '@/app/styles/tailwindStyles';

export default function Card({ variant, children }) {
  return <div className={cardStyles[variant]}>{children}</div>;
};
