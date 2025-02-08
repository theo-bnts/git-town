import React from 'react';
import ActionButton from '../../ui/ActionButton';

const TableCell = ({ value, columnKey }) => {
  const baseClasses = "py-4 px-6 border-b border-gray-200";
  const contentClasses = "min-h-[32px] flex items-center text-left";
  const isActionColumn = columnKey === 'actions';
  const tdClasses = `${baseClasses} ${isActionColumn ? 'whitespace-nowrap' : 'min-w-[150px]'}`;

  if (Array.isArray(value)) {
    const isTextArray = value.every(item => typeof item === 'string');

    if (isTextArray) {
      return (
        <td className={`${baseClasses} ${isActionColumn ? 'whitespace-nowrap' : 'min-w-[150px]'}`}>
          <div className={`${contentClasses} ${isActionColumn ? 'whitespace-nowrap' : ''}`}>
            <ul className="list-none">
              {value.map((text, index) => (
                <li key={index}>{text}</li>
              ))}
            </ul>
          </div>
        </td>
      );
    } else {
      return (
        <td className={`${baseClasses} whitespace-nowrap`}>
          <div className={contentClasses}>
            {value.map((action, index) => (
              <ActionButton key={index} icon={action.icon} onClick={action.onClick} />
            ))}
          </div>
        </td>
      );
    }
  }

  if (columnKey === 'email') {
    return (
      <td className={tdClasses}>
        <div className={contentClasses}>
          <a
            href={`mailto:${value}`}
            className="underline underline-offset-4 decoration-dotted decoration-gray-400 transition-transform duration-200 hover:scale-105 hover:text-[var(--accent-color)]"
          >
            {value}
          </a>
        </div>
      </td>
    );
  }

  return (
    <td className={tdClasses}>
      <div className={contentClasses}>
        {value}
      </div>
    </td>
  );
};

export default TableCell;
