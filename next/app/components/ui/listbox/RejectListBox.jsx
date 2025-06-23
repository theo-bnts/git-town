// /app/components/ui/listbox/RejectListBox.jsx
'use client';

import React from 'react';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { DownloadIcon, TrashIcon } from '@primer/octicons-react';
import { listboxStyles } from '@/app/styles/tailwindStyles';

export default function RejectListBox({ files = [], onDownload, onDelete }) {
  return (
    <div className={`flex flex-col ${listboxStyles.default}`}>
      <div className="max-h-[160px] overflow-y-auto border rounded-[12.5px]">
        {files.length === 0 ? (
          <Card variant="empty_list">
            <p className="text-center text-gray-600">Aucun rejet disponible.</p>
          </Card>
        ) : (
          files.map((name) => (
            <div key={name} className="flex items-center justify-between px-4 py-2">
              <span className="truncate">{name}</span>
              <div className="flex justify-center space-x-2">
                <Button variant="action_icon" onClick={() => onDownload(name)}>
                  <DownloadIcon size={16} />
                </Button>
                <Button variant="action_icon_warn" onClick={() => onDelete(name)}>
                  <TrashIcon size={16} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
