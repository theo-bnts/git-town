'use client';

import React from 'react';
import Card from '@/app/components/ui/Card';
import { textStyles } from '@/app/styles/tailwindStyles';

export default function EmptyTableCard ({message = 'Aucune donnée disponible'}) {
  return (
    <div className="my-6">
      <Card variant="empty">
        <p className={textStyles.subtle}>{message}</p>
      </Card>
    </div>
  );
}
