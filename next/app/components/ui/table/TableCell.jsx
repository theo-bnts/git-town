import React from 'react';
import ActionButton from './ActionButton';

const TableCell = ({ value }) => {
  // Classes communes pour <td>
  const tdClasses = "py-2 px-4 border-b border-gray-200";

  if (Array.isArray(value)) {
    const isStringArray = value.every(item => typeof item === 'string');

    if (isStringArray) {
      return (
        <td className={tdClasses}>
          <ul className="list-disc list-inside">
            {value.map((text, index) => (
              <li key={index}>{text}</li>
            ))}
          </ul>
        </td>
      );
    } else {
      return (
        <td className={tdClasses}>
          {value.map((action, index) => (
            <ActionButton key={index} icon={action.icon} onClick={action.onClick} />
          ))}
        </td>
      );
    }
  }

  return <td className={tdClasses}>{value}</td>;
};

export default TableCell;