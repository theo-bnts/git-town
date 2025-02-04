import React from 'react';
import { TriangleUpIcon, TriangleDownIcon } from '@primer/octicons-react';

const SortButton = ({ isActive, direction }) => {
  return (
    <span className="inline-flex items-center ml-1 cursor-pointer">
      {isActive ? (
        direction === 'asc' ? (
          <TriangleUpIcon size={20} />
        ) : (
          <TriangleDownIcon size={20} />
        )
      ) : (
        <TriangleDownIcon size={20} />
      )}
    </span>
  );
};

export default SortButton;