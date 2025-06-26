'use client';

import React from 'react';
import Button from '@/app/components/ui/Button';
import { TrashIcon, PencilIcon } from '@primer/octicons-react';

const DefaultChip = ({ value }) => <span>{value}</span>;

export default function ListBoxItem({
  item,
  renderChip = DefaultChip,
  onRemove,
  onEdit,
  editIcon: EditIcon = PencilIcon
}) {
  const Chip = renderChip;
  return (
    <div className="flex items-center px-2 py-1">
      <div className="basis-[80%]">
        <Chip {...item} />
      </div>

      <div className="basis-[20%] flex space-x-2">
        {onEdit && (
          <Button type="button" onClick={onEdit} variant="action_icon">
            <EditIcon size={16} />
          </Button>
        )}
        {onRemove && (
          <Button type="button" onClick={onRemove} variant="action_icon_warn">
            <TrashIcon size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
