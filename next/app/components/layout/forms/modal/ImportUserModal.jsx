// /app/components/layout/forms/modal/ImportUserModal.jsx
'use client';

import React from 'react';
import Button from '@/app/components/ui/Button';
import { UploadIcon } from '@primer/octicons-react';

export default function ImportUserModal() {

  const handleExportSampleFile = () => {
    const link = document.createElement('a');
    link.href = '/assets/res/sample.csv';
    link.download = 'sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <Button variant="default" onClick={handleExportSampleFile} type="button">
        <UploadIcon size={24} />
      </Button>
    </div>
  );
}