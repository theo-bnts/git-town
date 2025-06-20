'use client';

import React from 'react';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { XIcon } from '@primer/octicons-react';

export default function ModalBase({ isOpen, title, onClose, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--popup-color)] flex items-center justify-center z-50">
      <div className="w-[300px]">
        <Card variant="default" className="relative p-6">
          <header className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{title}</h3>
            <Button variant="action_icon_warn" onClick={onClose}>
              <XIcon size={24} />
            </Button>
          </header>
          <div className="space-y-4">{children}</div>
          {footer && <div className="pt-4">{footer}</div>}
        </Card>
      </div>
    </div>
  );
}
