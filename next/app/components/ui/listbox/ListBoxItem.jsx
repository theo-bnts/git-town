// app/components/ui/listbox/ListBoxItem.jsx
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
    <div className="flex items-center justify-between px-4 py-2">
      <Chip {...item} />
      <div className="space-x-2">
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
