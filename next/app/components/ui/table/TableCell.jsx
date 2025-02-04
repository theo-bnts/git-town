import React from 'react';
import ActionButton from './ActionButton';

const TableCell = ({ value }) => {
    if (Array.isArray(value)) {
        // Vérifier si c'est un tableau de chaînes ou un tableau d'actions
        const isStringArray = value.every(item => typeof item === 'string');

        if (isStringArray) {
            return (
                <td>
                    <ul>
                        {value.map((text, index) => (
                            <li key={index}>{text}</li>
                        ))}
                    </ul>
                </td>
            );
        } else {
            return (
                <td>
                    {value.map((action, index) => (
                        <ActionButton key={index} icon={action.icon} onClick={action.onClick} />
                    ))}
                </td>
            );
        }
    }

    return <td>{value}</td>;
};

export default TableCell;