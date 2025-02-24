'use client';

import React from 'react';
import { TriangleUpIcon, TriangleDownIcon } from '@primer/octicons-react';

export default function SortButton({ isActive, direction }) {
  return (
    <span className="inline-flex items-center ml-1 cursor-pointer">
      {isActive ? (
        direction === 'asc' ? (
          <TriangleUpIcon size={25} />
        ) : (
          <TriangleDownIcon size={25}/>
        )
      ) : (
        <TriangleDownIcon size={25} />
      )}
    </span>
  );
};
