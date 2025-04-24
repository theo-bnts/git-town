'use client';

import React from 'react';
import { DashIcon, PencilIcon } from '@primer/octicons-react';
import Button from '@/app/components/ui/Button';

export default function MilestoneChip({ option, onRemove, onEdit }) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <span>{option.value}</span>
      <div className="space-x-1">
        <Button onClick={onEdit} variant="action_sq">
          <PencilIcon size={16} />
        </Button>
        <Button onClick={onRemove} variant="action_sq_warn">
          <DashIcon size={16} />
        </Button>
      </div>
    </div>
  );
}
