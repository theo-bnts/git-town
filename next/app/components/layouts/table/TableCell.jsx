import React from 'react';
import ActionButton from '../../ui/ActionButton';

const TableCell = ({ value, columnKey }) => {
  // On utilise ici le même padding horizontal que dans le header (px-6)
  const baseClasses = "py-4 px-6 border-b border-gray-200";
  // On ajoute également text-left pour forcer l'alignement à gauche
  const contentClasses = "min-h-[32px] flex items-center text-left";
  // Si c'est une cellule d'email, on ajoute le soulignement en pointillé gris
  const emailDecoration =
    columnKey === 'email'
      ? "underline underline-offset-4 decoration-dotted decoration-gray-400"
      : "";

  // Si la valeur est un tableau...
  if (Array.isArray(value)) {
    const isTextArray = value.every((item) => typeof item === 'string');
    if (isTextArray) {
      return (
        <td className={`${baseClasses} ${columnKey !== 'actions' ? 'min-w-[150px]' : ''}`}>
          <div className={`${contentClasses} ${columnKey !== 'actions' ? '' : 'whitespace-nowrap'}`}>
            {/* On supprime les puces en utilisant list-none */}
            <ul className="list-none">
              {value.map((text, index) => (
                <li key={index}>{text}</li>
              ))}
            </ul>
          </div>
        </td>
      );
    } else {
      // Pour un tableau d'actions (boutons)
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
  
  // Pour une valeur textuelle simple
  return (
    <td className={`${baseClasses} ${columnKey !== 'actions' ? 'min-w-[150px]' : 'whitespace-nowrap'}`}>
      <div className={contentClasses}>
        {columnKey === 'email' ? (
          <a
            href={`mailto:${value}`}
            className={`${emailDecoration} transition-transform duration-200 hover:scale-105 hover:text-[var(--accent-color)]`}
          >
            {value}
          </a>
        ) : (
          value
        )}
      </div>
    </td>
  );
};

export default TableCell;