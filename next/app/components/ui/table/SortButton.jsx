import React from 'react';
import { TriangleUpIcon, TriangleDownIcon } from '@primer/octicons-react';

const SortButton = ({ isActive, direction }) => {
  return (
    <span className="inline-flex items-center ml-1 cursor-pointer">
      {isActive ? (
        direction === 'asc' ? (
          <TriangleUpIcon size={22} />
        ) : (
          <TriangleDownIcon size={22}/>
        )
      ) : (
        <TriangleDownIcon size={22} />
      )}
    </span>
  );
};

export default SortButton;