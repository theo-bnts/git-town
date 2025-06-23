'use client';

import React from 'react';

import { textStyles } from '@/app/styles/tailwindStyles';
import Button from '@/app/components/ui/Button';

export default function TableCell({ value, columnKey }) {
  const baseClasses = "py-4 px-6 border-b border-gray-200";
  const contentClasses = "min-h-[32px] flex items-center text-left";
  const isActionColumn = columnKey === 'actions';
  const tdClasses = `${baseClasses} ${isActionColumn ? 'whitespace-nowrap' : 'min-w-[150px]'}`;
  const isArray = Array.isArray(value);
  const isTextArray = isArray && value.every(item => typeof item === 'string');

  return (
    <>
      <td
        className={
          isArray
            ? isTextArray
              ? `${baseClasses} ${isActionColumn ? 'whitespace-nowrap' : 'min-w-[150px]'}`
              : `${baseClasses} whitespace-nowrap`
            : tdClasses
        }
      >
        <div
          className={
            `${contentClasses} ${
              isArray && isTextArray && isActionColumn ? 'whitespace-nowrap' : ''
            }`
          }
        >
          {isArray ? (
            isTextArray ? (
              <ul className="list-none">
                {value.map((text, index) => (
                  <li key={index}>{text}</li>
                ))}
              </ul>
            ) : (
              value.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant}
                  disabled={action.disabled}
                >
                  {action.icon}
                </Button>
              ))
            )
          ) : columnKey === 'email' ? (
            <a href={`mailto:${value}`} className={textStyles.url}>
              {value}
            </a>
          ) : (
            value
          )}
        </div>
      </td>
    </>
  );
}
