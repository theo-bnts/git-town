'use client';

import React, { useState, useRef } from 'react';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { DashIcon, XIcon } from '@primer/octicons-react';
import { textStyles, listboxStyles } from '@/app/styles/tailwindStyles';
import ComboBox from '@/app/components/ui/combobox/ComboBox';
import RejectListBox from '@/app/components/ui/listbox/RejectListBox';
import useCsvRejects from '@/app/hooks/useCsvRejects';
import { useNotification } from '@/app/context/NotificationContext';

export default function ImportModal({
  isOpen,
  title,
  onClose,
  onImport,
  // champs dynamiques
  fields = [], // [{ label, options, value, onSelect, placeholder? }]
  // parsing & traitement métier
  csvParser,      // async (File) => { isValid, rows, rejectCsv }
  processRows,    // async (rows, setProgress) => Array<rejectObj>
  // config
  rejectType,
  sampleFileName,
}) {
  const notify = useNotification();
  const { files: rejectFiles, saveRejectCsv, deleteRejectFile, download } =
    useCsvRejects(rejectType);

  const fileInputRef = useRef(null);
  const [importedFile, setImportedFile] = useState(null);
  const [rowsData, setRowsData] = useState([]);
  const [isValidated, setIsValidated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const reset = () => {
    setImportedFile(null);
    setRowsData([]);
    setIsValidated(false);
    setProgress(0);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv'))
      return notify('Veuillez choisir un fichier CSV', 'error');

    try {
      const { isValid, rows, rejectCsv } = await csvParser(file);
      if (!isValid) {
        await saveRejectCsv(rejectCsv);
        notify('Fichier rejeté : données invalides', 'error');
        reset();
        return;
      }
      setImportedFile(file);
      setRowsData(rows);
      setIsValidated(true);
      notify('CSV valide : prêt à être importé', 'success');
    } catch (err) {
      notify(err.message || 'Erreur lors du traitement du CSV', 'error');
    }
  }

  async function handleValidate(e) {
    e.preventDefault();
    if (!importedFile) return notify('Aucun fichier sélectionné', 'error');
    if (!isValidated || rowsData.length === 0)
      return notify('Rien à traiter', 'error');
    if (fields.some(f => !f.value?.id))
      return notify('Veuillez renseigner tous les champs', 'error');

    setIsProcessing(true);
    setProgress(0);

    try {
      const rejects = await processRows(rowsData, setProgress);

      if (rejects.length) {
        // reconstruction sécurisée du CSV de rejets
        const header = Object.keys(rejects[0]);
        const lines = [header.join(',')];
        const q = s => `"${String(s).replace(/"/g, '""')}"`;
        rejects.forEach(r => {
          lines.push(header.map(h => q(r[h])).join(','));
        });
        const csv = lines.join('\n');
        await saveRejectCsv(csv);
        notify('Import terminé : certaines lignes ont échoué', 'error');
      } else {
        notify('Import terminé avec succès', 'success');
        onImport?.();
      }
    } catch (err) {
      notify(err.message || 'Erreur inattendue', 'error');
    } finally {
      setIsProcessing(false);
      reset();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--popup-color)] flex items-center justify-center z-50">
      <div className="w-[300px]">
        <Card variant="default" className="relative p-6 space-y-4">
          <header className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{title}</h3>
            <Button variant="action_icon_warn" onClick={onClose}>
              <XIcon size={24} />
            </Button>
          </header>

          {/* champs dynamiques */}
          {fields.map(({ label, placeholder = label, options, value, onSelect }) => (
            <div key={label}>
              <p className={`mb-1 ${textStyles.default}`}>{label}</p>
              <ComboBox
                placeholder={placeholder}
                options={options}
                value={value}
                onSelect={onSelect}
              />
            </div>
          ))}

          {/* anciens rejets */}
          <div>
            <p className={`mb-1 ${textStyles.default}`}>Anciens rejets</p>
            <RejectListBox
              files={rejectFiles}
              onDownload={download}
              onDelete={deleteRejectFile}
            />
          </div>

          {/* échantillon */}
          {sampleFileName && (
            <div>
              <p className={`mb-1 ${textStyles.default}`}>Fichier exemple</p>
              <a
                href={`/assets/res/${sampleFileName}`}
                download={sampleFileName}
                className="block"
              >
                <Button variant="default">
                  <p className={textStyles.defaultWhite}>Télécharger</p>
                </Button>
              </a>
            </div>
          )}

          {/* sélection du CSV */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <div>
            <p className={`mb-1 ${textStyles.default}`}>Fichier à importer</p>
            <div className={`flex flex-col space-y-2 ${listboxStyles.default}`}>
              <div className="max-h-[80px] overflow-y-auto border rounded-[12.5px]">
                {importedFile ? (
                  <div className="flex items-center justify-between p-2">
                    <span className={textStyles.default}>{importedFile.name}</span>
                    <Button variant="action_icon_warn" onClick={reset}>
                      <DashIcon size={16} />
                    </Button>
                  </div>
                ) : (
                  <Card variant="empty_list">
                    <p className="text-center text-gray-600">
                      Aucun fichier sélectionné.
                    </p>
                  </Card>
                )}
              </div>
              <Button
                type="button"
                variant={!importedFile ? 'default' : 'disabled'}
                onClick={() => fileInputRef.current?.click()}
                disabled={!!importedFile}
              >
                <p className={textStyles.defaultWhite}>Importer</p>
              </Button>
            </div>
          </div>

          {/* barre de progression */}
          {isProcessing && (
            <div className="w-full bg-gray-300 rounded-full h-2.5 mt-2">
              <div
                className="bg-[var(--accent-color)] h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* bouton de traitement */}
          <div className="flex justify-center pt-2">
            <Button
              type="button"
              variant={!importedFile || isProcessing ? 'disabled' : 'default'}
              onClick={handleValidate}
              disabled={!importedFile || isProcessing}
            >
              <p className={textStyles.defaultWhite}>
                {isProcessing ? 'En cours…' : 'Traiter'}
              </p>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
