import React from 'react';
import ActionButton from './ActionButton';

const TableCell = ({ value }) => {
    if (Array.isArray(value)) {
        return (
            <td>
                {value.map((action, index) => (
                    <ActionButton key={index} icon={action.icon} onClick={action.onClick} />
                ))}
            </td>
        );
    }
    return <td>{value}</td>;
};

export default TableCell;