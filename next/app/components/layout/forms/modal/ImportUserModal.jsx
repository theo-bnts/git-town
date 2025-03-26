// /app/components/layout/forms/modal/ImportUserModal.jsx
'use client';

import React, { useRef, useState, useEffect } from 'react';

import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { DashIcon, XIcon } from '@primer/octicons-react';
import { textStyles, listboxStyles } from '@/app/styles/tailwindStyles';

export default function ImportUserModal({ isOpen, onClose, onCreate }) {
  const fileInputRef = useRef(null);
  const [importedFile, setImportedFile] = useState(null);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setImportedFile(null);
      setValidated(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  const handleExportSampleFile = () => {
    const link = document.createElement('a');
    link.href = '/assets/res/sample.csv';
    link.download = 'sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFile = () => {
    fileInputRef.current?.click();
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!importedFile) {
      alert('Aucun fichier sélectionné.');
      return;
    }

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
        if (onCreate) {
          onCreate();
        }
      } else {
        alert("Erreur lors du stockage du fichier");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors du stockage du fichier");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--popup-color)] flex items-center justify-center z-50">
      <div className="w-[300px]">
        <Card variant="default" className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Import CSV</h3>
            <Button variant="action_sq_warn" onClick={onClose}>
              <XIcon size={24} />
            </Button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".csv,text/csv"
          />
          <div>
            <p className={`mb-1 ${textStyles.default}`}>Fichier exemple</p>
            <Button variant="default" onClick={handleExportSampleFile}>
              <p className={textStyles.defaultWhite}>Télécharger</p>
            </Button>
          </div>
          <form onSubmit={handleValidate} className="space-y-4 mt-4">
            <div>
              <p className={`mb-1 ${textStyles.default}`}>Fichier à importer</p>
              <div className={`flex flex-col space-y-2 ${listboxStyles.default}`}>
                <div className="max-h-[80px] overflow-y-auto border rounded-[12.5px]">
                  {importedFile ? (
                    <div className="flex items-center justify-between p-2">
                      <span className={textStyles.default}>{importedFile.name}</span>
                      <Button variant="cancel_action_sq" onClick={handleRemoveFile}>
                        <DashIcon size={16} />
                      </Button>
                    </div>
                  ) : (
                    <Card variant="empty_list">
                      <p className="text-center text-gray-600">Aucun fichier sélectionné.</p>
                    </Card>
                  )}
                </div>
                <Button variant="default" type="button" onClick={handleImportFile}>
                  <p className={textStyles.defaultWhite}>Importer</p>
                </Button>
              </div>
            </div>
            <div className="flex justify-center pt-2">
              <Button
                variant={!importedFile ? "disabled" : "default"}
                type="submit"
                disabled={!importedFile}
              >
                <p className={textStyles.defaultWhite}>Traiter</p>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
