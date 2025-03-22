'use client';

import React, { useRef, useState } from 'react';

import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';

import { UploadIcon } from '@primer/octicons-react';
import { XIcon } from '@primer/octicons-react';
import { textStyles } from '@/app/styles/tailwindStyles';

export default function ImportUserModal({ isOpen, onClose, onCreate }) {
  const fileInputRef = useRef(null);
  const [importedFile, setImportedFile] = useState(null);
  const [validated, setValidated] = useState(false);

  const handleExportSampleFile = () => {
    const link = document.createElement('a');
    link.href = '/assets/res/sample.csv';
    link.download = 'sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFile = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setImportedFile(file);
        setValidated(false);
      } else {
        alert('Veuillez sélectionner un fichier CSV.');
      }
    }
  };

  const handleRemoveFile = () => {
    setImportedFile(null);
    setValidated(false);
    fileInputRef.current.value = '';
  };

  const handleValidate = async () => {
    if (!importedFile) return;

    const formData = new FormData();
    formData.append('file', importedFile);

    try {
      const res = await fetch('/api/csv/post', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setValidated(true);
        alert('Fichier validé et stocké avec succès dans public/imports');
      } else {
        alert("Erreur lors du stockage du fichier");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors du stockage du fichier");
    }

    useEffect(() => {
      if (!isOpen) {
        setFormData(initialFormState);
        setErrors({});
      }
    }, [isOpen]);
  };

  return (
    <div className="fixed inset-0 bg-[var(--popup-color)] flex items-center justify-center z-50">
      <Card variant="default" className="relative w-[400px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Import</h2>
          <Button variant="action_sq" onClick={onClose}>
            <XIcon size={24}/>
          </Button>
        </div>

        <p className={textStyles.bold}>Ficher exemple</p>
        <div className=" pt-2">
          <Button variant="default" onClick={handleExportSampleFile}>
            <p className={textStyles.defaultWhite}>Enregistrer</p>
          </Button>
        </div>

        <form>
        <p className={textStyles.bold}>Fichier à importer</p>
        <div className="pt-2">
          <Button variant="default" onClick={handleFileChange}>
            <p className={textStyles.defaultWhite}>Importer</p>
          </Button>
        </div>
        <Button variant="default" onClick={handleValidate}>
          <p className={textStyles.defaultWhite}>Traiter</p>
        </Button>
        </form>
      </Card>
    </div>
  );
}
