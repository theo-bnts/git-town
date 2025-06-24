'use client';

import React from 'react';
import { AlertIcon, SyncIcon } from '@primer/octicons-react';
import Button from '@/app/components/ui/Button';
import { textStyles } from '@/app/styles/tailwindStyles';

export default function PartialDataAlert({ onRetry }) {
  return (
    <div className="col-span-1 xl:col-span-2 bg-yellow-50 
    border-l-4 border-yellow-400 p-4 flex justify-between items-center">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertIcon className="text-yellow-400" size={20} />
        </div>
        <div className="ml-3">
          <p className={textStyles.warning}>
            Les données sont incomplètes. Certaines statistiques par utilisateur peuvent ne pas s'afficher.
          </p>
        </div>
      </div>
      <Button 
        onClick={onRetry}
        variant="action_sq"
      >
        <SyncIcon size={16} />
      </Button>
    </div>
  );
}
