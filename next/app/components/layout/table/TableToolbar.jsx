'use client';

import React from 'react';
import Button from '@/app/components/ui/Button';

import { PlusIcon } from '@primer/octicons-react';

export default function TableToolbar({ onAdd }) {
  return (
    <div className="flex items-center justify-start pb-8">
      <Button variant="default_sq" onClick={onAdd}>
        <PlusIcon size={24} className="text-white"/>
      </Button>
    </div>
  );
}
